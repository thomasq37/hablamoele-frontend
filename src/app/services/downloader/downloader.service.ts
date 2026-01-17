import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DownloaderService {
  download(url: string): void {
    console.log(url);
    const fullUrl = `https://hablamosele.s3.eu-north-1.amazonaws.com/${url}`;
    window.open(fullUrl, '_blank');
  }
}
