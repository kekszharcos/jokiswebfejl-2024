import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiTranslationService } from '../services/api-translation.service';
import { LanguageService } from '../services/language.service';

@Directive({
  selector: '[appTranslateDynamic]',
  standalone: false
})
export class TranslateDynamicDirective implements OnInit, OnDestroy {
  @Input('appTranslateDynamic') originalText: string = '';
  
  private subscription: Subscription = new Subscription();
  
  constructor(
    private el: ElementRef,
    private apiTranslationService: ApiTranslationService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.translateText();
    
    // Re-translate when language changes
    this.subscription.add(
      this.languageService.currentLanguage$.subscribe(() => {
        this.translateText();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private translateText() {
    if (!this.originalText) {
      this.originalText = this.el.nativeElement.textContent || '';
    }

    const currentLang = this.languageService.getCurrentLanguage();
    
    if (currentLang === 'en') {
      this.el.nativeElement.textContent = this.originalText;
      return;
    }

    this.subscription.add(
      this.apiTranslationService.translateText(this.originalText, 'en', currentLang)
        .subscribe(translatedText => {
          this.el.nativeElement.textContent = translatedText;
        })
    );
  }
}
