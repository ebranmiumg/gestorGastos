import { Component, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Grupo } from 'src/app/models/grupo.model';
import { AuthService } from 'src/app/services/auth.service';
import { GruposService } from 'src/app/services/grupos.service';
import { ClarityIcons, shareIcon, playIcon } from '@cds/core/icon';

// AGREGAR ICONOS
ClarityIcons.addIcons(shareIcon, playIcon);

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss'],
})
export class GruposComponent {
  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  grupoAddModel: Grupo = {
    codigoUnico: '',
    nombreGrupo: '',
    integrantes: [],
    uidCreador: '',
  };
  // grupoModel: Observable<Grupo[]>;
  grupoVerModel: Grupo = {
    codigoUnico: '',
    nombreGrupo: '',
    integrantes: [],
    uidCreador: '',
  };
  public grupoModel: Array<{ id: string; data: Grupo }> = [];

  // VARIABLES ALERTAS
  tipoAlerta: string = '';
  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';

  //VARIABLES MODALS
  crearModal = false;
  verModal = false;

  constructor(
    private grupoService: GruposService,
    private authService: AuthService,
    private activeRoute: ActivatedRoute
  ) {
    const grupoColllection = query(
      collection(this.firestore, 'Grupos'),
      orderBy('nombreGrupo', 'asc')
    );

    // Obtén los documentos y sus IDs
    getDocs(grupoColllection).then((querySnapshot) => {
      this.grupoModel = querySnapshot.docs.map((doc) => {
        // Aquí, doc.id te dará el ID del documento
        const data = doc.data() as Grupo; // Asegúrate de que el tipo de datos es correcto
        return { id: doc.id, data }; // Devuelve los datos del documento junto con su ID
      });
    });

    // this.grupoModel = collectionData(grupoColllection) as Observable<Grupo[]>;
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      console.log(params['s']); // Imprime el valor de parametro
      switch (params['s']) {
        case 'gA1':
          this.tipoAlerta = 'warning';
          this.mostrarAlerta = true;
          this.mensajeAlerta =
            'Debe estar logueado para poder unirse a un grupo';
          break;
        case 'gA2':
          this.tipoAlerta = 'danger';
          this.mostrarAlerta = true;
          this.mensajeAlerta = 'El grupo no existe. Verifique el código.';
          break;
        case 'gA3':
          this.tipoAlerta = 'danger';
          this.mostrarAlerta = true;
          this.mensajeAlerta = 'Ya exite a ese grupo. Verifique el codigo.';
          break;
        case 'gA4':
          this.tipoAlerta = 'success';
          this.mostrarAlerta = true;
          this.mensajeAlerta = 'Se ha unido al grupo exitosamente.';
          break;
        default:
          break;
      }
    });
  }

  async addGrupoByCode(codigoGrupo: String) {
    const gruposRef = collection(this.firestore, 'Grupos');
    const q = query(gruposRef, where('codigoUnico', '==', codigoGrupo));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('Grupo no encontrado.');
      return;
    }

    let grupoDocRef;
    querySnapshot.forEach((doc) => {
      // Suponiendo que 'codigoUnico' es único, debería haber solo un documento
      grupoDocRef = doc.ref;
    });

    if (grupoDocRef) {
      const grupoDoc = await getDoc(grupoDocRef);

      if (grupoDoc.exists()) {
        const grupoData = grupoDoc.data() as Grupo;
        const integrantes = grupoData.integrantes;
        const yaEsMiembro = integrantes.some(
          (integrante) => integrante.uidIntegrante === this.authService.userUID
        );

        if (yaEsMiembro) {
          this.tipoAlerta = 'warning';
          this.mostrarAlerta = true;
          this.mensajeAlerta = 'El usuario ya es miembro del grupo.';
          console.log('El usuario ya es miembro del grupo.');
          return;
        }

        await updateDoc(grupoDocRef, {
          integrantes: arrayUnion({
            uidIntegrante: this.authService.userUID,
            nombreIntegrante: this.authService.userName, // O como obtengas el nombre del usuario
          }),
        });

        // Obtén los documentos y sus IDs
        this.grupoModel = [];
        getDocs(
          query(
            collection(this.firestore, 'Grupos'),
            orderBy('nombreGrupo', 'asc')
          )
        ).then((querySnapshot) => {
          this.grupoModel = querySnapshot.docs.map((doc) => {
            // Aquí, doc.id te dará el ID del documento
            const data = doc.data() as Grupo; // Asegúrate de que el tipo de datos es correcto
            return { id: doc.id, data }; // Devuelve los datos del documento junto con su ID
          });
        });

        // ALERTA AGREGADO AL GRUPO
        this.tipoAlerta = 'success';
        this.mostrarAlerta = true;
        this.mensajeAlerta = 'Se ha unido al grupo exitosamente.';

        console.log('Se ha unido al grupo exitosamente.');
      } else {
        console.log('no existe el codigo del grupo');
      }
    }
  }

  verGrupoCollection(codigoGrupo: String) {
    console.log(codigoGrupo.toString());

    getDoc(doc(this.firestore, 'Grupos', codigoGrupo.toString())).then(
      (docSnapshot) => {
        console.log(docSnapshot.data());
        this.grupoVerModel = docSnapshot.data() as Grupo;
        this.verModal = true;
      }
    );
  }

  addGrupoCollection() {
    this.grupoAddModel.codigoUnico = this.grupoService.generateRandomCode(6);
    this.grupoAddModel.uidCreador = this.authService.userUID;
    addDoc(collection(this.firestore, 'Grupos'), this.grupoAddModel).then(
      (documentReference: DocumentReference) => {
        console.log(documentReference);

        this.crearModal = false;
      }
    );
  }

  // Método para copiar el texto
  copyText(text: String, event: MouseEvent) {
    event.stopPropagation();
    text = `http://localhost:4200/invite/${text}`;
    navigator.clipboard
      .writeText(text.toString())
      .then(() => {
        console.log('Texto copiado con éxito!');
        // Aquí puedes agregar alguna lógica adicional para notificar al usuario
      })
      .catch((err) => {
        console.error('Algo salió mal al copiar el texto: ', err);
      });
  }
}
