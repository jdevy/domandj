import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../shared/student.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  constructor(private service: StudentService) { }
  formControls = this.service.form.controls;
  showSuccessMessage: boolean;

  ngOnInit() {
  }

  onSubmit() {
    if (this.service.form.valid) {
      if (this.service.form.get('$key').value == null) {
        this.service.insertStudent(this.service.form.value);
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
        this.service.form.reset();
      } else {
        //update
      }
    }
  }

  onClear() {
    this.service.form.reset();
    this.service.initializeFormGroup();
  }

}
