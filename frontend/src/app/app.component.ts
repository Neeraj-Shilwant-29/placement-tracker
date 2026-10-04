import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent {
  title = 'Placement Preparation Tracker';
}