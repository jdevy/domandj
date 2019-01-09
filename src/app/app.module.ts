import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireAuthModule } from 'angularfire2/auth';


import { AppComponent } from './app.component';
import { StudentsComponent } from './students/students.component';
import { StudentComponent } from './students/student/student.component';
//import { MaterialModule } from './material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StudentService } from './shared/student.service';

import { environment } from '../environments/environment';
import { StudentListComponent } from './students/student-list/student-list.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { GroupComponent } from './groups/group/group.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { GroupService } from './shared/group.service';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { AuthGuardService } from './shared/auth-guard.service';
import { AuthService } from './shared/auth.service';
import { HeaderComponent } from './header/header.component';
import { SharedModule } from './shared/shared.module';
import { AuthComponent } from './auth/auth.component';
import { AlertComponent } from './alert/alert.component';
import { ZclasseComponent } from './zclasse/zclasse.component';
import { ClasseListComponent } from './zclasse/classe-list/classe-list.component';
import { ClasseComponent } from './zclasse/classe/classe.component';
import { ClasseService } from './zclasse/classe.service';
import { ZstudentsComponent } from './zstudents/zstudents.component';

const routes: Routes= [
  { path: 'auth/signup', component: SignupComponent},
  { path: 'auth/signin', component: SigninComponent},
  { path: 'auth', component: AuthComponent},
  { path: 'groups', canActivate: [AuthGuardService], component: GroupsComponent},
  { path: 'zclasse', canActivate: [AuthGuardService], component: ZclasseComponent},
  { path: '', redirectTo: 'zclasse', pathMatch: 'full'},
  { path: '**', redirectTo: 'zclasse'}
]

@NgModule({
  declarations: [
    AppComponent,
    StudentsComponent,
    StudentComponent,
    StudentListComponent,
    ConfirmDialogComponent,
    GroupComponent,
    GroupsComponent,
    GroupListComponent,
    HomeComponent,
    SignupComponent,
    SigninComponent,
    HeaderComponent,
    AuthComponent,
    AlertComponent,
    ZclasseComponent,
    ClasseListComponent,
    ClasseComponent,
    ZstudentsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    SharedModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    RouterModule.forRoot(routes)
  ],
  providers: [StudentService, GroupService, ClasseService, AuthService, AuthGuardService],
  bootstrap: [AppComponent],
  entryComponents: [StudentComponent, GroupComponent, ClasseComponent, ConfirmDialogComponent]
})
export class AppModule { }
