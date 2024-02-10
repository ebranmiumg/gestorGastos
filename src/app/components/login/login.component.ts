import { Component, inject } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
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
  private firestore: Firestore = inject(Firestore);

  constructor(private authService: AuthService, private _router: Router) {}

  async validarCategoriaPersonal(userUID: String) {
    // VALIDA SI EXISTE EL GRUPO DE CATEGORIA PERSONAL
    const grupoRef = collection(this.firestore, 'GrupoCategoria');
    const q = query(grupoRef, where('uidCreador', '==', userUID), where('nombreCatGrupo', '==', 'Personal'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No hay resultados');
      // SI NO EXISTE EL GRUPO DE CATEGORIA PERSONAL, LO CREA
      const grupoRef = collection(this.firestore, 'GrupoCategoria');
      const grupo = {
        nombreCatGrupo: 'Personal',
        uidCreador: userUID,
      };
      await addDoc(grupoRef, grupo);
    }

  }

  async login() {
    this.authService.loginWithGoogle().then(async ()=> {
      console.log(this.authService.userUID);
      await this.validarCategoriaPersonal(this.authService.userUID!).then(()=> {
        this._router.navigate(['/home']);
      });
    })
  }

}
