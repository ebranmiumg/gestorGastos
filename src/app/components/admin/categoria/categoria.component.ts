import { Component, inject } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from 'src/app/models/categoria.model';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
})
export class CategoriaComponent {
  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  catAddModel: Categoria = { nombreGasto: '' ,orden: 0, tipoCategoria: '', usuario: '' };

  catModel: Observable<Categoria[]>;

  //VARIABLES MODALS
  crearModal = false;

  constructor() {
    const catColllection = query(collection(this.firestore, 'Categoria'), orderBy('orden','asc'));
    this.catModel = collectionData(catColllection) as Observable<Categoria[]>;
  }

  addCatCollection() {
    addDoc(collection(this.firestore, 'Categoria'), this.catAddModel).then(
      (documentReference: DocumentReference) => {
        console.log(documentReference);
        this.catAddModel = { nombreGasto: '' ,orden: 0, tipoCategoria: '', usuario: '' };

        this.crearModal = false;
      }
    );
  }
}
