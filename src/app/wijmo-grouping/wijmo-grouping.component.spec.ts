import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WijmoGroupingComponent } from './wijmo-grouping.component';

describe('WijmoGroupingComponent', () => {
  let component: WijmoGroupingComponent;
  let fixture: ComponentFixture<WijmoGroupingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WijmoGroupingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WijmoGroupingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
