import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LanguageService } from './language.service';
import { ApiTranslationService } from './api-translation.service';
import { translations } from './translations';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(
    private languageService: LanguageService,
    private apiTranslationService: ApiTranslationService
  ) {}

  /**
   * Get translation for a key, with API fallback for missing keys
   * @param key Translation key (e.g., 'menu.home')
   * @param params Optional parameters for interpolation
   * @returns Observable<string> Translated text
   */
  translate(key: string, params?: any): Observable<string> {
    const currentLang = this.languageService.getCurrentLanguage();
    const fallbackLang = 'en';
    
    // First try to get translation from static dictionary
    const staticTranslation = this.getStaticTranslation(key, currentLang, fallbackLang);
    
    if (staticTranslation && staticTranslation !== key) {
      // Found in static dictionary
      return of(this.interpolate(staticTranslation, params));
    }
    
    // Not found in static dictionary, try API translation
    if (currentLang !== fallbackLang) {
      // Get English version as source for translation
      const englishText = this.getStaticTranslation(key, fallbackLang, fallbackLang) || key;
      
      return this.apiTranslationService.translateText(englishText, fallbackLang, currentLang)
        .pipe(
          map(translatedText => this.interpolate(translatedText, params)),
          catchError(() => of(this.interpolate(key, params))) // Fallback to key
        );
    }
    
    return of(this.interpolate(key, params));
  }

  /**
   * Get instant translation (synchronous) - only from static dictionary
   * @param key Translation key
   * @param params Optional parameters
   * @returns string Translated text or key if not found
   */
  instant(key: string, params?: any): string {
    const currentLang = this.languageService.getCurrentLanguage();
    const fallbackLang = 'en';
    
    const translation = this.getStaticTranslation(key, currentLang, fallbackLang);
    return this.interpolate(translation || key, params);
  }

  /**
   * Translate dynamic text that's not in the dictionary
   * @param text Text to translate
   * @param targetLang Optional target language (uses current language if not specified)
   * @returns Observable<string> Translated text
   */
  translateDynamicText(text: string, targetLang?: string): Observable<string> {
    const currentLang = targetLang || this.languageService.getCurrentLanguage();
    const sourceLang = 'en'; // Assume source is English
    
    if (currentLang === sourceLang) {
      return of(text);
    }
    
    return this.apiTranslationService.translateText(text, sourceLang, currentLang)
      .pipe(
        catchError(() => of(text)) // Return original text on error
      );
  }

  private getStaticTranslation(key: string, currentLang: string, fallbackLang: string): string | null {
    // Try current language
    const currentTranslations = translations[currentLang as keyof typeof translations];
    if (currentTranslations && currentTranslations[key as keyof typeof currentTranslations]) {
      return currentTranslations[key as keyof typeof currentTranslations];
    }
    
    // Try fallback language
    if (currentLang !== fallbackLang) {
      const fallbackTranslations = translations[fallbackLang as keyof typeof translations];
      if (fallbackTranslations && fallbackTranslations[key as keyof typeof fallbackTranslations]) {
        return fallbackTranslations[key as keyof typeof fallbackTranslations];
      }
    }
    
    return null;
  }

  private interpolate(text: string, params?: any): string {
    if (!params) return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = params[key.trim()];
      return value !== undefined ? value : match;
    });
  }
}
