import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { AppState } from 'src/app/store/store.reducer';

@Component({
  selector: 'app-signup-login-master',
  templateUrl: './signup-login-master.component.html',
  styleUrls: ['./signup-login-master.component.scss'],
})
export class SignupLoginMasterComponent
  implements OnInit, OnDestroy, AfterViewInit {
  constructor() {}

  ngOnInit(): void {
    document.body.style.backgroundColor = '#f0f4fd';
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
}
