import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private firebase: AngularFireDatabase) { }
  
  groupList: AngularFireList<any>;

  form: FormGroup = new FormGroup({
    $key: new FormControl(null),
    name: new FormControl('', Validators.required)
  })

  getGroups() {
    this.groupList = this.firebase.list('groups');
    return this.groupList.snapshotChanges();
  }

  insertGroup(group) {
    this.groupList.push({
      name: group.name
    })
  }

  updateGroup(group) {
    this.groupList.update(group.$key,
      {
        name: group.name
      })
  }

  deleteGroup($key: string) {
    this.groupList.remove($key);
  }

  initializeFormGroup() {
    this.form.setValue({
      $key: null,
      name: ''
    });
  }

  populateForm(group) {
    this.form.setValue(group);
  }

}
