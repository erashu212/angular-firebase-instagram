// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const actionCodeSettings = {
  // Your redirect URL
  url: 'http://localhost:4200',
  handleCodeInApp: true,
};

export const environment = {
  production: false,
  actionCodeSettings: actionCodeSettings,
  firebase: {
    apiKey: 'AIzaSyAxOgLtIyT-DiOxBgC0IvRtyJpieZAVDtQ',
    authDomain: 'instagram-auth-001.firebaseapp.com',
    databaseURL: 'https://instagram-auth-001.firebaseio.com',
    projectId: 'instagram-auth-001',
    storageBucket: 'instagram-auth-001.appspot.com',
    messagingSenderId: '802775136147'
  },
  instagram: {
    clientId: '',
    clientSecret: '',
    redirectUri: `http://localhost:4200/activate`
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
