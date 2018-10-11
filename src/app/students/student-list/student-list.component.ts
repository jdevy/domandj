import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../shared/student.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {

  constructor(private service: StudentService) { }
  listData: MatTableDataSource<any>;
  displayedColumns: string[] = ['lastName','firstName','email','mobile','actions'];

  ngOnInit() {
    this.service.getStudents().subscribe(
      list => {
        let array = list.map(
          item => {
            return {
              $key: item.key,
              ...item.payload.val()
            };
          });
        this.listData = new MatTableDataSource(array);
      });
  }

}
