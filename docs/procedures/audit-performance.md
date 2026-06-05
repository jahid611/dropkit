# ⚡ Procédure — Audit de performance

Toujours **mesurer → corriger → re-mesurer**. Jamais d'optimisation non chiffrée.

1. **Mesurer (froid + chaud)** sur l'URL prod :
   ```bash
   curl -s -o /dev/null -w "ttfb:%{time_starttransfer}s total:%{time_total}s http:%{http_code}\n" <URL>
   ```
   Lancer 2x : le 1er = froid (cold start), le 2e = chaud. Tester `/`, `/d/<slug>`, `/login`.
2. **Rendu réel** : Lighthouse / PageSpeed Insights pour LCP, CLS, poids des assets.
3. **Classer les causes par impact** (cf. PERFORMANCE.md) — ne pas se disperser.
4. **Corriger une cause à la fois.** Pour DropKit, par ordre :
   - Cold start DB (pooling, moins de requêtes, init allégée),
   - Images (`next/image` + `next.config` images),
   - Requêtes séquentielles → parallèles,
   - Fonts superflues.
5. **Re-mesurer** et **consigner avant/après** dans le tableau « Journal des correctifs » de PERFORMANCE.md.
6. **Tracer** : cocher la ROADMAP Phase 1, ligne JOURNAL.
