# xtremealex.github.io

Portfolio open source di Andrei Alexandru Dabija (XtremeAlex).

La pagina elenca i repository pubblici e **si aggiorna da sola**: una GitHub Action
rigenera `projects.json` dai dati dell'API GitHub ogni giorno e a ogni push. Quando
pubblichi un nuovo repository, entro 24 ore (o subito, avviando l'action a mano)
compare qui senza alcun intervento manuale.

## Come funziona

- `scripts/build-projects.mjs` — interroga l'API GitHub e scrive `projects.json` (Node 20, nessuna dipendenza).
- `.github/workflows/update-portfolio.yml` — esegue lo script su schedule/push e committa `projects.json` se cambia.
- `index.html` + `styles.css` + `app.js` — frontend statico (estetica coerente con [2ad.bubume.it](https://2ad.bubume.it/)). `app.js` carica `projects.json`; se manca, interroga direttamente l'API GitHub come fallback.

Nessuna manutenzione richiesta: i progetti, le descrizioni, i linguaggi e i topics
vengono presi automaticamente da GitHub.

## Sviluppo locale

```bash
# rigenera projects.json
GITHUB_USER=XtremeAlex node scripts/build-projects.mjs

# servi la pagina in locale
python3 -m http.server 8080
# apri http://localhost:8080
```

## Link

- Sito principale: [2ad.bubume.it](https://2ad.bubume.it/)
- GitHub: [XtremeAlex](https://github.com/XtremeAlex)
- LinkedIn: [andrei-alexandru-dabija](https://www.linkedin.com/in/andrei-alexandru-dabija/)
