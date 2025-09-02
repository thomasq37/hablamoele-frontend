import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  protected menuEstOuvert = false;
  @Output() itemSelected = new EventEmitter();
  protected grandEcran = window.innerWidth >= 992; // true si grand écran

  @HostListener('window:resize')
  onResize() {
    this.grandEcran = window.innerWidth >= 992;
  }

  toggleMenu(): void {
    this.menuEstOuvert = !this.menuEstOuvert;
  }
  emitItemSelected(item: string) {
    this.itemSelected.emit(item);
    this.menuEstOuvert = false
  }
}
