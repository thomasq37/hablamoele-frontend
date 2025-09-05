import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DownloaderService {

  downloadBase64Pdf(base64OrDataUrl: string, nomFichier: string): void {
    try {
      const dataUrl = this.ensureDataUrl(base64OrDataUrl, 'application/pdf');
      const base64Data = dataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: 'application/pdf' });

      if (this.isMobile()) {
        if (!this.tryMobileDownload(blob, nomFichier)) {
          this.tryDataUrlDownload(dataUrl, nomFichier);
        }
      } else {
        this.downloadForDesktop(blob, nomFichier);
      }
    } catch (e) {
      console.error('Erreur downloadBase64Pdf:', e);
      this.fallbackOpenInNewTab(base64OrDataUrl, nomFichier);
    }
  }

  private ensureDataUrl(src: string, mime: string): string {
    if (src.startsWith('data:')) return src;
    return `data:${mime};base64,${src}`; // on normalise en data URL si c’est juste du b64
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private downloadForDesktop(blob: Blob, nomFichier: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private tryMobileDownload(blob: Blob, nomFichier: string): boolean {
    try {
      const a = document.createElement('a');
      if ('download' in a) {
        const url = URL.createObjectURL(blob);
        a.style.display = 'none';
        a.href = url;
        a.download = nomFichier;
        document.body.appendChild(a);
        setTimeout(() => {
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }, 10);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private tryDataUrlDownload(dataUrl: string, nomFichier: string): void {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = dataUrl;
    a.download = nomFichier;
    document.body.appendChild(a);

    if ('ontouchstart' in window) {
      const touchEvent = new TouchEvent('touchstart', { bubbles: true });
      a.dispatchEvent(touchEvent);
    }

    a.click();
    document.body.removeChild(a);
  }

  private fallbackOpenInNewTab(base64OrDataUrl: string, nomFichier: string): void {
    const dataUrl = this.ensureDataUrl(base64OrDataUrl, 'application/pdf');
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>${nomFichier}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h3>Téléchargement de: ${nomFichier}</h3>
            <a href="${dataUrl}" download="${nomFichier}"
               style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
              Cliquez ici pour télécharger
            </a>
            <script>
              setTimeout(function(){
                var a = document.createElement('a');
                a.href='${dataUrl}';
                a.download='${nomFichier}';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }, 500);
            </script>
          </body>
        </html>
      `);
      w.document.close();
    } else {
      // popup bloqué
      navigator.clipboard?.writeText(dataUrl).catch(()=>{});
      alert('Le téléchargement a échoué. Le lien data a été copié dans le presse-papiers.');
    }
  }
}
