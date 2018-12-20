import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ClasseService {

  constructor(private firebase: AngularFireDatabase) { }
  
  classeList: AngularFireList<any>;

  form: FormGroup = new FormGroup({
    $key: new FormControl(null),
    name: new FormControl('', Validators.required)
  })

  getClasses() {
    this.classeList = this.firebase.list('classes');
    return this.classeList.snapshotChanges();
  }

  insertClasse(classe) {
    this.classeList.push({
      name: classe.name
    })
  }

  updateClasse(classe) {
    this.classeList.update(classe.$key,
      {
        name: classe.name
      })
  }

  deleteClasse($key: string) {
    this.classeList.remove($key);
  }

  initializeFormGroup() {
    this.form.setValue({
      $key: null,
      name: ''
    });
  }

  populateForm(classe) {
    this.form.setValue(classe);
  }

}
