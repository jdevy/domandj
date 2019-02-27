import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatDialogConfig } from '@angular/material';
import { NotificationService } from '../../shared/notification.service';
import { DialogService } from '../../shared/dialog.service';
import { ClasseService } from '../classe.service';
import { ClasseComponent } from '../classe/classe.component';
import { AuthService } from 'src/app/shared/auth.service';
import { ClasseItem } from '../shared/classeItem.model';
import * as firebase from "firebase";
import { Observable } from 'rxjs';
import { StudentListComponent } from '../../zstudents/student-list/student-list.component';
import { StudentService } from '../../zstudents/student.service';


@Component({
  selector: 'app-classe-list',
  templateUrl: './classe-list.component.html',
  styleUrls: ['./classe-list.component.css']
})
export class ClasseListComponent implements OnInit {

  user: firebase.User;

  constructor(private service: ClasseService,
    private studentService: StudentService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private authService: AuthService) {
    this.authService.getLoggedInUser().subscribe(
      user => {
        this.user = user;
      }
    )
  }

  listData: MatTableDataSource<any>;
  //classes: string[];
  classes: ClasseItem[];
  displayedColumns: string[] = ['name', 'actions'];

  ngOnInit() {

    this.service.getClasses(this.user.uid).subscribe(
      list => {
        this.classes = list;
        // let array = list.map(
        //   item => {
        //     return {
        //       $key: item.key,
        //       ...item.payload.val()
        //     };
        //   });
        // this.listData = new MatTableDataSource(array);
        // this.classes = array;
      });
  }

  onCreate() {
    this.service.initializeFormGroup();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(ClasseComponent, dialogConfig);
  }

  onEdit(row) {
    this.service.populateForm(row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(ClasseComponent, dialogConfig);
  }

  onDelete(key) {
    this.dialogService.openConfirmDialog("Are you sure to delete this record ?").
      afterClosed().subscribe(res => {
        if (res) {
          this.service.deleteClasse(key);
          this.notificationService.warn('Deleted successfully !');
        }
      });
  }

  onClassStudents(key) {
    this.service.initializeFormGroup();
   // this.studentService.setClasseId(key);
    this.studentService.initialize(key, this.user.uid);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "100%";
    this.dialog.open(StudentListComponent, dialogConfig);
  }
}