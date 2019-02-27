import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../../shared/notification.service';
import { StudentService } from '../student.service';
import { AuthService } from 'src/app/shared/auth.service';
import { StudentItem } from '../shared/studentItem.model';
import * as firebase from "firebase";

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {

  user: firebase.User;
  students: StudentItem[];

  constructor(private service: StudentService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<StudentListComponent>,
    private authService: AuthService) {

    // this.authService.getLoggedInUser().subscribe(
    //   user => {
    //     this.user = user;
    //   }
    // )
  }

  ngOnInit() {
    console.log("studentlist user ");
    console.log(this.user);
    this.service.getStudents().subscribe(
      list => {
        this.students = list;
      });
  }

  formControls = this.service.form.controls;

  onSubmit() {
    if (this.service.form.valid) {
      if (!this.service.form.get('id').value) {
        this.service.insertStudent(this.service.form.value);
      }
      // else {
      //   this.service.updateStudent(this.service.form.value);
      // }
      this.service.form.reset();
      this.service.initializeFormGroup();
      this.notificationService.success(':: Submitted successfully');
      // this.onClose();
    }
  }

  onDelete(key) {
    this.service.deleteStudent(key);
    this.notificationService.warn('Deleted successfully !');
  }

  onClose() {
    this.service.form.reset();
    this.service.initializeFormGroup();
    this.dialogRef.close();
  }

}
