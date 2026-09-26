/*
 * app.js — rendering del portfolio.
 * Strategia a prova di zero-manutenzione:
 *   1) prova a caricare projects.json (generato dalla GitHub Action)
 *   2) se manca o e vuoto, chiama direttamente l'API GitHub come fallback
 * In entrambi i casi la pagina resta aggiornata senza intervento manuale.
 */
(function () {
    "use strict";

    var USER = "XtremeAlex";
    var grid = document.getElementById("projects-grid");
    var meta = document.getElementById("projects-meta");
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* --- i18n IT/EN (default EN) --- */
    var I18N = {
        en: {
            "nav.projects": "Projects", "nav.site": "Site",
            "hero.title1": "My", "hero.title2": "Projects",
            "hero.statement": "A selection of my public repositories.",
            "hero.cta1": "View projects", "hero.cta2": "About me",
            "work.title": "My Projects", "work.loading": "Loading projects from GitHub\u2026",
            "meta.updated": "updated", "desc.fallback": "Open source project."
        },
        it: {
            "nav.projects": "Progetti", "nav.site": "Sito",
            "hero.title1": "I miei", "hero.title2": "Progetti",
            "hero.statement": "Una selezione dei miei repository pubblici.",
            "hero.cta1": "Vedi i progetti", "hero.cta2": "Chi sono",
            "work.title": "I miei progetti", "work.loading": "Caricamento progetti da GitHub\u2026",
            "meta.updated": "agg.", "desc.fallback": "Progetto open source."
        }
    };
    var lang = localStorage.getItem("portfolio-lang") || "en";
    var lastData = null;

    function t(key) { return (I18N[lang] && I18N[lang][key]) || (I18N.en[key] || key); }

    function applyI18n() {
        document.documentElement.lang = lang;
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var k = el.getAttribute("data-i18n");
            if (I18N[lang][k]) el.textContent = I18N[lang][k];
        });
        document.querySelectorAll(".lang-btn").forEach(function (b) {
            b.classList.toggle("active", b.getAttribute("data-lang") === lang);
        });
        if (lastData) render(lastData.projects, lastData.generatedAt);
    }

    document.querySelectorAll(".lang-btn").forEach(function (b) {
        b.addEventListener("click", function () {
            lang = b.getAttribute("data-lang");
            localStorage.setItem("portfolio-lang", lang);
            applyI18n();
        });
    });

    function escapeHtml(s) {
        return String(s || "").replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function pad(n) { return String(n).padStart(2, "0"); }

    function card(p, i) {
        var tags = [];
        if (p.language) tags.push('<span class="tag tag--lang">' + escapeHtml(p.language) + "</span>");
        (p.topics || []).slice(0, 4).forEach(function (t) {
            tags.push('<span class="tag">' + escapeHtml(t) + "</span>");
        });
        var stars = p.stars > 0
            ? '<span class="project__stars">&#9733; ' + p.stars + "</span>"
            : "";
        var href = p.homepage && /^https?:\/\//.test(p.homepage) ? p.homepage : p.url;
        return (
            '<a class="project" href="' + escapeHtml(href) + '" target="_blank" rel="noopener">' +
                '<div class="project__header">' +
                    '<span class="project__index">' + pad(i + 1) + "</span>" +
                    stars +
                "</div>" +
                '<h3 class="project__title">' + escapeHtml(p.name) + "</h3>" +
                '<p class="project__desc">' + escapeHtml(p.description || t("desc.fallback")) + "</p>" +
                '<div class="project__tags">' + tags.join("") + "</div>" +
            "</a>"
        );
    }

    function render(projects, generatedAt) {
        lastData = { projects: projects, generatedAt: generatedAt };
        if (!projects || !projects.length) {
            grid.innerHTML = '<p class="work__loading">' +
                (lang === "it" ? "Nessun progetto pubblico da mostrare." : "No public projects to show.") + "</p>";
            return;
        }
        grid.innerHTML = projects.map(card).join("");
        if (meta) {
            var when = generatedAt ? new Date(generatedAt) : new Date();
            meta.textContent = projects.length + " repository \u00b7 " + t("meta.updated") + " " +
                when.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB", { year: "numeric", month: "short", day: "numeric" });
        }
    }

    function showable(r) {
        if (r.fork || r.archived || r.private) return false;
        var n = (r.name || "").toLowerCase();
        if (n === USER.toLowerCase()) return false;
        if (n.endsWith(".github.io")) return false;
        return true;
    }

    function fromApi() {
        var url = "https://api.github.com/users/" + USER + "/repos?per_page=100&sort=pushed";
        fetch(url, { headers: { Accept: "application/vnd.github+json" } })
            .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
            .then(function (repos) {
                var projects = repos.filter(showable).map(function (r) {
                    return {
                        name: r.name, description: r.description, url: r.html_url,
                        homepage: r.homepage, language: r.language, topics: r.topics || [],
                        stars: r.stargazers_count || 0, updated: r.pushed_at
                    };
                });
                render(projects, null);
            })
            .catch(function () {
                grid.innerHTML = '<p class="work__loading">Impossibile caricare i progetti in questo momento. ' +
                    'Vedi <a class="footer__link" href="https://github.com/' + USER + '">GitHub</a>.</p>';
            });
    }

    // applica la lingua salvata all'avvio
    applyI18n();

    // 1) projects.json (preferito, niente rate limit)
    fetch("projects.json?" + Date.now())
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (data) {
            if (data && data.projects && data.projects.length) render(data.projects, data.generatedAt);
            else fromApi();
        })
        .catch(fromApi);   // 2) fallback diretto all'API
})();
