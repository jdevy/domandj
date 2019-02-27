import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StudentItem } from './shared/studentItem.model';
import { Item } from './shared/item.model';
import { ClasseItem } from '../zclasse/shared/classeItem.model';


@Injectable({
  providedIn: 'root'
})
export class StudentService {


  studentItemsDoc: AngularFirestoreDocument<Item>;
  studentItems: Observable<StudentItem[]>;
  private classeId: string;
  private userId: string;

  constructor(public afs: AngularFirestore) { }

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl('', Validators.required)
  })

  getStudents() {
    console.log(" service getStudents for user : " + this.userId);
    console.log(" service getStudents for classe : " + this.classeId); 
    this.studentItemsDoc = this.afs.doc<Item>('user/' + this.userId + '/ClasseItems/' + this.classeId);
    return this.studentItemsDoc.collection<StudentItem>('StudentItems').valueChanges();
  }

  async insertStudent(student: StudentItem) {
    const newId = this.afs.createId();
    const studentItem: StudentItem = {
      name: student.name,
      id: newId
    };

    await this.studentItemsDoc.collection<StudentItem>('StudentItems').doc(newId).set(studentItem).then(
      () => {
        console.log("-- student inserted : " + student.name);
     //   this.notificationService.success(':: inserted successfully');
      },
      (error) => {
        console.log(error);
      //  this.notificationService.warn(':: erreur technique ');
      });
  }

  // async updateStudent(student: StudentItem) {
  //   await this.studentItemsDoc.collection<StudentItem>('StudentItems').doc(student.id).update(student).then(
  //     () => {
  //       console.log("-- student updated : " + student.name);
  //       this.notificationService.success(':: updated successfully');
  //     },
  //     (error) => {
  //       console.log(error);
  //       this.notificationService.warn(':: erreur technique ');
  //     });
  // }

  async deleteStudent(id: string) {
    await this.studentItemsDoc.collection<StudentItem>('StudentItems').doc(id).delete()
      .catch((error) => { alert(error); });
  }

  initializeFormGroup() {
    this.form.setValue({
      id: null,
      name: ''
    });
  }

  setClasseId(id) {
    this.classeId = id;
  } 

  initialize(classeId, userId) {
    this.classeId = classeId;
    this.userId = userId;
  }
}
