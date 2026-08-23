# ACADEMY PRIME — Frontend

Learn to Earn. A Web3 education platform frontend built with Next.js (App Router),
TypeScript, and Tailwind CSS. This is the **frontend only** — no backend is included.
All data comes from mock services in `src/services/` shaped to match the future
FastAPI + PostgreSQL + Solana backend.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/en`. Visit `/ar` for the Arabic,
RTL version.

## Architecture

```
src/
  app/
    page.tsx                # redirects "/" -> "/en"
    [locale]/
      layout.tsx             # <html lang/dir>, fonts, Navbar + Footer shell
      page.tsx                # homepage
  components/
    layout/                  # Navbar, MobileMenu, Footer
    home/                    # Hero, HowItWorks, FeaturedCourses
    ui/                      # Button, CourseCard, LanguageSwitcher
  services/                  # mock services shaped like the future REST client
  data/                      # mock fixtures
  lib/i18n.ts                 # locale registry + dictionary loader
  locales/en, locales/ar      # translation JSON, split by feature
  hooks/                      # useLocale
  types/                      # Course, User, Locale
```

## Internationalization

- Routes are locale-prefixed (`/en/...`, `/ar/...`) via the `app/[locale]` segment.
- Copy lives in `src/locales/{locale}/*.json`, never hard-coded in components.
- `html[dir]` flips to `rtl` automatically for Arabic; layout uses logical
  Tailwind utilities (`ms-`, `me-`, `start-`, `end-`) instead of `ml-`/`mr-`/`left-`/`right-`
  so mirroring is automatic.
- To make Arabic the default locale later, change `defaultLocale` in `src/lib/i18n.ts`
  and reorder `locales` — no component changes required.

## Mock vs. real backend

Every mock service (`authService`, `walletService`, `courseService`) is written
with the same async, REST-shaped method signatures the real FastAPI client will
have. Each mock method has a `// TODO(backend)` comment showing the endpoint it
will call. Wallet connection is explicitly mocked — no real Solana transaction is
ever simulated as if it were real.

## Design tokens

Defined in `tailwind.config.ts`:

- **Ink** (`ink-950`…`ink-300`) — deep navy, primary text and dark sections.
- **Paper** (`paper-50`…`paper-200`) — cool off-white background, not cream.
- **Brass** (`brass-300`…`brass-600`) — reward/credential accent, used sparingly.
- **Emerald** (`emerald-500`…`emerald-700`) — verification/growth accent.
- Display face: Fraunces (Latin) / Markazi Text (Arabic).
- Body face: Inter (Latin) / IBM Plex Sans Arabic (Arabic).

## Known scope limits (v0)

- Mock course data (`src/data/courses.mock.ts`) is English-only. UI chrome,
  labels, and difficulty/category tags are fully localized; course titles and
  descriptions will need either per-locale fixtures or a `title_ar` field once
  real content is authored.
- Only the homepage route is built. Other nav destinations (`/courses`, `/learn`,
  etc.) are linked but not yet implemented — see Next steps.

## Next steps

- Build out `/courses`, `/learn`, `/short-videos`, `/experts`, `/rewards`, `/about`,
  `/login`, `/wallet` routes under `app/[locale]/`.
- Replace mock services with real API calls once FastAPI endpoints exist.
- Wire `walletService` to `@solana/wallet-adapter-react` for real wallet connection.
