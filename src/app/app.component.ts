import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';

import * as firebase from "firebase";
import { AuthService } from './shared/auth.service';

export default !firebase.apps.length
  ? firebase.initializeApp(environment.firebaseConfig).firestore()
  : firebase.app().firestore();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  links = [
    {      icon: 'home',      path: '/home',      label: 'HOME'    },
    {      icon: 'list',      path: '/post/list',      label: 'POSTS'    },
    {      icon: 'add',      path: '/post/new',      label: 'NEW POST'    },
    {      icon: 'list',      path: '/student/list',      label: 'STUDENTS'    }
  ];

  toggleMenu = false;

  user: firebase.User;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    console.log("-- loading app component ...")

    this.authService.getLoggedInUser().subscribe(
      user => {
        this.user = user;
      }
    )
  }

  onSignOut() {
    this.authService.signOutUser();
  }
}
