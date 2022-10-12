import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpContainerComponent } from './help-container/help-container.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
const authRoutes: Routes = [
  {
    path: '',
    component: HelpContainerComponent,
  },
];

@NgModule({
  declarations: [HelpContainerComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(authRoutes)
  ],
})
export class HelpModule {}
