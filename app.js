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
                '<p class="project__desc">' + escapeHtml(p.description || "Progetto open source.") + "</p>" +
                '<div class="project__tags">' + tags.join("") + "</div>" +
            "</a>"
        );
    }

    function render(projects, generatedAt) {
        if (!projects || !projects.length) {
            grid.innerHTML = '<p class="work__loading">Nessun progetto pubblico da mostrare.</p>';
            return;
        }
        grid.innerHTML = projects.map(card).join("");
        if (meta) {
            var when = generatedAt ? new Date(generatedAt) : new Date();
            meta.textContent = projects.length + " repository \u00b7 agg. " +
                when.toLocaleDateString("it-IT", { year: "numeric", month: "short", day: "numeric" });
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

    // 1) projects.json (preferito, niente rate limit)
    fetch("projects.json?" + Date.now())
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (data) {
            if (data && data.projects && data.projects.length) render(data.projects, data.generatedAt);
            else fromApi();
        })
        .catch(fromApi);   // 2) fallback diretto all'API
})();
