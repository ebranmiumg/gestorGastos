import { Component } from '@angular/core';
import { ClarityIcons, homeIcon, userIcon, dollarBillIcon, administratorIcon } from '@cds/core/icon';

// AGREGAR ICONOS
ClarityIcons.addIcons(userIcon, homeIcon, dollarBillIcon, administratorIcon);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GestorGastos2023';
  collapsed = true;

  toggleNav() {
    this.collapsed = !this.collapsed;
  }
}
