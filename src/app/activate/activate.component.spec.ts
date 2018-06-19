import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiavteComponent } from './actiavte.component';

describe('ActiavteComponent', () => {
  let component: ActiavteComponent;
  let fixture: ComponentFixture<ActiavteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiavteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiavteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
