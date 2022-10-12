import { Component, Input, OnInit, Output, EventEmitter, Renderer2, ViewChild, ElementRef } from '@angular/core';
export interface Option {
  display: string;
  value: string;
}
@Component({
  selector: 'app-documents-dropdown',
  templateUrl: './documents-dropdown.component.html',
  styleUrls: ['./documents-dropdown.component.scss'],
})
export class DocumentsDropdownComponent implements OnInit {
  @Input() placeholderText = 'select';
  @Input() options: Option[] = [];
  @Input() disabled = false;
  @Output() selection = new EventEmitter();
  @Input() selected: Option = {} as Option;
  @ViewChild('toggleButton', { static: false, read: ElementRef }) toggleButton: any;
  areOptionsVisible = false;
  constructor(private renderer: Renderer2) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (e.target !== this.toggleButton.nativeElement) {
        this.areOptionsVisible = false;
      }
    });
  }

  ngOnInit(): void {
  }

  selectionHandler(option: Option) {
    this.selected = option;
    this.areOptionsVisible = false;
    this.selection.emit(this.selected);
  }

  toggleOptionsVisibility() {
    if (!this.disabled) {
      this.areOptionsVisible = !this.areOptionsVisible;
    }
  }
}
