import { Component, inject } from '@angular/core';
import { DocumentReference, Firestore, addDoc, collection, collectionData, orderBy, query,  } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Anio } from 'src/app/models/anio.model';
import { Mes } from 'src/app/models/mes.model';

@Component({
  selector: 'app-mes',
  templateUrl: './mes.component.html',
  styleUrls: ['./mes.component.scss']
})
export class MesComponent {

  //CONFIGUARCION FIREBASE
  private firestore: Firestore = inject(Firestore);
  mesAddModel: Mes = { nombreMes: '', anio: '', orden: 0 };
  mesModel: Observable<Mes[]>;
  anioModel: Observable<Anio[]>;

  //VARIABLES MODALS
  crearModal = false;

  constructor(){
    const mesColllection = query(collection(this.firestore, 'mes'), orderBy('orden','asc'));
    const anioColllection = collection(this.firestore, 'anio');

    this.mesModel = collectionData(mesColllection) as Observable<Mes[]>;
    this.anioModel = collectionData(anioColllection) as Observable<Anio[]>;

  }

  addMesCollection(){
    addDoc(collection(this.firestore, 'mes'), this.mesAddModel).then((documentReference: DocumentReference) => {
      console.log(documentReference);

      this.crearModal = false;
   })
  }

}
