import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionStorageService } from '../session-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  messageForm = new FormGroup({
    name: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
  });

  data: Array<{
    name: string,
    message: string
  }> = [];

  constructor(
    private http: HttpClient,
    private sessionStorageService: SessionStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.sessionStorageService.isLoggedIn()) {
      this.getMessages();
    } else {
      this.router.navigate([ '/' ]);
    }
  }

  message() {
    const httpOpts = { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    this.http.post('http://localhost:5200/messages', { name: this.messageForm.value.name, message: this.messageForm.value.message }, httpOpts)
      .subscribe(() => {
        this.data.push({ name: this.messageForm.value.name, message: this.messageForm.value.message });
      });
  }

  getMessages() {
    const httpOpts = { headers: new HttpHeaders().set('Content-Type', 'application/json') };
    this.http.post('http://localhost:5200/messages/_all_docs?include_docs=true', httpOpts)
      .subscribe((messages: any) => {
        this.data = messages.rows.map((message) => message.doc);
      });
  }

}
