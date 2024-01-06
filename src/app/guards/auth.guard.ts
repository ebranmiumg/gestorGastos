import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Promise<boolean> | boolean {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          resolve(true);  // Usuario está logueado, permite acceso a la ruta
        } else {
          this.router.navigate(['/login']);  // No logueado, redirecciona al login
          resolve(false); // Denegar acceso a la ruta
        }
      });
    });
  }
}
