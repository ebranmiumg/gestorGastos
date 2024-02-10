import { Component, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  orderBy,
  query,
  where,
  updateDoc,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from 'src/app/models/categoria.model';
import { GrupoCategoria } from 'src/app/models/grupoCategoria.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
})
export class CategoriaComponent {
  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  catAddModel: Categoria = { nombreGasto: '' ,orden: 0, tipoCategoria: '', usuario: '', grupo:'', fechaCreacion: new Date()};
  grupoCataAddModel: GrupoCategoria = { nombreCatGrupo: '', uidCreador: '' };
  uidUsuario: string = ''
  grupoId: String = ''

  catModel: Observable<Categoria[]>;
  public grupoCatModel: Array<{ id: string; data: GrupoCategoria }> = [];
  public catXGrupoModel: Array<{ id: string; data: Categoria }> = [];

  //VARIABLES MODALS
  crearModal = false;
  crearGrupoModal = false;
  verCategoriasXGrupoModal = false;


  constructor(private authService: AuthService) {
    this.uidUsuario = this.authService.userUID!;
    const catColllection = query(collection(this.firestore, 'Categoria'), where('usuario', '==', this.uidUsuario) ,orderBy('orden','asc'));
    this.catModel = collectionData(catColllection) as Observable<Categoria[]>;

    const grupoCatColllection = query(collection(this.firestore, 'GrupoCategoria'), where('uidCreador', '==', this.uidUsuario));
    getDocs(grupoCatColllection).then((querySnapshot) => {
      this.grupoCatModel = querySnapshot.docs.map((doc) => {
        // Aquí, doc.id te dará el ID del documento
        const data = doc.data() as GrupoCategoria;
        return { id: doc.id, data }; // Devuelve los datos del documento junto con su ID
      });
    });
  }

  getCategoriasGrupo(grupoId: String, openModal: boolean = false){
    // Obtén los documentos y sus IDs
    this.grupoId = grupoId;
    this.catXGrupoModel = [];
    getDocs(
      query(
        collection(this.firestore, 'Categoria'),
        where('grupo', '==', grupoId),
        orderBy('orden', 'asc')
      )
    ).then((querySnapshot) => {
      this.catXGrupoModel = querySnapshot.docs.map((doc) => {
        // Aquí, doc.id te dará el ID del documento
        const data = doc.data() as Categoria;
        return { id: doc.id, data }; // Devuelve los datos del documento junto con su ID
      });
      if(openModal) this.verCategoriasXGrupoModal = true;
    });
  }

  addCatCollection() {
    if(this.uidUsuario){
      this.catAddModel.usuario = this.uidUsuario;
      this.catAddModel.grupo = this.grupoId;
      addDoc(collection(this.firestore, 'Categoria'), this.catAddModel).then(
        (documentReference: DocumentReference) => {
          console.log(documentReference);
          this.catAddModel = { nombreGasto: '' ,orden: 0, tipoCategoria: '', usuario: '', grupo:'', fechaCreacion: new Date()};
          this.getCategoriasGrupo(this.grupoId);
          this.crearModal = false;
        }
      );
    } else {
      console.log('Error al registrar la categoria');

    }

  }

  addGrupoCatCollection() {
    if(this.uidUsuario){
      this.grupoCataAddModel.uidCreador = this.uidUsuario;
      addDoc(collection(this.firestore, 'GrupoCategoria'), this.grupoCataAddModel).then(
        (documentReference: DocumentReference) => {
          console.log(documentReference);
          this.grupoCataAddModel = { nombreCatGrupo: '', uidCreador: '' };

          this.crearGrupoModal = false;
        }
      );
    } else {
      console.log('Error al registrar la categoria');

    }
  }


}
