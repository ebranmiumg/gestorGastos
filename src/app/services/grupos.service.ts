import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class GruposService {

  constructor(private firestore: Firestore) {}
  
  generateRandomCode(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  

  async getUniqueCode(): Promise<string> {
    let isUnique = false;
    let uniqueCode = '';

    while (!isUnique) {
      uniqueCode = this.generateRandomCode(6); // genera un código de 6 caracteres

      // Define la consulta para buscar el código en Firestore
      const q = query(collection(this.firestore, 'grupos'), where('codigoUnico', '==', uniqueCode));

      // Ejecuta la consulta
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        isUnique = true; // Si no se encontraron documentos, el código es único
      }
      // Si el código ya existe, el bucle se repite y genera un nuevo código
    }

    return uniqueCode;
  }

  
}
