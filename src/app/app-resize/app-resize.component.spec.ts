import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppResizeComponent } from './app-resize.component';

describe('AppResizeComponent', () => {
  let component: AppResizeComponent;
  let fixture: ComponentFixture<AppResizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppResizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppResizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
