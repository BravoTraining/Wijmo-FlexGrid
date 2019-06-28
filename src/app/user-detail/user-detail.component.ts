import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, blocks, sexs } from '../model/user';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: User;
  formDetail: FormGroup;
  sex = sexs;
  block = blocks;
  isDisable = true;
  isEdited = false;

  constructor(
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private location: Location,
    private userService: UserService) { 
   }


  ngOnInit() {
    this.onInitFormDetail();
    this.getUserById();
  }

  onInitFormDetail(){
    this.formDetail = this.fb.group({
      id: 1,
      name: '',
      email: '',
      birthday: new Date(),
      sex: this.sex[0],
      phoneNumber: '',
      address: '',
      isBlock: this.block[0]
    });
  }

  getUserById(): void{
    const id = +this.router.snapshot.paramMap.get('id');
    this.userService.getUserById(id)
    .subscribe(us => {
      this.user = us;
      this.setDataToForm(this.user);
    });
  }

  setDataToForm(userForm: User){
    this.formDetail = this.fb.group({
      id: userForm.id,
      name: [userForm.name, [Validators.required, Validators.minLength(2)]],
      email: [userForm.email, [Validators.required, Validators.email]],
      birthday: [new Date(userForm.birthday), [Validators.required]],
      sex: [userForm.sex, [Validators.required]],
      phoneNumber: [userForm.phoneNumber, [Validators.required]],
      address: [userForm.address, [Validators.required, Validators.minLength(2)]],
      isBlock: [userForm.isBlock, [Validators.required]]
    });
  }

  onEditClick(){
    this.isEdited = !this.isEdited;
    this.isDisable = !this.isDisable;
  }

  onSaveClick(){
    this.user = this.formDetail.value;
    
    this.userService.updateUser(this.user)
    .subscribe(() => this.goBack());
  }

  goBack(): void{
    this.location.back();
  }

}
