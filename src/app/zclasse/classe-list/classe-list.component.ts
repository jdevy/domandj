import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatDialogConfig } from '@angular/material';
import { NotificationService } from '../../shared/notification.service';
import { DialogService } from '../../shared/dialog.service';
import { ClasseService } from '../classe.service';
import { ClasseComponent } from '../classe/classe.component';

@Component({
  selector: 'app-classe-list',
  templateUrl: './classe-list.component.html',
  styleUrls: ['./classe-list.component.css']
})
export class ClasseListComponent implements OnInit {

  constructor(private service: ClasseService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private dialogService: DialogService) {}

  listData: MatTableDataSource<any>;
  classes: string[];
  displayedColumns: string[] = ['name','actions'];

  ngOnInit() {
    this.service.getClasses().subscribe(
      list => {
        let array = list.map(
          item => {
            return {
              $key: item.key,
              ...item.payload.val()
            };
          });
        this.listData = new MatTableDataSource(array);
        this.classes = array;
      });
  }

  onCreate(){
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

  onDelete(key){
    this.dialogService.openConfirmDialog("Are you sure to delete this record ?").
    afterClosed().subscribe(res => {
      if (res) {
        this.service.deleteClasse(key);
        this.notificationService.warn('Deleted successfully !');
      }
    });
  }

  onClassStudents(key){
    alert("the students of classe " + key)
  }
}