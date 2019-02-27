import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../shared/auth.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/alert/alert.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  signInForm: FormGroup;
  errorMessage: string;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService) { }

  ngOnInit() {
    console.log("-- loading signin component ...")
    this.initForm();
  }

  initForm() {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)]]
    });
  }

  onSubmit() {
    const email = this.signInForm.get('email').value;
    const password = this.signInForm.get('password').value;
    this.authService.signInUser(email, password).then(
      () => {
        console.log("ok signInUser component");
        this.router.navigate(['zclasse']);
      },
      (error) => {
        console.log("KO signInUser component");
        this.alertService.error('login failed', false);
        //this.errorMessage = error;
      }
    )
  }

  loginGoogle() {
    this.authService.signInWithGoogle().then(
      () => {
        // le reroutage ne fonctionne pas. ne passe pas là.
        console.log("ok logging google");
        this.router.navigate(['zclasse']);
      },
      (error) => {
        console.log("KO not logging google");
        this.alertService.error('login failed', false);
        //this.errorMessage = error;
      })
  }

}
