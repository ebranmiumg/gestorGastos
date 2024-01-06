import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userName: string | null = null;
  public userUID: string | null = null;

  constructor(private auth: Auth) { 
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // Usuario está logueado
        this.userName = user.displayName;
        this.userUID = user.uid;
      } else {
        // Usuario no está logueado
        this.userName = null;
        this.userUID = null;
      }
    });
  }


  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      console.log(result);

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
