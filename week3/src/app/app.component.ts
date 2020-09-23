import { Component } from '@angular/core';
import { SessionStorageService } from './session-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'week2';
  loggedIn: boolean = false;
  notifications = [];

  constructor(
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) {
    this.router.events.subscribe(() => {
      this.loggedIn = this.sessionStorageService.isLoggedIn();
    });
  }

  logout() {
    this.sessionStorageService.setToken(Date.now()-1000);
    this.loggedIn = this.sessionStorageService.isLoggedIn();
    this.router.navigate([ '/' ]);
  }
  
}
