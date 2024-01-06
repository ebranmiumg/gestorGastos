import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userName: string | null = null;
  public userUID: string | null = null;

  constructor(private auth: Auth) { }


  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      this.userName = result.user.displayName;
      this.userUID = result.user.uid;
      console.log(this.userUID);

      // Aquí manejas el resultado del inicio de sesión.
    } catch (error) {
      console.error(error);
      // Aquí manejas los errores.
    }
  }

  // Método para cerrar sesión
  async logout() {
    try {
      await signOut(this.auth);
      // Limpia cualquier dato del usuario almacenado localmente aquí, como UID o nombre
      this.userName = null;
      this.userUID = null;
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  }
}
