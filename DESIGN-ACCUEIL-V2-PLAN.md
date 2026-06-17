# Plan — `/design-accueil` v2 : "classe, éditorial, adulte"

> Refonte couche visuelle uniquement. Logique données + filtrage inchangée.
> App.tsx, EventGrid.tsx, supabase.ts, geocode.ts : INTOUCHÉS.

## 1. Typographie — ajout Playfair Display

- **Playfair Display** (serif éditorial, Google Fonts) pour les titres d'événements
  et le hero. Garde Poppins pour le corps/UI.
- Ajout dans `index.html` : `family=Playfair+Display:wght@700;800;900`.
- Usage : hero H1, titres de cartes événement.

## 2. Icônes — mapping Lucide (lucide-react)

`npm install lucide-react` (icônes ligne MIT, ~1.5KB tree-shaken).

| Catégorie | Icône Lucide | Rationale |
|---|---|---|
| Tout | `LayoutGrid` | vue globale |
| atelier | `Hammer` | artisanat |
| concert | `Music` | musique |
| exposition | `Palette` | art/peinture |
| conference | `Mic` | prise de parole |
| spectacle | `Film` | scène/représentation |
| marche | `ShoppingBag` | achat/marché |
| formation | `BookOpen` | apprentissage |
| autre | `Calendar` | générique événement |

Remplacer `TYPE_GLYPHS` emoji dans `EbCategoryIcons` et `EbEventCard`.
`event-meta.ts` conserve `TYPE_GLYPHS` (utilisé par `EventGrid.tsx` existant — INTOUCHÉ).

## 3. Photos contextuelles — `src/lib/event-images.ts`

Source : Unsplash (URLs stables par ID photo, licence libre).
Format : `https://images.unsplash.com/photo-{ID}?w=800&q=80&fit=crop&auto=format`

### Mapping catégorie → image par défaut

| Type | ID Unsplash | Sujet |
|---|---|---|
| atelier | `1565193566173-7a0ee3dbe261` | mains en poterie |
| concert | `1514525253161-7a46d19cd819` | concert salle |
| exposition | `1531243269054-5ebf6f34081e` | galerie d'art |
| conference | `1540575467063-178a50c2df87` | salle conférence |
| spectacle | `1507924538820-ede94a04019d` | scène de théâtre |
| marche | `1488459716781-31db52582fe9` | marché coloré |
| formation | `1524178232363-1fb2b075b655` | atelier formation |
| autre | `1511578314322-379afb476865` | rassemblement |

### Keyword overrides (mots-clés titre → image spécifique)

| Mots-clés | ID Unsplash | Sujet |
|---|---|---|
| poterie/céramique | `1565193566173-7a0ee3dbe261` | poterie |
| cuisine/culinaire/cook | `1556910103-1c02745aae4d` | atelier cuisine |
| yoga/méditation | `1545205597-3d9d02c29597` | yoga |
| danse/dance | `1518611012118-696072aa579a` | danse |
| peinture/aquarelle/dessin | `1579783901586-d88db74b4fe4` | peinture |
| jazz | `1415201364774-f6f0bb35f28f` | jazz |
| cirque | `1499364615650-ec38552f4f34` | cirque |
| jardin/jardinage | `1416879595882-3373a0480b5b` | jardinage |

### Priorité : `photos[0]` de la BDD si URL http → sinon keyword → sinon catégorie → sinon dégradé.

### Hero banner (EbPromoBanner)
ID `1529156069898-49953e39b3ac` — rassemblement communautaire chaleureux.

## 4. Direction artistique — leviers concrets

| Élément | Avant | Après |
|---|---|---|
| Couleur dominante | Corail partout | Cream/blanc, corail = accent CTA/actif seulement |
| Border-radius cartes | 18px | 10px |
| Border-radius boutons | 100px (pill) | Pill seulement pour chips/filtres, 8px pour CTA principaux |
| Ombre cartes | `shadow-md` coral | 1px border + ombre neutre très légère au hover |
| Hero | Dégradé corail flat | Photo plein-écran + overlay sombre + typo blanche |
| Icônes catégories | Emoji 🛠️🎵… | Lucide ligne fine dans cercle 1px gris |
| Catégorie active | Aplat coloré vif | Cercle border corail + icône corail |
| Cartes événements | Dégradé couleur org | Photo contextuelle 16:9 |
| Badge catégorie | Pill peach fond | Label discret en haut à gauche, petite font |
| Prix | Pill couleur | Texte simple (vert si gratuit, noir si payant) |

## 5. Composants à réécrire (in place)

1. `EbHeader` — logo plus fin, search plus propre, géométrie sobre
2. `EbPromoBanner` — photo hero plein-écran (overlay sombre)
3. `EbCategoryIcons` — Lucide icons, cercles sobres
4. `EbTabs` — underline actif (pas fond pill)
5. `EbFilterBar` — chips plus discrets, fond blanc
6. `EbEventCard` — photo 16:9, Playfair titre, layout Eventbrite strict
7. `EbEventGrid` — inchangé (passe juste les cartes refaites)
8. `EbLieuxTiles` — cards plus sobres, photo si dispo

## 6. Ajouts dans DesignAccueil.tsx

- Encart cross-sell (avant footer) : "Vous êtes une association ?"
- Footer refondu : grand public, liens simples

## 7. Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `index.html` | + Playfair Display Google Font |
| `src/lib/event-images.ts` | CRÉER |
| `src/components/eb/EbHeader.tsx` | RÉÉCRIRE |
| `src/components/eb/EbPromoBanner.tsx` | RÉÉCRIRE |
| `src/components/eb/EbCategoryIcons.tsx` | RÉÉCRIRE |
| `src/components/eb/EbTabs.tsx` | RÉÉCRIRE |
| `src/components/eb/EbFilterBar.tsx` | RÉÉCRIRE |
| `src/components/eb/EbEventCard.tsx` | RÉÉCRIRE |
| `src/components/eb/EbLieuxTiles.tsx` | RÉÉCRIRE |
| `src/pages/DesignAccueil.tsx` | + encart cross-sell + footer |
| `package.json` + `package-lock.json` | + lucide-react |

**Intouchés** : App.tsx, EventGrid.tsx, supabase.ts, geocode.ts, event-meta.ts, EbMap.tsx, EbEventGrid.tsx, main.tsx.
