import { Component } from '@angular/core';
import { environment } from '../environments/environment';

import * as firebase from "firebase";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
//  title = 'app';

  constructor(){
    // var firebaseConfig = {
    //   apiKey: "AIzaSyC3tSDwHwbLiucKk6uUA_85rGcLMTDMRdM",
    //   authDomain: "domandj-firebase.firebaseapp.com",
    //   databaseURL: "https://domandj-firebase.firebaseio.com",
    //   projectId: "domandj-firebase",
    //   storageBucket: "domandj-firebase.appspot.com",
    //   messagingSenderId: "618827828384"
    // };
    firebase.initializeApp(environment.firebaseConfig);
  }
}
