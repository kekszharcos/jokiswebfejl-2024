import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from './pipes/translate.pipe';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { TranslateDynamicDirective } from './directives/translate-dynamic.directive';

@NgModule({
  declarations: [
    TranslatePipe,
    LanguageSelectorComponent,
    TranslateDynamicDirective
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule
  ],
  exports: [
    TranslatePipe,
    LanguageSelectorComponent,
    TranslateDynamicDirective
  ]
})
export class SharedModule { }
