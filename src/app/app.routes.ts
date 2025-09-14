import { Routes } from '@angular/router';
import {InscriptionComponent} from "./components/auth/inscription/inscription.component";
import {ConnexionComponent} from "./components/auth/connexion.component";
import {SinglepageComponent} from "./components/singlepage/singlepage.component";
import {RecursosAjouterComponent} from "./components/admin/recursos/recursos-ajouter/recursos-ajouter.component";
import {AuthGuard} from "./guards/auth.guard";
import {AdminDashboardComponent} from "./components/admin/admin-dashboard/admin-dashboard.component";
import {RecursosListerComponent} from "./components/admin/recursos/recursos-lister/recursos-lister.component";
import {RecursosModifierComponent} from "./components/admin/recursos/recursos-modifier/recursos-modifier.component";
import {NivelListerComponent} from "./components/admin/nivel/nivel-lister/nivel-lister.component";
import {NivelAjouterComponent} from "./components/admin/nivel/nivel-ajouter/nivel-ajouter.component";
import {NivelModifierComponent} from "./components/admin/nivel/nivel-modifier/nivel-modifier.component";
import {CategoriaModifierComponent} from "./components/admin/categoria/categoria-modifier/categoria-modifier.component";
import {CategoriaAjouterComponent} from "./components/admin/categoria/categoria-ajouter/categoria-ajouter.component";
import {CategoriaListerComponent} from "./components/admin/categoria/categoria-lister/categoria-lister.component";
import {
  EstadisticasComponent
} from "./components/admin/estadisticas/estadisticas-lista-descargar/estadisticas.component";
import {RecursosComponent} from "./components/singlepage/recursos/recursos.component";
import {NewsletterDashboardComponent} from "./components/admin/newsletter-dashboard/newsletter-dashboard.component";

export const routes: Routes = [
  // public
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent},
  { path: 'inscription', component: InscriptionComponent},
  { path: 'homepage', component: SinglepageComponent},
  { path: 'recursos', component: RecursosComponent},

  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },

  { path: 'admin-recursos-añadir', component: RecursosAjouterComponent, canActivate: [AuthGuard] },
  { path: 'admin-recursos-modificar/:id', component: RecursosModifierComponent, canActivate: [AuthGuard] },
  { path: 'admin-recursos-listar', component: RecursosListerComponent, canActivate: [AuthGuard] },

  { path: 'admin-niveles-añadir', component: NivelAjouterComponent, canActivate: [AuthGuard] },
  { path: 'admin-niveles-modificar/:id', component: NivelModifierComponent, canActivate: [AuthGuard] },
  { path: 'admin-niveles-listar', component: NivelListerComponent, canActivate: [AuthGuard] },

  { path: 'admin-categorias-añadir', component: CategoriaAjouterComponent, canActivate: [AuthGuard] },
  { path: 'admin-categorias-modificar/:id', component: CategoriaModifierComponent, canActivate: [AuthGuard] },
  { path: 'admin-categorias-listar', component: CategoriaListerComponent, canActivate: [AuthGuard] },
  { path: 'admin-estadisticas', component: EstadisticasComponent, canActivate: [AuthGuard] },
  { path: 'admin-newsletter', component: NewsletterDashboardComponent, canActivate: [AuthGuard] },

  { path: '**', component: InscriptionComponent},

];
