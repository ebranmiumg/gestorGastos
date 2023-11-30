import { Component, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, collectionData,  } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Anio } from 'src/app/models/anio.model';

@Component({
  selector: 'app-anio',
  templateUrl: './anio.component.html',
  styleUrls: ['./anio.component.scss']
})
export class AnioComponent {
  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  anioAddModel: Anio = { numeroAnio: 0 };

  anioModel: Observable<Anio[]>;

  //VARIABLES MODALS
  crearModal = false;

  constructor(){
    const anioColllection = collection(this.firestore, 'anio');
    this.anioModel = collectionData(anioColllection) as Observable<Anio[]>;
  }

  addAnioCollection(){
    addDoc(collection(this.firestore, 'anio'), this.anioAddModel).then((documentReference: DocumentReference) => {
      console.log(documentReference);

      this.crearModal = false;
   })
  }

}
