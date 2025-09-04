import { Routes } from '@angular/router';
import {InscriptionComponent} from "./components/auth/inscription/inscription.component";
import {ConnexionComponent} from "./components/auth/connexion.component";
import {SinglepageComponent} from "./components/singlepage/singlepage.component";
import {RecursosAjouterComponent} from "./components/admin/recursos/recursos-ajouter/recursos-ajouter.component";
import {AuthGuard} from "./guards/auth.guard";
import {AdminDashboardComponent} from "./components/admin/admin-dashboard/admin-dashboard.component";
import {RecursosListerComponent} from "./components/admin/recursos/recursos-lister/recursos-lister.component";
import {RecursosModifierComponent} from "./components/admin/recursos/recursos-modifier/recursos-modifier.component";

export const routes: Routes = [
  // public
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent},
  { path: 'inscription', component: InscriptionComponent},
  { path: 'homepage', component: SinglepageComponent},
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin-recursos-añadir', component: RecursosAjouterComponent, canActivate: [AuthGuard] },
  { path: 'admin-recursos-modificar/:id', component: RecursosModifierComponent, canActivate: [AuthGuard] },
  { path: 'admin-recursos-listar', component: RecursosListerComponent, canActivate: [AuthGuard] },

  { path: '**', component: InscriptionComponent},

];
