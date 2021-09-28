import { Component, OnInit,ViewChild,Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import {DISHES} from '../shared/dishes';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Comment} from '../shared/comment';
import { visibility,flyInOut ,expand} from '../animations/app.animations';
@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      visibility(),
      expand()
    ]
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm:Comment;
  commentFormGroup:FormGroup;
  date :Date;
  dishcopy: Dish;
  errMess: string;
  visibility = 'shown';
  constructor(private dishservice: DishService,
    @Inject('BaseURL') private baseURL,
    private route: ActivatedRoute,
    private location: Location ,private fb: FormBuilder) {
      this.createForm();
     }

    ngOnInit() {
      this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess);    
      }
    @ViewChild('fform') commentFormDirective;
    formErrors = {
      'author': '',
      'comment': ''
    };
    currentList={
      'author':'',
      'comment':'',
      'rating':'',  
      }
    validationMessages = {
      'author': {
        'required':' Name is required.',
        'minlength':' Name must be at least 2 characters long.',
      },
      'comment': {
        'required':'Comment is required.'
       },
    };
    setPrevNext(dishId: string) {
      const index = this.dishIds.indexOf(dishId);
      this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
      this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }
    goBack(): void {
      this.location.back();
    }
    createForm() : void {
      this.commentFormGroup = this.fb.group({
        author: ['', [Validators.required, Validators.minLength(2)]],
        comment: ['', [Validators.required] ],
        rating:'5',
      });
      this.commentFormGroup.valueChanges
        .subscribe(data => this.onValueChanged(data));
  
      this.onValueChanged(); // (re)set validation messages now
    }
    onSubmit() {
      this.currentList.author='';
      this.currentList.comment='';
      this.currentList.rating='';
      // this.commentForm.author='';
      // this.commentForm.comment='';
      // this.commentForm.rating='';
      this.commentForm = this.commentFormGroup.value;
      this.commentForm.date=new Date().toString();
      this.dishcopy.comments.push(this.commentForm);
      this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });

      this.commentFormDirective.resetForm();
      this.commentFormGroup.reset({
        rating:'5',
        author: '',
        comment: '',
      });
    }

    handleComment(comment) {      
      this.currentList.comment=comment.target.value;}
    handleAuthor(author) {      
      this.currentList.author=author.target.value;}
      updateSetting(event) {
        this.currentList.rating = event.value;
      }
    onValueChanged(data?: any) {
      if (!this.commentFormGroup) { return; }
      const form = this.commentFormGroup;
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      } 
    }
    
}
