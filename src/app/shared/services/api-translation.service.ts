import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

export interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiTranslationService {
  // Using MyMemory API (free tier) - no API key required
  private apiUrl = 'https://api.mymemory.translated.net/get';
  
  constructor(private http: HttpClient) {}

  /**
   * Translate text using MyMemory API
   * @param text Text to translate
   * @param fromLang Source language (e.g., 'en')
   * @param toLang Target language (e.g., 'hu')
   * @returns Observable<string> Translated text
   */
  translateText(text: string, fromLang: string, toLang: string): Observable<string> {
    // Skip translation if same language
    if (fromLang === toLang) {
      return of(text);
    }

    // Skip empty or very short text
    if (!text || text.trim().length < 2) {
      return of(text);
    }

    // MyMemory API parameters
    const params = new HttpParams()
      .set('q', text)
      .set('langpair', `${fromLang}|${toLang}`)
      .set('de', 'textifi@example.com'); // Required email for free tier

    return this.http.get<MyMemoryResponse>(this.apiUrl, { params })
      .pipe(
        map(response => {
          if (response && response.responseData && response.responseData.translatedText) {
            return response.responseData.translatedText;
          }
          throw new Error('Invalid response format');
        }),
        catchError(error => {
          console.warn('Translation API error:', error);
          // Fallback to original text if API fails
          return of(text);
        }),
        timeout(10000) // 10 second timeout
      );
  }

  /**
   * Translate multiple texts at once
   * @param texts Array of texts to translate
   * @param fromLang Source language
   * @param toLang Target language
   * @returns Observable<string[]> Array of translated texts
   */
  translateTexts(texts: string[], fromLang: string, toLang: string): Observable<string[]> {
    if (fromLang === toLang) {
      return of(texts);
    }

    // For MyMemory, we'll translate each text separately to avoid delimiter issues
    const translationObservables = texts.map(text => 
      this.translateText(text, fromLang, toLang)
    );

    // Combine all translation observables
    return new Observable<string[]>(observer => {
      const results: string[] = new Array(texts.length);
      let completed = 0;

      translationObservables.forEach((obs, index) => {
        obs.subscribe({
          next: (translatedText) => {
            results[index] = translatedText;
            completed++;
            if (completed === texts.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            console.warn(`Translation error for text ${index}:`, error);
            results[index] = texts[index]; // Use original text as fallback
            completed++;
            if (completed === texts.length) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Check if API is available
   * @returns Observable<boolean>
   */
  isApiAvailable(): Observable<boolean> {
    return this.translateText('hello', 'en', 'es')
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
