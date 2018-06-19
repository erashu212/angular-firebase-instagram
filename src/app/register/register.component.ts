import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { AngularFireAuth } from 'angularfire2/auth';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  user: any;
  email: string;
  emailSent: boolean = false;
  showLogin: boolean = false;

  errorMessage: string;
  registerForm: FormGroup;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.buildForm();
    this.user = this.afAuth.authState;
    const url = this.router.url;

    this.confirmSignIn(url);
  }

  async sendEmailLink() {
    debugger;
    if (this.registerForm.valid) {
      this.email = this.registerForm.get('email').value;
      const username = this.registerForm.get('username').value;
      const password = this.registerForm.get('password').value;

      if (username && password) {
        this.updateUser(username, password);
        return;
      }
      const actionCodeSettings = environment.actionCodeSettings
      try {
        await this.afAuth.auth.sendSignInLinkToEmail(
          this.email,
          actionCodeSettings
        );
        window.localStorage.setItem('emailForSignIn', this.email);
        this.emailSent = true;
      } catch (err) {
        this.errorMessage = err.message;
      }
    }
  }

  async confirmSignIn(url) {
    try {
      if (this.afAuth.auth.isSignInWithEmailLink(url)) {
        const email = window.localStorage.getItem('emailForSignIn');
        this.email = email;
        // If missing email, prompt user for it
        if (!email) {
          this.showLogin = true;
          this.emailSent = false;
          return;
        }

        // Signin user and remove the email localStorage
        const result = await this.afAuth.auth.signInWithEmailLink(email, url);
        if (result) {
          this.updateForm(this.email);
        }
        window.localStorage.removeItem('emailForSignIn');
      } else {
        this.showLogin = true;
        this.emailSent = false;
      }
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  async resendEmailLink() {
    try {
      const result = this.afAuth.auth.sendSignInLinkToEmail(this.email, environment.actionCodeSettings)
    } catch (e) { }
  }

  private buildForm() {
    this.registerForm = this._fb.group({
      name: new FormControl(),
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
      password: new FormControl(null)
    })
  }

  private updateForm(email: string) {
    this.registerForm.get('email').setValue(email, { disabled: true });
    this.registerForm.get('name').setValidators(Validators.required)
    this.registerForm.get('password').setValidators(Validators.required)
  }

  private async updateUser(username: string, password: string) {
    try {
      this.user = this.afAuth.auth.currentUser;
      const result = await this.user.updateProfile({
        instagramId: username
      });
      return result;
    } catch (e) {
      this.errorMessage = e['message']
    }
  }
}
