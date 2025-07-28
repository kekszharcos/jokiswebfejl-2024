# Translation System Setup Guide

Ez az alkalmazás hibrid fordítási rendszert használ:
1. **Statikus fordítások** - beépített szövegek a `translations.ts` fájlból
2. **API-alapú fordítások** - dinamikus tartalom fordítása MyMemory API-val

## Beállítás

### 1. MyMemory API

Az alkalmazás a MyMemory API-t használja, amely:
- **Ingyenes** - API kulcs nem szükséges
- **Korlátok**: 1000 kérés/nap IP-nként
- **Nyelvek**: 80+ nyelv támogatott
- **Sebesség**: Gyors válaszidő

### 2. API URL Konfiguráció

Az API URL már be van állítva a `api-translation.service.ts` fájlban:
```typescript
private apiUrl = 'https://api.mymemory.translated.net/get';
```

### 3. Használat

#### Statikus szövegekhez (translate pipe):
```html
{{ 'auth.login' | translate }}
```

#### Dinamikus szövegekhez (translate directive):
```html
<p appTranslateDynamic="Welcome to our application">Welcome to our application</p>
```

### 4. Működés

1. **Statikus fordítás**: Gyors, azonnali eredmény a helyi szótárból
2. **API fordítás**: Ha nincs statikus fordítás, az API-t hívja meg
3. **Hibakezelés**: Ha az API nem elérhető, megjeleníti az eredeti szöveget
4. **Gyorsítótár**: A fordítások automatikusan tárolódnak a memóriában

### 5. Nyelv Váltás

A nyelvválasztó automatikusan frissíti:
- Minden statikus fordítást (pipe-ok)
- Minden dinamikus fordítást (direktívák)

### 6. Új Fordítások Hozzáadása

#### Statikus fordításokhoz:
1. Nyisd meg `src/app/shared/services/translations.ts`
2. Add hozzá az angol és magyar fordításokat
3. Használd a template-ben: `{{ 'kulcs.neve' | translate }}`

#### Dinamikus fordításokhoz:
1. Csak add hozzá a direktívát a HTML elemhez:
   ```html
   <span appTranslateDynamic="Text to translate">Text to translate</span>
   ```

### 7. Hibaelhárítás

#### API nem elérhető:
- Ellenőrizd az internetkapcsolatot
- Console-ban láthatók a hibák
- Eredeti szöveg jelenik meg fallback-ként

#### Fordítás nem működik:
- Ellenőrizd a kulcs nevét a `translations.ts`-ben
- Bizonyosodj meg róla, hogy a `SharedModule` importálva van

#### Napi limit elérése:
- MyMemory: 1000 kérés/nap IP-nként
- Fallback: eredeti szöveg megjelenítése

### 8. Teljesítmény Optimalizálás

- Az API fordítások gyorsítótárazva vannak a `TranslationService`-ben
- Batch fordítás támogatott (több szöveg egyszerre)
- Offline működés: eredeti szöveg megjelenítése API hiba esetén
- Timeout: 10 másodperc API kérésekre

### 9. Támogatott Nyelvek

MyMemory API támogatja többek között:
- **en** - Angol
- **hu** - Magyar
- **de** - Német
- **es** - Spanyol
- **fr** - Francia
- **it** - Olasz
- **pt** - Portugál
- **ru** - Orosz

### 10. Példa Használat

```typescript
// Szolgáltatásban
constructor(private translationService: TranslationService) {}

// Statikus fordítás
getText(): string {
  return this.translationService.instant('auth.login');
}

// API fordítás
translateDynamicText(text: string): Observable<string> {
  return this.translationService.translate(text);
}
```

```html
<!-- Template-ben -->
<h1>{{ 'auth.welcome' | translate }}</h1>
<p appTranslateDynamic="This text will be translated dynamically">
  This text will be translated dynamically
</p>
```
