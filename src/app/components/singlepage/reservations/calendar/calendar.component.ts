import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID, OnInit
} from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';

type Slot = { start: Date; end: Date };

@Component({
  selector: 'app-calendar',
  standalone: true,
  template: `<full-calendar *ngIf="isBrowser" [options]="calendarOptions"></full-calendar>`,
  imports: [FullCalendarModule, NgIf]
})
export class CalendarComponent implements OnInit {
  @Input() googleApiKey!: string;
  @Input() calendarId!: string;
  @Output() slotToggled = new EventEmitter<Slot>();

  isBrowser = false;
  calendarOptions: CalendarOptions = {};
  selectedEvents: EventInput[] = [];
  private recentEvent = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    this.calendarOptions = {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        googleCalendarPlugin
      ],
      initialView: 'timeGridWeek',
      locale: 'es',
      firstDay: 1,
      allDaySlot: false,
      slotMinTime: '09:00:00',
      slotMaxTime: '21:00:00',
      slotDuration: '01:00:00',
      slotLabelInterval: { hours: 1 },
      slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      scrollTime: '09:00:00',
      timeZone: 'Europe/Madrid', // ou 'Europe/Paris' selon ton cas
      googleCalendarApiKey: this.googleApiKey,
      longPressDelay: 1,
      eventSources: [
        {
          googleCalendarId: 'hablamoseleonline@gmail.com',  // Remplace par l'ID de ton calendrier Google
          className: 'gcal-event',  // Appliquer une classe pour styler les événements Google
          eventDataTransform: function(eventData) {
            eventData.title = 'Reservado';
            eventData.url = '';
            return eventData;
          }
        },
      ],
      events: (info, successCallback) => {
        successCallback([
          { googleCalendarId: this.calendarId },
          ...this.selectedEvents
        ]);
      },

      selectable: true,
      selectMirror: false,
      unselectAuto: false,
      validRange: {
        start: new Date() // ← interdit les sélections dans le passé
      },
      select: (info) => {
        const start = info.start;
        const end = info.end;
        const id = start + '|' + end;

        const alreadyExists = this.selectedEvents.find(e => e.id === id);
        if (!alreadyExists) {
          this.selectedEvents.push({
            id,
            title: 'Espera',
            start: info.start.toISOString(), // ISO direct
            end: info.end.toISOString(),
            backgroundColor: '#1e88e5',
            borderColor: '#1e88e5'
          });
          info.view.calendar.refetchEvents();
        }

        this.recentEvent = true;
        setTimeout(() => (this.recentEvent = false), 500);

        this.slotToggled.emit({ start, end }); // ✅ SLOT TYPÉ
      },

      eventClick: (info) => {
        if (this.recentEvent) return;

        const start = info.event.start;
        const end = info.event.end;
        if (!start || !end) return;

        const id = info.event.id;
        this.selectedEvents = this.selectedEvents.filter(e => e.id !== id);
        info.event.remove();

        this.slotToggled.emit({ start, end }); // ✅ SLOT TYPÉ
      }
    };
  }
}
