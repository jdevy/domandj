import { Component, OnInit } from '@angular/core';
import { ClasseService } from '../classe.service';
import { NotificationService } from '../../shared/notification.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-classe',
  templateUrl: './classe.component.html',
  styleUrls: ['./classe.component.css']
})
export class ClasseComponent implements OnInit {


  constructor(private service: ClasseService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<ClasseComponent>) { }

  formControls = this.service.form.controls;
  showSuccessMessage: boolean;

  ngOnInit() {
  }

  onSubmit() {
    if (this.service.form.valid) {
      if (!this.service.form.get('$key').value) {
        this.service.insertClasse(this.service.form.value);
      } else {
        this.service.updateClasse(this.service.form.value);
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