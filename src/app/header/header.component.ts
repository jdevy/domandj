import { Component, OnInit } from '@angular/core';

import * as firebase from 'firebase';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
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

  constructor(private authService: AuthService) { }

  ngOnInit() {
    firebase.auth().onAuthStateChanged(
      (user) => {
        if(user) {
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
