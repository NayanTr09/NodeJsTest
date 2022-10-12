import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycSuccessContainerComponent } from './kyc-success-container.component';

describe('KycSuccessContainerComponent', () => {
  let component: KycSuccessContainerComponent;
  let fixture: ComponentFixture<KycSuccessContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KycSuccessContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KycSuccessContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
