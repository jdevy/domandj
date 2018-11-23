import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialogConfig, MatDialog } from '@angular/material';
import { NotificationService } from '../../shared/notification.service';
import { DialogService } from '../../shared/dialog.service';
import { GroupService } from '../../shared/group.service';
import { GroupComponent } from '../group/group.component';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {

  constructor(private service: GroupService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private dialogService: DialogService) {}

  listData: MatTableDataSource<any>;
  displayedColumns: string[] = ['name','actions'];

  ngOnInit() {
    this.service.getGroups().subscribe(
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

  onCreate(){
    this.service.initializeFormGroup();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(GroupComponent, dialogConfig);
  }

  onEdit(row) {
    this.service.populateForm(row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(GroupComponent, dialogConfig);
  }

  onDelete(key){
    this.dialogService.openConfirmDialog("Are you sure to delete this record ?").
    afterClosed().subscribe(res => {
      if (res) {
        this.service.deleteGroup(key);
        this.notificationService.warn('Deleted successfully !');
      }
    });
  }

}
