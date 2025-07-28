import { Component, HostListener } from '@angular/core';
import { LanguageService, Language } from '../../services/language.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
  standalone: false
})
export class LanguageSelectorComponent {
  languages: Language[] = [];
  currentLanguage: string = 'en';
  isDropdownOpen: boolean = false;

  constructor(private languageService: LanguageService) {
    this.languages = this.languageService.availableLanguages;
    this.currentLanguage = this.languageService.getCurrentLanguage();
    
    this.languageService.currentLanguage$.subscribe((lang: string) => {
      this.currentLanguage = lang;
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onLanguageChange(languageCode: string): void {
    this.languageService.setLanguage(languageCode);
    this.isDropdownOpen = false; // Close dropdown after selection
  }

  getCurrentLanguageFlag(): string {
    return this.languageService.getLanguageFlag(this.currentLanguage);
  }

  getCurrentLanguageName(): string {
    return this.languageService.getLanguageName(this.currentLanguage);
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.language-selector');
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }
}
