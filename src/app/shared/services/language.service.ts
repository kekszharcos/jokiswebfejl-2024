import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  public availableLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hu', name: 'Magyar', flag: '🇭🇺' }
  ];

  constructor() {
    // Check if language is saved in localStorage
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && this.availableLanguages.find(lang => lang.code === savedLanguage)) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(languageCode: string): void {
    if (this.availableLanguages.find(lang => lang.code === languageCode)) {
      this.currentLanguageSubject.next(languageCode);
      localStorage.setItem('app-language', languageCode);
      
      // Reload the page to apply the new language
      window.location.reload();
    }
  }

  getLanguageName(code: string): string {
    const language = this.availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  getLanguageFlag(code: string): string {
    const language = this.availableLanguages.find(lang => lang.code === code);
    return language ? language.flag : '';
  }
}
