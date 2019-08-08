import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BravoGroupPathComponent } from './bravo-group-path.component';

describe('BravoGroupPathComponent', () => {
  let component: BravoGroupPathComponent;
  let fixture: ComponentFixture<BravoGroupPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BravoGroupPathComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BravoGroupPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
