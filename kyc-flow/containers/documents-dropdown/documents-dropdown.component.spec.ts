import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsDropdownComponent } from './documents-dropdown.component';

describe('DocumentsDropdownComponent', () => {
  let component: DocumentsDropdownComponent;
  let fixture: ComponentFixture<DocumentsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentsDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
