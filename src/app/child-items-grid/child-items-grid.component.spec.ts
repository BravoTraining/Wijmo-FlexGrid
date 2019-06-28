import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildItemsGridComponent } from './child-items-grid.component';

describe('ChildItemsGridComponent', () => {
  let component: ChildItemsGridComponent;
  let fixture: ComponentFixture<ChildItemsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildItemsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildItemsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
