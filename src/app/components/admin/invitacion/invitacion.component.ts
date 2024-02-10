import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  DocumentReference,
  Firestore,
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Grupo } from 'src/app/models/grupo.model';
import { GruposService } from 'src/app/services/grupos.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-invitacion',
  templateUrl: './invitacion.component.html',
  styleUrls: ['./invitacion.component.scss'],
})
export class InvitacionComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  public userName: string | null = null;
  public userUID: string | null = null;
  grupoAddModel: Grupo = {
    codigoUnico: '',
    nombreGrupo: '',
    integrantes: [],
    uidCreador: '',
    grupoCategoria: '',
  };
  constructor(
    private route: ActivatedRoute,
    private auth: Auth,
    private router: Router,
    private grupoService: GruposService,
    private authService: AuthService
  ) {
    this.route.paramMap.subscribe((params) => {
      const codigo = params.get('codigo');
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          // Usuario está logueado
          this.userName = user.displayName;
          this.userUID = user.uid;
          console.log(this.userName);
          this.joinGroup(codigo);
        } else {
          // Usuario no está logueado
          this.userName = null;
          this.userUID = null;
          this.router.navigate(['/login']);
        }
      });

    });

  }

  ngOnInit() {

  }

  async joinGroup(codigo: string | null) {
    if (!codigo) {
      console.log('Código de invitación no proporcionado.');
      return;
    }

    console.log(this.userName);

    if (!this.userName) {
      // Redireccionar al login o mostrar mensaje
      this.router.navigate(['/login'] , { queryParams: { s: 'gA1' } });
      return;
    }
    console.log(
      `Uniendo al usuario ${this.userName} al grupo con código ${codigo}.`
    );

    // Busca el grupo con el código dado
    const grupoRef = collection(this.firestore, 'Grupos');
    const q = query(grupoRef, where('codigoUnico', '==', codigo));
    const querySnapshot = await getDocs(q);

    // Verifica si el grupo existe
    if (querySnapshot.empty) {
      console.log('Grupo no encontrado.');
      this.router.navigate(['/home/admin/grupos']), { queryParams: { s: 'gA2' } };
      // Manejar el caso de que el grupo no exista, por ejemplo, mostrando un mensaje de error
      return;
    }

    // Obtén la referencia al documento del grupo
    let grupoDocRef;
    querySnapshot.forEach((doc) => {
      // Suponiendo que 'codigoUnico' es único, debería haber solo un documento
      grupoDocRef = doc.ref;
    });

    if (grupoDocRef) {
      // Obtén el documento del grupo
      const grupoDoc = await getDoc(grupoDocRef);

      if (grupoDoc.exists()) {
        // Revisa si el usuario ya es un integrante
        const grupoData = grupoDoc.data() as Grupo;  // Aserción de tipo aquí
        const integrantes = grupoData.integrantes;
        const yaEsMiembro = integrantes.some(
          (integrante) => integrante.uidIntegrante === this.userUID
        );

        if (yaEsMiembro) {
          console.log('El usuario ya es miembro del grupo.');
          this.router.navigate(['/home/admin/grupos'], { queryParams: { s: 'gA3' } });
          // Manejar el caso, por ejemplo, redirigiendo al usuario a la página del grupo o mostrando un mensaje
          return;
        }

        // Si no es miembro, procede a agregarlo al grupo
        await updateDoc(grupoDocRef, {
          integrantes: arrayUnion({
            uidIntegrante: this.userUID,
            nombreIntegrante: this.userName, // O como obtengas el nombre del usuario
          }),
        });

        // Redirige al usuario a la página del grupo o muestra un mensaje de éxito
        console.log('Usuario añadido al grupo exitosamente.');
        this.router.navigate(['/home/admin/grupos'], { queryParams: { s: 'gA4' } });
      } else {
        console.log('no existe el codigo del grupo');

      }
    }
  }
}
