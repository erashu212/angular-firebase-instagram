import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import * as firebase from 'firebase';

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
  showLogin: boolean = true;
  isProcessing: boolean = true;

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
    this.afAuth.authState
      .subscribe(user => {
        this.isProcessing = false;
        if (user && user.emailVerified) {
          this.router.navigateByUrl('/activate')
        }
      }, err => {
        this.isProcessing = false;
      });
  }

  async sendEmailLink() {
    if (this.registerForm.valid) {
      this.showLogin = true;
      this.email = this.registerForm.get('email').value;
      const name = (this.registerForm.get('name') || <any>{}).value;
      const password = (this.registerForm.get('password') || <any>{}).value;
      const newsSubscription = (this.registerForm.get('newsSubscription') || <any>{}).value;

      if (name && password) {
        this.isProcessing = true;
        try {
          await this.afAuth.auth.createUserWithEmailAndPassword(
            this.email,
            password
          );
          this.isProcessing = false;
          this.showLogin = false;
          this.updateUser(name, newsSubscription)
        } catch (err) {
          this.showLogin = !(name && password);
          this.errorMessage = err.message;
          this.isProcessing = false;
        }
      } else {
        this.updateForm(this.email)
        this.showLogin = false;
      }
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
      password: new FormControl(null),
      newsSubscription: new FormControl(null)
    })
  }

  private updateForm(email: string) {
    this.emailSent = false;
    this.isProcessing = false;
    this.registerForm.get('email').reset({ value: email, disabled: true });
    this.registerForm.get('name').setValidators(Validators.required)
    this.registerForm.get('password').setValidators(Validators.required)
  }

  private async updateUser(name: string, newsSubscription: boolean = false) {
    try {
      this.isProcessing = true;
      this.user = this.afAuth.auth.currentUser;
      const actionCodeSettings = environment.actionCodeSettings
      await this.afAuth.auth.currentUser.sendEmailVerification(actionCodeSettings);
      await this.afDB.object(`/users/${this.user.uid}`)
        .set({
          name: name,
          newsSubscription: newsSubscription,
          timestamp: (new Date()).getTime()
        })
      this.emailSent = true;
      this.isProcessing = false;
      this.showLogin = false;
    } catch (e) {
      this.isProcessing = false;
      this.showLogin = false;
      this.errorMessage = e['message']
    }
  }
}
