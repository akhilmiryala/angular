import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }

  setToken(expiresIn){
    sessionStorage.setItem('expiryTime', expiresIn.toString());    
  }
    
  getToken(){
    return Number.parseInt(sessionStorage.getItem('expiryTime'));
  }

  isLoggedIn() {
    return this.getToken() > Date.now();
  }

}
