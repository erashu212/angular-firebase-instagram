import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http'

import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.scss']
})
export class ActivateComponent implements OnInit {

  private unsubscriber: Subscription;

  constructor(
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private activatedRoute: ActivatedRoute,
    private _http: HttpClient
  ) { }

  ngOnInit() {
    this.unsubscriber = this.activatedRoute.fragment.subscribe(resp => {
      const result = this.getInstagramDetails(resp['access_token']);
      const user = this.afAuth.auth.currentUser;

      this.afDB.object(`/users/${user.uid}`)
        .set({
          instagramId: result['id'],
          instagramUN: result['username']
        })
    })
  }

  ngOnDestroy() {
    if (!this.unsubscriber.closed) {
      this.unsubscriber.unsubscribe()
    }
  }

  onAuthentication() {
    window.location.href = `https://api.instagram.com/oauth/authorize/?client_id=${environment.instagram.clientId}-ID&redirect_uri=${environment.instagram.redirectUri}&response_type=token`
  }

  async getInstagramDetails(accessToken: string) {
    const result = await this._http.get('https://api.instagram.com/v1/users/self/?access_token=' + accessToken)
      .toPromise();

    return result;
  }

}
