import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedContainerComponent } from './verified-container.component';

describe('VerifiedContainerComponent', () => {
  let component: VerifiedContainerComponent;
  let fixture: ComponentFixture<VerifiedContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifiedContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifiedContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
