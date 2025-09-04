// server.ts - Version corrigée basée sur votre ancien serveur qui fonctionne
import 'dotenv/config';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express, { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// ====== Dépendances backend ======
import bodyParser from 'body-parser';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import SMTPTransport from "nodemailer/lib/smtp-transport";

// ====== Stripe ======
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] as string, {
  apiVersion: '2025-08-27.basil',
});

// ====== Google OAuth ======
const oauth2ClientCalendar = new google.auth.OAuth2(
  process.env['GOOGLE_CLIENT_ID'],
  process.env['GOOGLE_CLIENT_SECRET'],
  'https://developers.google.com/oauthplayground'
);
oauth2ClientCalendar.setCredentials({
  refresh_token: process.env['GOOGLE_REFRESH_TOKEN'],
});

const oauth2ClientGmail = new google.auth.OAuth2(
  process.env['GOOGLE_CLIENT_ID'],
  process.env['GOOGLE_CLIENT_SECRET'],
  'https://developers.google.com/oauthplayground'
);
oauth2ClientGmail.setCredentials({
  refresh_token: process.env['GOOGLE_REFRESH_TOKEN_SMTP'],
});

async function createTransporter() {
  const accessToken = await oauth2ClientGmail.getAccessToken();
  const options: SMTPTransport.Options = {
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env['GOOGLE_SMTP_USER'],
      clientId: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
      refreshToken: process.env['GOOGLE_REFRESH_TOKEN_SMTP'],
      accessToken: accessToken?.token || undefined,
    },
  };
  return nodemailer.createTransport(options);
}

const calendar = google.calendar({ version: 'v3', auth: oauth2ClientCalendar });

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // ======= Redirection HTTPS =======
  server.use((req: Request, res: Response, next: NextFunction) => {
    if (req.header('x-forwarded-proto') !== 'https' && process.env['NODE_ENV'] === 'production') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });

  // ======= Static public =======
  server.use(express.static('public'));

  // ======= Stripe Webhook (AVANT express.json()) =======
  server.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env['STRIPE_WEBHOOK_SECRET'] as string);
    } catch (err: any) {
      console.log(`Erreur de vérification du webhook:`, err.message);
      return res.status(400).send(`Erreur Webhook: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const formDataRaw = session.metadata?.['formData'];
      const eventsMetadataRaw = session.metadata?.['eventsMetadata'];
      const formData = formDataRaw ? JSON.parse(formDataRaw) : {};
      const eventsMetadata: Array<{ start_time: string; end_time: string }> =
        eventsMetadataRaw ? JSON.parse(eventsMetadataRaw) : [];

      const eventsWithLinks: Array<{ start_time: string; end_time: string; googleMeetLink: string }> = [];
      for (const eventMetadata of eventsMetadata) {
        const googleMeetLink = await createGoogleCalendarEvent(formData, eventMetadata);
        eventsWithLinks.push({ ...eventMetadata, googleMeetLink });
      }

      await sendConfirmationEmail(formData, eventsMetadata, false, eventsWithLinks);
    }

    return res.status(200).json({ received: true });
  });

  // ======= JSON pour les autres routes =======
  server.use(express.json({ limit: '1mb' }));

  // ======= API Endpoints =======
  server.get('/stripe-key', (req: Request, res: Response) => {
    res.json({ publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] });
  });

  server.post('/create-free-session', async (req: Request, res: Response) => {
    const { formData, eventsMetadata } = req.body;
    try {
      const eventsWithLinks: Array<{ start_time: string; end_time: string; googleMeetLink: string }> = [];
      for (const eventMetadata of eventsMetadata) {
        const googleMeetLink = await createGoogleCalendarEvent(formData, eventMetadata);
        eventsWithLinks.push({ ...eventMetadata, googleMeetLink });
      }
      await sendConfirmationEmail(formData, eventsMetadata, true, eventsWithLinks);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Erreur session gratuite:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  server.get('/check-payment-status', async (req: Request, res: Response) => {
    const { session_id } = req.query as { session_id?: string };
    try {
      if (!session_id) return res.status(400).json({ success: false, error: 'session_id manquant' });
      const session = await stripe.checkout.sessions.retrieve(session_id);
      return res.json({ success: session.payment_status === 'paid' });
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      return res.status(500).json({ success: false, error: 'Erreur de vérification du paiement' });
    }
  });

  server.post('/create-checkout-session', async (req: Request, res: Response) => {
    const { items, formData, eventsMetadata } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: `${process.env['HOST']}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env['HOST']}`,
      metadata: {
        formData: JSON.stringify(formData || {}),
        eventsMetadata: JSON.stringify(eventsMetadata || []),
      },
    });
    res.json({ id: session.id });
  });

  server.get('/google-api-key', (req: Request, res: Response) => {
    res.json({
      apiKey: process.env['GOOGLE_CALENDAR_APIKEY'],
      calendarId: process.env['GOOGLE_CALENDAR_ID'],
    });
  });

  server.get('/unit-amount', (req: Request, res: Response) => {
    res.json({ unitAmount: process.env['UNIT_AMOUNT'] });
  });

  server.post('/submit-contact', async (req: Request, res: Response) => {
    const { name, email, comment } = req.body;
    if (!name || !email || !comment) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    try {
      const transporter = await createTransporter();
      const mailOptions = {
        from: process.env['GOOGLE_SMTP_USER'],
        to: process.env['GOOGLE_SMTP_USER'],
        subject: 'Nuevo mensaje de contacto',
        html: `
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Message :</strong></p>
          <p>${comment}</p>
        `,
      };
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: 'Message envoyé avec succès!' });
    } catch (error) {
      console.error("Erreur envoi contact:", error);
      return res.status(500).json({ success: false, message: "Erreur lors de l'envoi du message." });
    }
  });

  // ✅ IMPORTANT: Comme dans votre ancien serveur qui fonctionne
  // Servir les fichiers statiques AVANT les routes Angular
  server.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));

  // Sitemap spécifique si nécessaire
  server.get('/sitemap.xml', (req, res) => {
    res.sendFile(join(browserDistFolder, 'sitemap.xml'));
  });

  // ✅ Routes Angular SSR (en dernier, comme dans votre ancien serveur)
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const PORT = process.env['PORT'] || 4000;
  const server = app();
  server.listen(PORT, () => {
    console.log(`Node Express server listening on http://localhost:${PORT}`);
  });
}

run();

// ============= Helper Functions =============
async function createGoogleCalendarEvent(
  formData: any,
  eventMetadata: { start_time: string; end_time: string }
): Promise<string> {
  function adjustTime(isoString: string) {
    const date = new Date(isoString);
    date.setHours(date.getHours() - 2);
    return date.toISOString();
  }

  const adjustedStartTime = adjustTime(eventMetadata.start_time);
  const adjustedEndTime = adjustTime(eventMetadata.end_time);

  const googleEvent = {
    summary: `Clase de ${formData?.courseType ?? ''} - ${formData?.name ?? ''}`,
    description: `Nivel: ${formData?.level ?? ''}\nTema: ${formData?.topic ?? ''}\nObjetivos: ${formData?.goals ?? ''}`,
    start: { dateTime: adjustedStartTime, timeZone: 'Europe/Madrid' },
    end: { dateTime: adjustedEndTime, timeZone: 'Europe/Madrid' },
    conferenceData: {
      createRequest: {
        requestId: 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: googleEvent,
    conferenceDataVersion: 1,
  });

  return (
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
    data.conferenceData?.entryPoints?.[0]?.uri ||
    ''
  );
}

async function sendConfirmationEmail(
  formData: any,
  _eventsMetadata: Array<{ start_time: string; end_time: string }>,
  isFreeSession: boolean,
  eventsWithLinks: Array<{ start_time: string; end_time: string; googleMeetLink: string }>
) {
  const transporter = await createTransporter();

  function formatDateToSpanish(isoString: string) {
    const date = new Date(isoString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${day} de ${months[month]}`;
  }

  function formatTimeRange(startIso: string, endIso: string) {
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    const startHour = startDate.getUTCHours();
    const endHour = endDate.getUTCHours();
    return `de ${startHour}h a ${endHour}h`;
  }

  const classDetailsList = eventsWithLinks
    .map((event) => {
      const formattedDate = formatDateToSpanish(event.start_time);
      const formattedTime = formatTimeRange(event.start_time, event.end_time);

      let courseSpecificContent: string;
      if (formData?.courseType === 'tematicos') {
        courseSpecificContent = `
          <p style="font-size: 13px; text-transform: uppercase; font-weight: bold; color: grey; margin-bottom: 5px">Temática</p>
          <p style="font-size: 13px; margin-top: 5px">${formData?.topic ?? ''}</p>
        `;
      } else {
        courseSpecificContent = `
          <p style="font-size: 13px; text-transform: uppercase; font-weight: bold; color: grey; margin-bottom: 5px">Nivel</p>
          <p style="text-transform:uppercase;font-size: 13px; margin-top: 5px">${formData?.level ?? ''}</p>
        `;
      }

      return `
        <p style="font-size: 13px; text-transform: uppercase; font-weight: bold; color: grey; margin-bottom: 5px">Fecha y hora</p>
        <p style="font-size: 13px; margin-top: 5px">${formattedDate} ${formattedTime}</p>
        <p style="font-size: 13px; text-transform: uppercase; font-weight: bold; color: grey; margin-bottom: 5px">Tipo de curso</p>
        <p style="font-size: 13px; margin-top: 5px">${formData?.courseType ?? ''}</p>
        ${courseSpecificContent}
        <p style="font-size: 13px; text-transform: uppercase; font-weight: bold; color: grey; margin-bottom: 5px">Tus objetivos</p>
        <p style="font-size: 13px; margin-top: 5px">${formData?.goals ?? ''}</p>
        <div>
          <a style="font-size: 14px; font-weight:bold;border-radius:5px;text-decoration: none; background-color: #ffdb67; color: white; padding: 10px; display: block; width: max-content" href="${event.googleMeetLink}">Unirse a Google Meet</a>
        </div>
      `;
    })
    .join('');

  const mailOptions = {
    from: process.env['GOOGLE_SMTP_USER'],
    to: formData?.mail,
    subject: isFreeSession ? 'Confirmación de clase de prueba gratuita' : 'Confirmación de reserva',
    html: `
      <div style="border: 7px solid #e2e2e2;font-family: arial,serif;">
        <div style="background-color: #ffdb67; padding: 15px; text-align: center">
          <img alt="logo" style="width: 80px" src="https://gestion-photos.s3.eu-north-1.amazonaws.com/logo.png">
        </div>
        <div style="padding: 0 13px 10px;">
          <h1 style="font-weight: bold;text-align: center;font-size: 15px;margin-top: 20px;letter-spacing: 1px;">¡Gracias por su reserva!</h1>
          <p style="font-family: arial,serif;font-size: 13px;text-align: center">Su reserva está confirmada y estamos preparando todo para su clase. A continuación encontrará los detalles de su reserva.</p>
          <p style="font-size: 13px">📚 Sesiones individuales para un aprendizaje eficaz</p>
          <p style="font-size: 13px">🧩 Un enfoque personalizado para cada alumno/a</p>
          <p style="font-size: 13px">✅ Un seguimiento regular para garantizar su progreso</p>
          <p style="font-size: 13px">🕦 Horarios flexibles, adaptados a su disponibilidad</p>
          <p style="font-size: 13px">En resumen, cursos en línea adaptados a sus expectativas para progresar rápidamente y en las mejores condiciones. 👍</p>
          <h2 style="font-weight: bold;text-align: center;font-size: 15px;margin: 20px 0;letter-spacing: 1px;">Detailles de las clases :</h2>
          ${classDetailsList}
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado con éxito:', result);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}
