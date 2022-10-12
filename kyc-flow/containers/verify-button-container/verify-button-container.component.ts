import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-verify-button-container',
  templateUrl: './verify-button-container.component.html',
  styleUrls: ['./verify-button-container.component.scss'],
})
export class VerifyButtonContainerComponent implements OnInit {
  @Input() titleText: string = '';
  @Input() buttonText: string = '';
  @Input() footerText: string = '';
  @Output() buttonClicked = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}
}
