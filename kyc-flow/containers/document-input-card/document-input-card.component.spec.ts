import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentInputCardComponent } from './document-input-card.component';

describe('DocumentInputCardComponent', () => {
  let component: DocumentInputCardComponent;
  let fixture: ComponentFixture<DocumentInputCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentInputCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentInputCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
