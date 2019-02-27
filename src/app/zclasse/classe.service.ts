import { Injectable } from '@angular/core';
//import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ClasseItem } from './shared/classeItem.model';
import { Item } from './shared/item.model';
import { AlertService } from '../alert/alert.service';
import { NotificationService } from '../shared/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ClasseService {


  classeItemsDoc: AngularFirestoreDocument<Item>;
  classeItems: Observable<ClasseItem[]>;


  //  constructor(private firebase: AngularFireDatabase) { }
  constructor(public afs: AngularFirestore,
    private notificationService: NotificationService) { }

  //  classeList: AngularFireList<any>;

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', Validators.required)
  })

  getClasses(uid: string) {
    console.log(" service getClasses for user : " + uid);
    this.classeItemsDoc = this.afs.doc<Item>('user/' + uid);
    return this.classeItemsDoc.collection<ClasseItem>('ClasseItems').valueChanges();
  }

  async insertClasse(classe: ClasseItem) {
    const newId = this.afs.createId();
    const classeItem: ClasseItem = {
      name: classe.name,
      id: newId
    };

    await this.classeItemsDoc.collection<ClasseItem>('ClasseItems').doc(newId).set(classeItem).then(
      () => {
        console.log("-- classe inserted : " + classe.name);
        this.notificationService.success(':: inserted successfully');
      },
      (error) => {
        console.log(error);
        this.notificationService.warn(':: erreur technique ');
      });
  }

  async updateClasse(classe: ClasseItem) {
    await this.classeItemsDoc.collection<ClasseItem>('ClasseItems').doc(classe.id).update(classe).then(
      () => {
        console.log("-- classe updated : " + classe.name);
        this.notificationService.success(':: updated successfully');
      },
      (error) => {
        console.log(error);
        this.notificationService.warn(':: erreur technique ');
      });
  }

  async deleteClasse(id: string) {
    await this.classeItemsDoc.collection<ClasseItem>('ClasseItems').doc(id).delete()
      .catch((error) => { alert(error); });
  }

  initializeFormGroup() {
    this.form.setValue({
      id: null,
      name: ''
    });
  }

  populateForm(classe) {
    this.form.setValue(classe);
  }

}
