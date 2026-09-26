#!/usr/bin/env node
/**
 * build-projects.mjs
 * Genera projects.json interrogando l'API GitHub dei repository pubblici.
 * Nessuna dipendenza esterna: usa fetch nativo (Node 18+).
 *
 * Uso:
 *   GITHUB_USER=XtremeAlex node scripts/build-projects.mjs
 *   (facoltativo) GITHUB_TOKEN=... per alzare il rate limit
 *
 * Regole:
 * - Esclude il repo profilo (stesso nome utente) e il repo del sito (*.github.io)
 * - Esclude fork e repo archiviati
 * - Ordina: prima per "pushed" recente, poi per stelle
 * - Mappa description/topics/linguaggio in un formato stabile per il frontend
 */

const USER = process.env.GITHUB_USER || "XtremeAlex";
const TOKEN = process.env.GITHUB_TOKEN || "";
const OUT = new URL("../projects.json", import.meta.url);

const headers = {
  "Accept": "application/vnd.github+json",
  "User-Agent": `${USER}-portfolio-build`,
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
};

async function fetchAllRepos() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&sort=pushed`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

function toCard(repo) {
  return {
    name: repo.name,
    description: repo.description || "",
    url: repo.html_url,
    homepage: repo.homepage || "",
    language: repo.language || "",
    topics: repo.topics || [],
    stars: repo.stargazers_count || 0,
    updated: repo.pushed_at
  };
}

function isShowable(repo) {
  if (repo.fork) return false;
  if (repo.archived) return false;
  if (repo.private) return false;
  const lower = repo.name.toLowerCase();
  if (lower === USER.toLowerCase()) return false;        // repo profilo
  if (lower.endsWith(".github.io")) return false;        // il sito stesso
  return true;
}

try {
  const raw = await fetchAllRepos();
  const cards = raw
    .filter(isShowable)
    .map(toCard)
    .sort((a, b) => {
      const t = new Date(b.updated) - new Date(a.updated);
      return t !== 0 ? t : b.stars - a.stars;
    });

  const payload = {
    generatedAt: new Date().toISOString(),
    user: USER,
    count: cards.length,
    projects: cards
  };

  const { writeFileSync } = await import("node:fs");
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`projects.json scritto: ${cards.length} progetti.`);
} catch (err) {
  console.error("Errore build projects.json:", err.message);
  process.exit(1);
}
