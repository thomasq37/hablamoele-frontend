import { Component } from '@angular/core';
import {MenuComponent} from "./menu/menu.component";
import {HeroComponent} from "./hero/hero.component";
import {AboutComponent} from "./about/about.component";
import {ServicesComponent} from "./services/services.component";
import {ReservationsComponent} from "./reservations/reservations.component";
import {RecursosComponent} from "./recursos/recursos.component";
import {ContactComponent} from "./contact/contact.component";

@Component({
  selector: 'app-singlepage',
  standalone: true,
  imports: [
    MenuComponent,
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    ReservationsComponent,
    RecursosComponent,
    ContactComponent
  ],
  templateUrl: './singlepage.component.html',
  styleUrl: './singlepage.component.scss'
})
export class SinglepageComponent {

  allerAItemSectionner(itemSelectionne: string) {
    const element = document.getElementById(itemSelectionne);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
