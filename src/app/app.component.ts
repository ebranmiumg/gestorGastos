import { Component } from '@angular/core';
import { ClarityIcons, homeIcon, userIcon, dollarBillIcon, administratorIcon, piggyBankIcon, cogIcon } from '@cds/core/icon';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

// AGREGAR ICONOS
ClarityIcons.addIcons(userIcon, homeIcon, dollarBillIcon, administratorIcon, piggyBankIcon,cogIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GestorGastos2023';
  collapsed = true;
  nombreUsuario:string | null = '';

  constructor(public authService: AuthService, private _router: Router) {
    this.nombreUsuario = this.authService.userName;
  }

  ngOnInit(){
    console.log(this.authService.userName);    
  }

  toggleNav() {
    this.collapsed = !this.collapsed;
  }

  logout() {
    this.authService.logout().then(() => {
      this._router.navigate(['/login']); 
    });
  }
}
