import { Component, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, collectionData, doc, getDoc, getDocs, orderBy, query, where,  } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Grupo } from 'src/app/models/grupo.model';
import { AuthService } from 'src/app/services/auth.service';
import { GruposService } from 'src/app/services/grupos.service';
import { ClarityIcons, shareIcon } from '@cds/core/icon';


// AGREGAR ICONOS
ClarityIcons.addIcons(shareIcon);

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.scss']
})
export class GruposComponent {
  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  grupoAddModel: Grupo = { codigoUnico:'', nombreGrupo: '', integrantes: [], uidCreador: ''};
  grupoModel: Observable<Grupo[]>;
  grupoVerModel: Grupo = { codigoUnico:'', nombreGrupo: '', integrantes: [], uidCreador: ''};


  // VARIABLES ALERTAS
  tipoAlerta: string = '';
  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';

  //VARIABLES MODALS
  crearModal = false;
  verModal = false;


  constructor(private grupoService: GruposService,
              private authService: AuthService,
              private activeRoute: ActivatedRoute){
    const grupoColllection = query(collection(this.firestore, 'Grupos'), orderBy('nombreGrupo','asc'));

    this.grupoModel = collectionData(grupoColllection) as Observable<Grupo[]>;

  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      console.log(params['s']); // Imprime el valor de parametro
      switch (params['s']) {
        case 'gA1':
            this.tipoAlerta = 'warning';
            this.mostrarAlerta = true;
            this.mensajeAlerta = 'Debe estar logueado para poder unirse a un grupo';
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

  verGrupoCollection(codigoGrupo: String) {
    console.log(codigoGrupo.toString());
    const gruposRef = collection(this.firestore, 'Grupos');
    const q = query(gruposRef, where('codigoUnico', '==', codigoGrupo));

    getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const documentos = querySnapshot.docs.map(doc => doc.data());
        console.log(documentos);
        this.grupoVerModel = querySnapshot.docs[0].data() as Grupo;
        // Aquí puedes hacer algo con los datos, como actualizar el estado o una variable
      } else {
        console.log("No se encontraron documentos con el código único proporcionado.");
      }
      // Cerrar modal después de recuperar los documentos
      this.crearModal = false;
    }).catch((error) => {
      console.error("Error al obtener documentos: ", error);
    });


    getDoc(doc(this.firestore, 'Grupos', codigoGrupo.toString())).then((docSnapshot)=>{
      console.log(docSnapshot);
      this.verModal = true;
    })

  }


  addGrupoCollection(){
    this.grupoAddModel.codigoUnico = this.grupoService.generateRandomCode(6);
    this.grupoAddModel.uidCreador = this.authService.userUID;
    addDoc(collection(this.firestore, 'Grupos'), this.grupoAddModel).then((documentReference: DocumentReference) => {
      console.log(documentReference);

      this.crearModal = false;
   })
  }

  // Método para copiar el texto
  copyText(text: String, event: MouseEvent) {
    event.stopPropagation();
    text = `http://localhost:4200/invite/${text}`;
    navigator.clipboard.writeText(text.toString()).then(() => {
      console.log("Texto copiado con éxito!");
      // Aquí puedes agregar alguna lógica adicional para notificar al usuario
    }).catch(err => {
      console.error('Algo salió mal al copiar el texto: ', err);
    });
  }
}
