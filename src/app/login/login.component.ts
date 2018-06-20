import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isProcessing: boolean = true;
  errorMessage: string;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.buildForm();
    this.afAuth.authState
      .subscribe(user => {
        this.isProcessing = false;
        if (user && user.emailVerified) {
          this.router.navigateByUrl('/dashboard')
        }
      }, err => {
        this.isProcessing = false;
      });
  }

  async login() {
    try {
      if (this.loginForm.dirty && this.loginForm.valid) {
        this.isProcessing = true;
        const email = this.loginForm.get('email').value;
        const password = this.loginForm.get('password').value;
        const result = this.afAuth.auth.signInWithEmailAndPassword(email, password);
      }
    }
    catch (e) {
      this.isProcessing = false;
      this.errorMessage = e['message'];
    }
  }

  async resetPassword() {
    try {
      this.errorMessage = null;
      const email = this.loginForm.get('email').value;
      if (email)
        await this.afAuth.auth.sendPasswordResetEmail(email)
      else
        this.errorMessage = 'Please input registered email';
    }
    catch (e) {
      this.isProcessing = false;
      this.errorMessage = e['message'];
    }
  }

  private buildForm() {
    this.loginForm = this.fb.group({
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
      password: new FormControl(null, Validators.required)
    })
  }
}
