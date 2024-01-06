import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClarityIcons, cogIcon } from '@cds/core/icon';
import { AuthService } from 'src/app/services/auth.service';

// AGREGAR ICONOS
ClarityIcons.addIcons(cogIcon);

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private authService: AuthService, private _router: Router) {}

  login() {
    this.authService.loginWithGoogle().then(()=> {
      this._router.navigate(['/home']);
    })
  }

}
