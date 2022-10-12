// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// https://qa-api-2.kartrocket.com/v1/
export const environment = {
  production: false,
  appVersion: require('../../package.json').version + '-qa',
  apiPath: 'https://bharat-goel-api.kartrocket.com/v1/',
  // apiPath: 'https://krmct000.kartrocket.com/v1/',

  // googleID: '603975774361-49fsc3v4lbbmf54iu7hf0k9m1hnp5iei.apps.googleusercontent.com',
  // facebookAppID: '866222157439736',
  // fbAuth : {appID : '719834648216007', redirect_uri : '/login/social-auth', backendApi: 'auth/login/facebookv2/callback'},
  // googleAuth : {ClientID: '415578535638-taan01jiogdj99gb3g4bdn4friqeuer8.apps.googleusercontent.com', redirect_uri : '/login/social-auth', backendApi: 'auth/login/google/callback'},
  // OneSignalKey: 'f08c3ddb-261e-4cb6-931f-fc2ce06f1f46'
  // googleLoginOptions : googleAuth()
};

// function  mergeAllParams(authProvider) {
//   let rcode = getRcode();
//   let utm = getUTM();
//   let auth = {auth : authProvider};

//   let newParam = JSON.stringify(Object.assign(rcode, utm,auth));

//   return window.btoa((unescape(encodeURIComponent(newParam))));
// }

// function getRcode() {
//   let a = new URLSearchParams(window.location.search);
//   return { rcode: a.get("rcode") };
// }

// function getUTM() {
//   // var name = "UTM=";
//   // var decodedCookie = decodeURIComponent(document.cookie);
//   // var ca = decodedCookie.split(";");
//   // for (var i = 0; i < ca.length; i++) {
//   //     var c = ca[i];
//   //     while (c.charAt(0) == " ") {
//   //         c = c.substring(1);
//   //     }
//   //     if (c.indexOf(name) == 0) {
//   //         return JSON.parse(c.substring(name.length, c.length));
//   //     }
//   // }
//   // return {};
//   let UTM = getParsedCookie(getCookie("UTM"));
//   let first_utm = getParsedCookie(getCookie("first_utm"));
//   return {
//       'gclid' : first_utm['gclid'],
//       'utm_source' : UTM['utm_source'],
//       'utm_campaign' : UTM['utm_campaign'],
//       'utm_content' : UTM['utm_content'],
//       'utm_medium' : UTM['utm_medium'],
//       'utm_term' : UTM['utm_term'],
//       'referrer': first_utm['referrer'],
//       'landing_page':  first_utm['pathname'],
//       'first_utm' : first_utm
//   }
// }

// function getParsedCookie(val){
//   return val ? JSON.parse(decodeURIComponent(val)) : {};
// }

// function getCookie(cname) {
//   var name = cname + "=";
//   var ca = document.cookie.split(';');
//   for(var i = 0; i < ca.length; i++) {
//     var c = ca[i];
//     while (c.charAt(0) == ' ') {
//       c = c.substring(1);
//     }
//     if (c.indexOf(name) == 0) {
//       return c.substring(name.length, c.length);
//     }
//   }
//   return "";
// }

// function googleAuth(){

//   let googleConfig = {
//     endPoint: "https://accounts.google.com/o/oauth2/v2/auth?",
//     params :{
//       client_id: "603975774361-r8p5ccrrhmgf7i6tosd611ql1ogadvdf.apps.googleusercontent.com",
//       response_type : "code",
//       scope:"email profile",
//       scopePrefix: "openid",
//       scopeDelimiter: " ",
//       display: "popup",
//       include_granted_scopes : 'true',
//       redirect_uri: 'http://localhost:4200/login',
//       state: mergeAllParams('google'),
//       // popupOptions: { width: 452, height: 633 }
//     }
//   }

//   var qeryString = "";
//   for (var p in googleConfig.params) {
//     qeryString += p+"="+ googleConfig.params[p]+"&"
//   }
//   console.log('quwry string is- ', qeryString);
//   let x = qeryString.substring(10);
//   console.log('x is- ', x);
//   return x;

// }

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
