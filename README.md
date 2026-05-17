# GharManager Pro MAX AI

Ultra-premium AI-powered finance super app — vanilla HTML/CSS/JS + Firebase.

## Structure
```
gharmanager-pro/
├── index.html          # Entry point
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline support)
├── css/
│   └── style.css       # All styles
├── js/
│   └── script.js       # All logic (Firebase, AI, OCR, charts)
└── assets/
    └── icon.png        # App icon (add your own 512x512)
```

## Run locally
```bash
npx serve .
# or
python3 -m http.server 8080
```
Open http://localhost:8080

## Deploy
Drag the folder to Netlify / Vercel / Firebase Hosting. Done.

## Add an icon
Place a 512×512 PNG at `assets/icon.png`.
