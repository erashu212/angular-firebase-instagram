import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

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
  isProcessing: boolean = false;

  errorMessage: string;
  registerForm: FormGroup;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private _fb: FormBuilder,
    private afDB: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.buildForm();
    this.user = this.afAuth.authState;
    const url = this.router.url;

    this.confirmSignIn(url);
  }

  async sendEmailLink() {
    if (this.registerForm.valid) {
      this.isProcessing = true;
      this.showLogin = true;
      this.email = this.registerForm.get('email').value;
      const name = (this.registerForm.get('name') || <any>{}).value;
      const password = (this.registerForm.get('password') || <any>{}).value;

      if (name && password) {
        this.updateUser(name, password);
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
        this.isProcessing = false;
        this.showLogin = false;
      } catch (err) {
        this.showLogin = true;
        this.errorMessage = err.message;
        this.isProcessing = false;
      }
    }
  }

  async confirmSignIn(url) {
    try {
      this.isProcessing = true;
      if (this.afAuth.auth.isSignInWithEmailLink(url)) {
        const email = window.localStorage.getItem('emailForSignIn');
        this.email = email;
        // If missing email, prompt user for it
        if (!email) {
          this.showLogin = true;
          this.emailSent = false;
          this.isProcessing = false;
          return;
        }

        // Signin user and remove the email localStorage
        const result = await this.afAuth.auth.signInWithEmailLink(email, url);
        if (result) {
          this.updateForm(this.email);
        }
        window.localStorage.removeItem('emailForSignIn');
        this.isProcessing = false;
      } else {
        this.showLogin = true;
        this.emailSent = false;
        this.isProcessing = false;
      }
    } catch (err) {
      this.showLogin = true;
      this.emailSent = false;
      this.errorMessage = err.message;
      this.isProcessing = false;
    }
  }

  async resendEmailLink() {
    try {
      this.isProcessing = true;
      const result = this.afAuth.auth.sendSignInLinkToEmail(this.email, environment.actionCodeSettings)
      this.isProcessing = false;
    } catch (e) {
      this.isProcessing = false;
    }
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
    this.emailSent = false;
    this.isProcessing = false;
    this.registerForm.get('email').setValue(email, { disabled: true });
    this.registerForm.get('name').setValidators(Validators.required)
    this.registerForm.get('password').setValidators(Validators.required)
  }

  private async updateUser(username: string, password: string) {
    try {
      this.isProcessing = true;
      this.user = this.afAuth.auth.currentUser;
      debugger;

      await this.afDB.object(`/users/${this.user.uid}`)
        .set({
          name: username,
          password: password,
          email: this.email,
          createdAt: new Date()
        })
      this.router.navigateByUrl('/activate')
    } catch (e) {
      this.isProcessing = false;
      this.errorMessage = e['message']
    }
  }
}
