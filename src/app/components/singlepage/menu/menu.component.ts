import { Component, EventEmitter, HostListener, Inject, Output, PLATFORM_ID } from '@angular/core';
import { NgIf } from "@angular/common";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  protected menuEstOuvert = false;
  @Output() itemSelected = new EventEmitter();
  protected grandEcran = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.grandEcran = window.innerWidth >= 992;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.grandEcran = window.innerWidth >= 992;
    }
  }

  toggleMenu(): void {
    this.menuEstOuvert = !this.menuEstOuvert;
  }

  emitItemSelected(item: string) {
    this.itemSelected.emit(item);
    this.menuEstOuvert = false;
  }
}
