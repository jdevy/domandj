import { Component } from '@angular/core';
import { environment } from '../environments/environment';

import * as firebase from "firebase";
import { AuthService } from './shared/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  links = [
    {
      icon: 'home',
      path: '/home',
      label: 'HOME'
    },

    {
      icon: 'list',
      path: '/post/list',
      label: 'POSTS'
    },
    {
      icon: 'add',
      path: '/post/new',
      label: 'NEW POST'
    },
    {
      icon: 'list',
      path: '/student/list',
      label: 'STUDENTS'
    }
  ];
  toggleMenu = false;
  isAuthenticated: boolean;

  constructor(private authService: AuthService) {
    firebase.initializeApp(environment.firebaseConfig);
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(
      (user) => {
        if (user) {
          this.isAuthenticated = true;
        } else {
          this.isAuthenticated = false;
        }
      }
    );
  }

  onSignOut() {
    this.authService.signOutUser();
  }

}
