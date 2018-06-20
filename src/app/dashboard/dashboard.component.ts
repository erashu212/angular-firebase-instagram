import { Component, OnInit } from '@angular/core';

import { switchMap, map, tap } from 'rxjs/operators';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  isProcessing: boolean = true;
  igUser: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afDB: AngularFireDatabase,
    private router: Router
  ) { }

  ngOnInit() {
    this.afAuth.authState
      .subscribe(user => {
        if (!user) {
          this.router.navigateByUrl('/login')
        } else {
          this.getUser(user.uid)
          .then(data => {
            this.isProcessing = false;
            this.igUser = data;
          })
        }
      }, err => {
        this.isProcessing = false;
      })
  }

  singOut() {
    this.afAuth.auth.signOut()
  }

  private getUser(uid) {
    return new Promise((resolve, reject) => {
      this.afDB.database.ref('users/' + uid).once('value', (snapshot) => {
        const user = snapshot.val();
        resolve(user);
      }, (err) => {
        reject(err);
      })

    })
  }
}
