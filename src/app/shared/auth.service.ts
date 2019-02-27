import { Injectable } from '@angular/core';
//import { AngularFireAuth } from '@angular/fire/auth';
//import * as firebase from 'firebase';
//import * as firebase from 'firebase/app';
//import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
//import 'firebase/auth';
import { auth } from 'firebase';
//import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  createNewUser(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }
  // createNewUser(email: string, password: string) {
  //   return new Promise(
  //     (resolve, reject) => {
  //       this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(
  //         () => {
  //           resolve();
  //         },
  //         (error) => {
  //           reject(error);
  //         }
  //       )
  //     }
  //   );
  // }

  signInUser(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
  }
  // signInUser(email: string, password: string) {
  //   return new Promise(
  //     (resolve, reject) => {
  //       this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
  //         () => {
  //           console.log("ok signInUser service");
  //           resolve();
  //         },
  //         (error) => {
  //           console.log("KO signInUser service");
  //           reject(error);
  //         }
  //       );
  //     }
  //   );
  // }

  signOutUser() {
    this.afAuth.auth.signOut();
  }

  async signInWithGoogle() {
    var provider = new auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    return await this.afAuth.auth.signInWithPopup(provider);
    // return new Promise(
    //   (resolve, reject) => {
    //     this.afAuth.auth.signInWithRedirect(provider).then(
    //       () => {
    //         console.log("ok signInWithGoogle google");
    //         resolve();
    //       },
    //       (error) => {
    //         console.log("KO error signInWithGoogle google");
    //         reject(error);
    //       });
    //   }
    // );
  }

  getLoggedInUser() {
    return this.afAuth.authState;
  }

  //   this.af.auth.login({
  //     provider: AuthProviders.Google,
  //     method: AuthMethods.Popup,
  //   }).then(
  //       (success) => {
  //       this.router.navigate(['/members']);
  //     }).catch(
  //       (err) => {
  //       this.error = err;
  //     })
  // }

}
