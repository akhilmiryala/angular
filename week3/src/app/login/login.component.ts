import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionStorageService } from '../session-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
  <div class="card-container" *ngIf="!loggedIn">
      <div class="form-container">
        <form (ngSubmit)="login()" [formGroup]="loginForm">
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid">Login</button>
        </form>
      </div>
  </div>`,
  styles: []
})
export class LoginComponent implements OnInit {

  loggedIn: boolean;
  loginForm = new FormGroup({
    username: new FormControl('user', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private http: HttpClient,
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedIn = this.sessionStorageService.isLoggedIn();
  }

  login() {
    const httpOpts = { headers: new HttpHeaders().set('Content-Type', 'application/json'), withCredentials: true};
    this.http.post('http://localhost:5200/_session', { name: this.loginForm.value.username, password: this.loginForm.value.password }, httpOpts)
      .subscribe((res: any) => {
        if(res.ok) {
          this.sessionStorageService.setToken(Date.now()+(2000*1000));
          this.loggedIn = this.sessionStorageService.isLoggedIn();
          this.router.navigate([ '/message' ]);
        }
      });
  }

}
