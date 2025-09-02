import { Routes } from '@angular/router';
import {InscriptionComponent} from "./components/auth/inscription/inscription.component";
import {ConnexionComponent} from "./components/auth/connexion.component";
import {SingleComponent} from "./components/single/single/single.component";
import {SinglepageComponent} from "./components/singlepage/singlepage.component";

export const routes: Routes = [
  // public
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent},
  { path: 'inscription', component: InscriptionComponent},
  { path: 'home', component: SingleComponent},
  { path: 'homepage', component: SinglepageComponent},

  { path: '**', component: InscriptionComponent},

];
