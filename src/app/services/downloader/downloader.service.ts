import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DownloaderService {
  download(url: string, filename?: string): void {
    const a = document.createElement('a');
    a.href = url;
    if (filename) {
      a.download = filename;
    }
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
