import { Component } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'week1';
  username: string;
  password: string;
  data: [ any ];

  constructor(
    private http: HttpClient
  ) {}

  login() {
    const httpOpts = { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    this.http.post('http://localhost:5200/_session', { }, httpOpts)
      .subscribe();
  }
}
