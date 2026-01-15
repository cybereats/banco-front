import { Routes } from '@angular/router';
import { LoginComponent } from './components/paginas/login/login.component';
import { MainComponent } from './components/paginas/main/main.component';
import { ProductosComponent } from './components/paginas/productos/productos.component';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: MainComponent, canActivate: [AuthGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard] },
  { path: 'account/:id', component: AccountDetailComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];
