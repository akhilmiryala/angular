import { Component } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
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
  data: Array<{
    name: string,
    message: string
  }> = [];
  notifications = [];

  constructor(
    private http: HttpClient,
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) {
    this.router.events.subscribe(() => {
      this.loggedIn = this.sessionStorageService.isLoggedIn();
    });
  }

  login(form) {
    const httpOpts = { headers: new HttpHeaders().set('Content-Type', 'application/json'), withCredentials: true };
    this.http.post('http://localhost:5200/_session', { name: form.value.username, password: form.value.password }, httpOpts)
      .subscribe(() => this.loggedIn = true);
  }

  message(form) {
    const httpOpts = { headers: new HttpHeaders().set('Content-Type', 'application/json'), withCredentials: true };
    this.http.post('http://localhost:5200/messages', { name: form.value.name, message: form.value.message }, httpOpts)
      .subscribe(() => {
        this.data.push({ name: form.value.name, message: form.value.message });
        this.notifications.push('New message added');
      });
  }
  
}
