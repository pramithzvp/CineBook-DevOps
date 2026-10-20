# CineBook

Cinema discovery and seat-booking frontend with a Spring Boot / MySQL backend.

## Ubuntu Desktop Docker deployment

Use the supplied `Dockerfile`, `backend/Dockerfile` and `compose.yaml`.
The older `DockerFile_Frontend/` and `backend/Docker_backend` are retained but are
not used by Compose. Docker builds Next.js standalone with Webpack; the existing
Vinext/Cloudflare commands remain available for Sites. The unused Cloudflare D1
module is not a Docker database: all application persistence here uses Spring/MySQL.

### Install Docker Engine (fresh Ubuntu host)

If Docker is already installed, verify `docker compose version` and `docker info`
and skip installation. For conflicting distro packages, follow
[Docker's Ubuntu installation guide](https://docs.docker.com/engine/install/ubuntu/).

```sh
sudo apt update
sudo apt install -y ca-certificates curl git openssl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and back in to activate group membership (Docker group grants root-level
host access), then run `docker run --rm hello-world` and `docker compose version`.

### Configure and start

Clone the repository on Ubuntu, or update an existing checkout to include these
deployment files:

```sh
git clone https://github.com/pramithzvp/CineBook-DevOps.git
cd CineBook-DevOps
hostname -I
# First deployment only; do not overwrite an existing .env.
cp -n .env.docker.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
nano .env
```

Set two different generated passwords in `.env`. Set `FRONTEND_ORIGIN` to the exact
URL of your Ubuntu machine, e.g. `http://192.168.1.50:3000`, without a trailing slash.
Choose the LAN address shown by `hostname -I`, not a Docker bridge address.
`FRONTEND_PORT` defaults to 3000; keep the origin's port consistent if you change it.
Then:

```sh
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 -f
```

Open `http://192.168.1.50:3000` from either laptop, substituting your Ubuntu IP.
The browser sends `/api/...` to that same address. Next.js proxies it internally to
`backend:8080`; Spring connects to `mysql:3306`. No browser resolves Docker service
names or connects to its own localhost. Credential cookies stay on the frontend
origin. Spring's existing exact-origin CORS configuration receives `FRONTEND_ORIGIN`.
Only frontend port 3000 is published; MySQL and backend remain internal.

API base is deliberately empty at frontend build time (same-origin requests).
Private `.env*` and local Spring properties are excluded from both Docker contexts;
Compose injects database credentials only at runtime. Do not put passwords in build
arguments or `NEXT_PUBLIC_*` values. `docker compose config` without `--quiet`
prints resolved passwords, so do not share that output.

Keep both laptops on the same LAN with client isolation disabled. Published Docker
ports can bypass UFW; use Docker-aware firewall rules for your trusted subnet and
avoid router port forwarding. This is HTTP LAN deployment; add TLS and secure
session cookies before internet deployment.

### Test and inspect

```sh
curl --fail http://localhost:3000/
curl --fail http://localhost:3000/api/health
curl --fail http://localhost:3000/api/movies
docker compose exec mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u "$MYSQL_USER" "$MYSQL_DATABASE" -e "SELECT 1"'
docker compose logs --tail=100 frontend
docker compose logs --tail=100 backend
docker compose logs --tail=100 mysql
```

Health must report CineBook and database UP. On the other laptop, repeat health
using the Ubuntu IP and test register, login, reload/session restore and logout.
Use a disposable test account; no automatic test removes existing records.
The movie database is not seeded, so an empty movie list is valid. Existing booking
contract mismatch remains: booking UI is a demo and its API flag stays false.

MySQL readiness runs an authenticated SQL query. Backend waits for healthy MySQL;
frontend waits for the backend's database-aware health endpoint. All services use
`restart: unless-stopped`. Health failures are visible in `docker compose ps`;
Docker does not automatically restart a merely unhealthy process. Sessions are
in memory and users must log in again after backend recreation.

### Data, backups and updates

Data is stored in the named volume `cinebook_mysql_data`, surviving container rebuilds
and `docker compose down`. Do not use `down -v`, delete this volume, or prune volumes.
The fixed Compose project name keeps the volume stable across directory changes;
use one deployment per host with this name. Existing host MySQL records are not
moved, overwritten or imported automatically. Back up the existing database and
plan an explicit import into an empty deployment if you need those records.

Before every update, stop application writes and make a backup:

```sh
mkdir -p backups
chmod 700 backups
docker compose stop frontend backend
# Run in Bash; pipefail prevents a failed dump appearing successful.
set -o pipefail
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -u root --single-transaction --no-tablespaces "$MYSQL_DATABASE"' | gzip > "backups/cinebook-$(date +%Y%m%d-%H%M%S).sql.gz"
# Confirm success and test the archive before continuing.
gzip -t backups/cinebook-*.sql.gz
# In a Git checkout, after resolving/reviewing local edits:
git pull --ff-only
docker compose build --pull
docker compose up -d --build
docker compose ps
curl --fail http://localhost:3000/api/health
```

If the dump fails, stop the update and investigate; `docker compose start backend
frontend` resumes the prior containers. Keep a protected off-host copy of backups.
Spring currently uses Hibernate `ddl-auto=update` and idempotent `CREATE TABLE IF NOT
EXISTS` initialization, not destructive create/drop. Schema evolution is not versioned;
review schema changes and retain backups before upgrades. Changing MYSQL passwords
in `.env` does not alter users in an existing volume: rotate credentials in MySQL
and `.env` together, then recreate backend. Never delete the volume to fix credentials.

```sh
# Stop without deleting data:
docker compose down
# Resume:
docker compose up -d
```

References: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
and [Compose service readiness](https://docs.docker.com/reference/compose-file/services/).

## Local setup

Requires Node.js 22.13+, pnpm, Java 17+ (verified with Java 21) and Maven.
The backend uses an in-memory H2 database for local runs unless MySQL credentials
are configured; H2 data is cleared when the backend stops.

```sh
git clone https://github.com/pramithzvp/CineBook-DevOps.git
cd CineBook-DevOps
pnpm install --frozen-lockfile
cp .env.example .env.local
cp backend/.env.example backend/.env.local
```

For persistent local data, create the database and a dedicated account in MySQL.
Replace the example password:

```sql
CREATE DATABASE IF NOT EXISTS cinebook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cinebook'@'localhost' IDENTIFIED BY 'YOUR_LOCAL_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
ON cinebook_db.* TO 'cinebook'@'localhost';
```

Put your credentials in `backend/.env.local` to use MySQL instead of the default
in-memory H2 database. This file and the root `.env.local` are ignored by Git;
each collaborator supplies their own local configuration.
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
The backend launcher loads `backend/.env.local` automatically and uses H2 when
MySQL credentials are absent. Plain Maven does not load that file; when using
Maven directly, run `mvn -f backend/pom.xml spring-boot:run
-Dspring-boot.run.profiles=local` to use H2, or export the MySQL environment
variables first.

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

## Docker validation results (2026-10-20)

- Compose configuration parses, exposes exactly three services, and rejects missing
  required credentials/origin.
- Next.js standalone production build and TypeScript checks passed; home and
  catalogue returned HTTP 200 from the generated server.
- All 13 frontend checks and all 10 backend H2 tests passed; Maven packaged the JAR.
- Standalone API proxy passed health, registration, login, session restore and movie
  requests with a LAN Origin header. This isolated smoke test mapped `backend` to
  loopback and used disposable H2, not the user's MySQL database.
- Docker image builds were attempted, but cancelled during very slow base-image
  downloads. Clean Linux dependency installation, completed image builds, real
  Compose MySQL readiness/persistence, and physical second-laptop access remain
  unverified. Run the deployment and smoke commands above on Ubuntu before relying
  on the stack. Local build success is not a completed container integration test.
- The supplied directory has no `.git` metadata. Changes were made in place; no
  commit or push was performed during implementation. The deployment changes were
  subsequently transferred into a fresh Git checkout for publication. To audit
  tracked environment files, run `git status --short` and
  `git ls-files | grep -E '(^|/)(\.env|application-local\.properties)'`.
  Only safe example environment files should be tracked. The backend example
  contained a password-like value and now uses a placeholder; rotate that old
  credential if it was real or published. Ignoring a file does not untrack it or
  erase Git history.

## Validation

```sh
pnpm exec tsc --noEmit
node scripts/check-frontend.mjs
pnpm build
pnpm backend:test
```

The frontend has 13 focused checks. The backend has 10 automated tests using H2, including LAN CORS acceptance and rejection.
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
