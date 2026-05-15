# Lock In Timer 🎮⏱️

Eine moderne Study-Website zum fokussierten Lernen. Du kannst einen Timer bis zu einer bestimmten Uhrzeit starten, eigene Countdown-Zeiten setzen oder mit Intervallen lernen. Dazu gibt es Fokusnotizen, Aufgabenliste, Vollbildmodus, verschiedene Designs und seltene Mascot-Cameos.

## Features ✨

- ⏰ Timer bis zu einer frei gewaehlten Zieluhrzeit
- ⌛ Eigener Countdown, z.B. 25 Minuten, 45 Minuten oder 1 Stunde
- 🔁 Intervalllernen mit Fokuszeit, Pausenzeit und Runden
- 🧠 Fokusnotiz fuer das Ziel der aktuellen Session
- ✅ Aufgabenliste mit erledigten Tasks
- 🖥️ Vollbild-/Fokusmodus fuer den Timer
- 🎨 Vier Designs: Forest, Arcade, Midnight und Sunset
- 💾 Lokale Speicherung von Tasks, Notizen, Design und Lernminuten
- 🌟 Seltene Mascot-Cameos mit eigenen bereitgestellten Game-Mascots
- 🔇 Schalter fuer Sound und Cameos

## Start 🚀

Die Website ist komplett statisch und braucht keinen Build-Schritt.

```text
index.html im Browser oeffnen
```

Alternativ kannst du den Ordner mit einem lokalen Webserver ausliefern, falls du spaeter weitere Assets oder Browser-Funktionen testen moechtest.

## Architektur 🏗️

```text
LockInTimer/
├── index.html
├── styles.css
├── script.js
├── assets/
│   └── mascots/
│       ├── eigene SVG-Mascots
│       └── optionale eigene Mascot-Dateien
└── README.md
```

## Dateien 📁

`index.html`

Enthaelt die komplette Seitenstruktur: Timerbereich, Modus-Auswahl, Kontrollbuttons, Fokusplan, Notizen, Designauswahl und Einstellungen.

`styles.css`

Enthaelt das gesamte Styling: Layout, responsive Ansicht, Timerdesigns, Midnight-Theme, Vollbild-Fokusmodus, Buttons, Panels und Mascot-Animationen.

`script.js`

Steuert die Anwendung: Timerlogik, Countdown, Zieluhrzeit, Intervallphasen, LocalStorage, Vollbildmodus, Theme-Wechsel, Aufgabenliste, Sound und Mascot-Cameos.

`assets/mascots/`

Enthaelt die bereitgestellten Mascots im eigenen Stil. Du kannst jederzeit weitere eigene Mascots hinzufuegen und sie in `script.js` in der `characterAssets`-Liste eintragen.

## Timer-Modi ⏳

`Bis Uhrzeit`

Du waehlst eine Uhrzeit, z.B. 19:30. Der Timer zeigt dann an, wie lange es noch bis zu dieser Uhrzeit dauert.

`Countdown`

Du stellst eine feste Dauer ein, z.B. 1 Stunde. Der Timer laeuft dann von dieser Zeit herunter.

`Intervall`

Du stellst Fokuszeit, Pausenzeit und Runden ein. Nach jeder Phase springt der Timer automatisch zur naechsten Phase.

## Designs 🎨

Die Website bringt vier Timerdesigns mit:

- Forest
- Arcade
- Midnight
- Sunset

Die Auswahl wird im Browser gespeichert und bleibt nach dem Neuladen erhalten.

## Mascots 🌟

Ich habe eigene Mascots bereitgestellt, die zum Game-Study-Stil passen. Sie erscheinen selten als kleine Cameos im Timer und koennen in den Einstellungen deaktiviert werden.

Du kannst eigene Mascots hinzufuegen:

1. Datei in `assets/mascots/` ablegen.
2. In `script.js` einen neuen Eintrag in `characterAssets` hinzufuegen.
3. Seite neu laden.

## Speicherung 💾

Die Website nutzt `localStorage`. Gespeichert werden:

- erledigte Lernminuten
- Aufgabenliste
- Fokusnotiz
- ausgewaehltes Design

Es wird kein Server verwendet und nichts online synchronisiert.

## Hinweise 🛠️

- Wenn Aenderungen nicht sichtbar sind, einmal mit `Strg + F5` neu laden.
- Der Vollbildbutton nutzt einen eigenen Fokusmodus und versucht zusaetzlich natives Browser-Vollbild.
- Die App funktioniert direkt lokal ueber `index.html`.
