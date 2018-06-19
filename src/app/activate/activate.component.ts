import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http'

import { ActivatedRoute } from '@angular/router';

import { Subscription, Observable, empty, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

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
  showFinalStep: boolean = false;
  igUser: any;
  isProcessing: boolean = true;

  constructor(
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private activatedRoute: ActivatedRoute,
    private _http: HttpClient
  ) { }

  ngOnInit() {
    const result$ = this.activatedRoute.fragment
      .pipe(switchMap((resp: string) => {
        if (resp) {
          const token = resp.replace('access_token=', '');
          return this.getInstagramDetails(token);
        }
        return of({});
      }), map((res: any) => res.data));

    this.unsubscriber = result$
      .pipe(tap(data => this.igUser = data), switchMap(() => this.afAuth.authState))
      .subscribe(user => {
        if (user && this.igUser) {
          this.showFinalStep = !!this.igUser;
          this.afDB.object(`/users/${user.uid}`)
            .update({
              instagramId: this.igUser['id'],
              instagramUN: this.igUser['username'],
              instagramPorfileImg: this.igUser['profile_picture']
            })
        } else {
          this.showFinalStep = false;
        }
        this.isProcessing = false;
      }, err => {
        this.isProcessing = false;
        this.showFinalStep = false;
      })
  }

  ngOnDestroy() {
    if (!this.unsubscriber.closed) {
      this.unsubscriber.unsubscribe()
    }
  }

  onAuthentication() {
    window.location.href = `https://api.instagram.com/oauth/authorize/?client_id=${environment.instagram.clientId}&redirect_uri=${environment.instagram.redirectUri}&response_type=token`
  }

  getInstagramDetails(accessToken: string) {
    return this._http.get('https://api.instagram.com/v1/users/self/?access_token=' + accessToken, { responseType: 'json' });
  }

}
