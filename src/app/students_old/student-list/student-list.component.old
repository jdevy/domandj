import { Component, OnInit, ViewChild } from '@angular/core';
import { StudentService } from '../../shared/student.service';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { StudentComponent } from '../student/student.component';
import { DialogService } from '../../shared/dialog.service';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {

  constructor(private service: StudentService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private dialogService: DialogService) { }

  listData: MatTableDataSource<any>;
  displayedColumns: string[] = ['lastName','firstName','email','mobile','actions'];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

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
        this.listData.sort = this.sort;
        this.listData.paginator = this.paginator;
      });
  }

  onCreate(){
    this.service.initializeFormGroup();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(StudentComponent, dialogConfig);
  }

  onEdit(row) {
    this.service.populateForm(row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(StudentComponent, dialogConfig);
  }

  onDelete(key){
  //  this.service.deleteStudent(key);
    this.dialogService.openConfirmDialog("Are you sure to delete this record ?").
    afterClosed().subscribe(res => {
      if (res) {
        this.service.deleteStudent(key);
        this.notificationService.warn('Deleted successfully !');
      }
    });
  }
}
