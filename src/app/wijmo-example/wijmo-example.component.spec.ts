import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WijmoEmapleComponent } from './wijmo-emaple.component';

describe('WijmoEmapleComponent', () => {
  let component: WijmoEmapleComponent;
  let fixture: ComponentFixture<WijmoEmapleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WijmoEmapleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WijmoEmapleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
