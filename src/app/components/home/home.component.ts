import { Component } from '@angular/core';
import { ClarityIcons, homeIcon, userIcon, dollarBillIcon, administratorIcon, piggyBankIcon, cogIcon } from '@cds/core/icon';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

// AGREGAR ICONOS
ClarityIcons.addIcons(userIcon, homeIcon, dollarBillIcon, administratorIcon, piggyBankIcon,cogIcon);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
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
