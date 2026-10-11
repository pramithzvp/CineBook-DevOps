# CineBook

Cinema discovery and seat-booking frontend with a Spring Boot / MySQL backend.

## Local setup

Requires Node.js 22.13+, pnpm, Java 17+ (verified with Java 21), Maven and MySQL.

```sh
git clone https://github.com/pramithzvp/CineBook-DevOps.git
cd CineBook-DevOps
pnpm install --frozen-lockfile
cp .env.example .env.local
cp backend/.env.example backend/.env.local
```

Create the database and a dedicated account in MySQL. Replace the example password:

```sql
CREATE DATABASE IF NOT EXISTS cinebook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cinebook'@'localhost' IDENTIFIED BY 'YOUR_LOCAL_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
ON cinebook_db.* TO 'cinebook'@'localhost';
```

Put your credentials in `backend/.env.local`. This file and the root `.env.local`
are ignored by Git; each collaborator supplies their own local configuration.
If Maven or Java is not on PATH, set `MAVEN_BIN` or `JAVA_HOME` in that file.
Optional `MAVEN_REPO_LOCAL` selects a writable Maven cache.

From the repository root, use separate terminals:

```sh
pnpm backend:dev
```

```sh
pnpm dev:local
```

Open http://localhost:3000. The example environment uses the API at
http://localhost:8081 to avoid conflicts with other applications on port 8080.
The health endpoint at `/api/health` identifies CineBook and checks MySQL.
The backend launcher loads `backend/.env.local` automatically. Plain Maven does
not load that file; when using Maven directly, export the environment variables.

`dev:local` uses Next.js/Webpack and enables polling in the macOS Codex sandbox.
The existing `pnpm dev`, `pnpm build` and `pnpm start` commands use the
Vinext/Cloudflare workflow. For slow dependency downloads:

```sh
pnpm install --frozen-lockfile --fetch-timeout=600000 --network-concurrency=4
```

## Features and integration status

- Expanded movie collection, cinema listings, posters, search, filters and watchlists.
- Dark/light themes, seat tiers, sample seat selection, promotions and ticket/QR views.
- MySQL-backed registration, BCrypt password hashing, login, session restore and logout.
- Movie REST API; the frontend uses sample movies if the movie service is unavailable.
- Booking API with server-side prices and transactional duplicate-seat protection.

Keep `NEXT_PUBLIC_BOOKING_API_ENABLED=false`. The reference frontend uses a
show/session/history booking contract that differs from this backend's
movie/date/time contract. The frontend booking flow is still a demo; authentication
and the movie catalogue are connected to MySQL. Payments and email delivery are
not integrated. Cinema listings and showtimes are sample/reference data, not a
live inventory feed.

Theme, watchlist and cinema preferences are stored locally in the browser.
Demo receipts use sessionStorage. Account sessions use the HttpOnly
`CINEBOOK_SESSION` cookie, separate from other localhost applications.

## Validation

```sh
pnpm exec tsc --noEmit
node scripts/check-frontend.mjs
pnpm build
pnpm backend:test
```

The frontend has 13 focused checks. The backend has 8 automated tests using H2.
Real-MySQL smoke checks also verified registration, login, session/logout,
movie retrieval, booking creation, pricing and duplicate-seat rollback.
Temporary smoke-test records were removed afterward.

## Collaboration

Pull the latest changes before starting work, use a feature branch, and open a
pull request for review. Commit source and environment examples; keep passwords,
local configuration, dependency folders, build outputs and database files local.
MySQL records are not transferred through Git; each developer configures their
own database. The schema is initialized at backend startup; movie data is not seeded.

## Source map

- `app/`: pages, layout and frontend styles.
- `components/cinebook/`: auth, seats, booking and ticket views.
- `lib/`: frontend models, API clients, cinema listings and QR helpers.
- `src/services/movieService.js`: movie API client.
- `backend/`: Spring Boot application, schema and tests.
- `scripts/`: local launchers, frontend checks and source export.

`python3 scripts/export-source.py` creates a downloadable source ZIP while
excluding local secrets and generated output.

## Poster credits

Existing copyrighted promotional posters are used for a private educational demo; no open reuse licence was verified.

- Dune: Part Two: https://www.zachhammill.com/moviefriend/dune-part-two-review
- Interstellar: https://www.omelete.com.br/interstellar/interestelar/interstellar-filme-de-christopher-nolan-ganha-jogo-para-pc-e-smartphones
- The Batman: https://www.rottentomatoes.com/m/the_batman

Additional reference posters and cinema listings were carried over from the supplied CineBook-Frontend project. No additional image licence verification was performed.
