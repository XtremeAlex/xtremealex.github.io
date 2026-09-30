# xtremealex.github.io

Il mio portfolio open source (Andrei Alexandru Dabija, XtremeAlex), online su
[xtremealex.github.io](https://xtremealex.github.io/).

La pagina elenca i miei repository pubblici e si aggiorna da sola: una
GitHub Action rigenera `projects.json` dai dati dell'API GitHub ogni giorno
(alle 04:30 UTC) e a ogni push su `main` o `develop`. Quando pubblichi un nuovo
repository, compare qui entro 24 ore, oppure subito se avvii l'action a mano
(tab **Actions** → "Aggiorna portfolio" → **Run workflow**). Nessun intervento
manuale sul sito.

> Stato: attivo, si aggiorna da solo.

## Come funziona

- `scripts/build-projects.mjs`: interroga l'API GitHub e scrive `projects.json` (Node 20, nessuna dipendenza).
- `.github/workflows/update-portfolio.yml`: esegue lo script su schedule/push e committa `projects.json` se cambia.
- `index.html` + `styles.css` + `app.js`: frontend statico (estetica coerente con [2ad.bubume.it](https://2ad.bubume.it/)). `app.js` carica `projects.json`; se manca, interroga direttamente l'API GitHub come fallback.

Non c'è niente da mantenere: progetti, descrizioni, linguaggi e topics arrivano
direttamente da GitHub. Per far apparire meglio un progetto basta compilare
**Description** e **Topics** nella sua pagina GitHub. Il sito ha anche la
foto profilo presa da GitHub e un selettore di lingua IT/EN.

## Licenza
Distribuito sotto licenza MIT. Vedi il file [`LICENSE`](LICENSE).

## Sviluppo locale

```bash
# rigenera projects.json
GITHUB_USER=XtremeAlex node scripts/build-projects.mjs

# servi la pagina in locale
python3 -m http.server 8080
# apri http://localhost:8080
```

## Contatti

Andrei Alexandru Dabija · [LinkedIn](https://www.linkedin.com/in/andrei-alexandru-dabija/) · [github.com/XtremeAlex](https://github.com/XtremeAlex) · [2ad.bubume.it](https://2ad.bubume.it/)
