import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
})
export class CommonHeaderComponent implements OnInit {
  @Input() headerText: string = '';
  @Output() goBackEvent = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}
  goBack() {
    this.goBackEvent.emit('');
  }
}
