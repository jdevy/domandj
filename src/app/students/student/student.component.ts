import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../shared/student.service';
import { MatDialogRef } from '@angular/material';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})

export class StudentComponent implements OnInit {

  constructor(private service: StudentService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<StudentComponent>) { }

  formControls = this.service.form.controls;
  showSuccessMessage: boolean;

  ngOnInit() {
  }

  onSubmit() {
    if (this.service.form.valid) {
      if (!this.service.form.get('$key').value) {
        this.service.insertStudent(this.service.form.value);
      } else {
        this.service.updateStudent(this.service.form.value);
      }
      this.service.form.reset();
      this.service.initializeFormGroup();
      this.notificationService.success(':: Submitted successfully');
      this.onClose();
    }
  }

  onClose() {
    this.service.form.reset();
    this.service.initializeFormGroup();
    this.dialogRef.close();
  }

}
