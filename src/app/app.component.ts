import { Component } from '@angular/core';
import { ClarityIcons, homeIcon, userIcon, dollarBillIcon, administratorIcon, piggyBankIcon, cogIcon } from '@cds/core/icon';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

// AGREGAR ICONOS
ClarityIcons.addIcons(userIcon, homeIcon, dollarBillIcon, administratorIcon, piggyBankIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GestorGastos2023';
  collapsed = true;

  constructor(private authService: AuthService, private _router: Router) {}

  toggleNav() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    this.authService.logout().then(() => {
      this._router.navigate(['/login']); // Redirige después del cierre de sesión
    });
  }
}
