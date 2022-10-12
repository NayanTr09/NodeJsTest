// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: require('../../package.json').version + '-dev',
  // apiPath: 'https://qa-api-1.kartrocket.com/v1/',
  apiPath: 'http://apiv2.shiprocket.local/v1/',
  // googleID: '603975774361-49fsc3v4lbbmf54iu7hf0k9m1hnp5iei.apps.googleusercontent.com',
  // facebookAppID: '866222157439736',
  // fbAuth : {appID : '719834648216007', redirect_uri : '/login/social-auth', backendApi: 'auth/login/facebookv2/callback'},
  // googleAuth : {ClientID: '415578535638-taan01jiogdj99gb3g4bdn4friqeuer8.apps.googleusercontent.com', redirect_uri : '/login/social-auth', backendApi: 'auth/login/google/callback'},
  // OneSignalKey: 'f08c3ddb-261e-4cb6-931f-fc2ce06f1f46'
  // googleLoginOptions : googleAuth()
};
