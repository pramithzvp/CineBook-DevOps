# CineBook — Frontend v2

A complete interactive React frontend demonstration for cinema seat booking. Existing Spring Boot/MySQL booking source is retained in `backend/`.

## Run in VS Code

Download the latest `cinebook-source.zip`, extract it into a new folder and open `cinebook` (the folder containing `package.json`) in VS Code. Requires Node.js 22.13+ and pnpm; the pinned manager version is in `package.json`.

```sh
corepack enable
pnpm install
pnpm dev
```

Open the local address printed in the terminal. Leave `NEXT_PUBLIC_API_BASE` empty for the full frontend demo; no MySQL or Java is needed in this mode. If Corepack is not installed with your Node distribution, install pnpm through its supported setup path.

The comprehensive illustrated-by-tables feature guide is `public/frontend-guide.html`. Open it locally in a browser, or use Project guide in the website footer. It includes English/Sinhala setup notes, a feature matrix, walkthrough, storage rules, code map and integration boundaries. The guide can be printed to PDF with the browser.

## Completed frontend features

- Dark/light themes, synchronized header/profile toggles, persisted device preference.
- Movie search, genre/format filters, title/price/runtime sorting, result counts and reset.
- Movie detail dialog, synopsis, pricing, language, stable hall numbers and showtimes.
- Saved-film watchlist with persistent device-local preferences.
- Cinema guide, screen formats and preferred cinema.
- Seven-day Sri Lanka schedule; past shows disabled and next-day fallback.
- Accessible 64-seat map, 1–8 seat limit, live totals, clear selection and 1–4 adjacent-seat suggestions that respect the aisle.
- Three-step checkout, guest contact details, optional demo-profile autofill and confirmation.
- Detailed text ticket, browser print/PDF controls and calendar `.ics` download.
- Tab-local booking history, search, statuses, counts and upcoming demo cancellation that releases seats.
- Login/register frontend, validation, password visibility, duplicate-email checks, demo profile editing and logout.
- Help FAQ, toasts, retry/error/empty states, keyboard focus, responsive layout and reduced-motion support.

## Demo accounts and data

Use **Log in → Try the demo account**, or use `demo@cinebook.lk` / `CineBook123!` in the demo form. New accounts require a test name/email and a password of 8+ characters including uppercase, lowercase and a number, with matching confirmation.

**This is frontend-only demo login, not secure authentication.** Use sample details, never real passwords. New account passwords exist only in React memory until refresh; no passwords are written to localStorage/sessionStorage or sent to a server. Logging in is not a security boundary and does not protect bookings. All reservations in this tab are visible regardless of demo profile.

Theme, watchlist IDs and preferred cinema use localStorage. Reservation receipts/cancellations use sessionStorage and survive refresh in the same tab when storage is available. Closing the tab can clear this data; download tickets to keep them. Demo seat availability is not synchronized across tabs or devices. Accounts/profile and unfinished selections reset on refresh.

The hosted version does not collect payments, send emails, create real accounts or reserve real cinema seats. Venues/showtimes are sample data. Cancellation is frontend-demo-only; API-backed cancellation has no control because the existing backend does not implement it.

## Source map

| File | Purpose |
| --- | --- |
| `app/page.tsx` | App navigation, catalogue, filters, watchlist, cinema guide, profile and history |
| `app/globals.css` | Theme tokens, responsive styling and print styles |
| `lib/cinebook.ts` | Movie data, prices, types, booking/date/filter rules, API client and file exports |
| `components/cinebook/auth-dialog.tsx` | Temporary demo login/register forms |
| `components/cinebook/booking-dialog.tsx` | Seat, contact, review and booking flow |
| `components/cinebook/ticket-view.tsx` | Reusable receipt and export actions |
| `public/frontend-guide.html` | Full user/developer guide |
| `scripts/check-frontend.mjs` | Focused frontend rule checks |
| `scripts/export-source.py` | Rebuild complete source download |
| `backend/` | Existing Spring Boot and MySQL source |

## Frontend validation

```sh
pnpm exec tsc --noEmit
node scripts/check-frontend.mjs
pnpm build
```

The rule checks cover stable hall mapping, combined filters, sorting, adjacent-seat constraints, a full hall, Sri Lanka showtime cutoff, cancellation release, cinema isolation, malformed restored data, password requirements and cancelled-ticket labels.

## Connect the booking API

To use the existing API locally, run Spring Boot separately and set root `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

Restart the frontend. For a hosted frontend, configure an HTTPS API base before build, and match backend `FRONTEND_ORIGIN` to the actual frontend origin. Availability uses `GET /api/availability`; creation uses `POST /api/bookings`. Authentication remains demo-only even if this booking API is connected. Never trust the demo profile as authenticated identity.

## Run MySQL + Spring Boot

Requires Java 17+, Maven 3.6.3+ and MySQL 8+. Create a dedicated database and user in MySQL (choose your own password):

```sql
CREATE DATABASE cinebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cinebook'@'localhost' IDENTIFIED BY 'REPLACE_WITH_YOUR_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, REFERENCES ON cinebook.* TO 'cinebook'@'localhost';
```

In a terminal:

```sh
cd backend
export DB_PASSWORD='REPLACE_WITH_YOUR_PASSWORD'
export FRONTEND_ORIGIN='http://localhost:3000'
mvn spring-boot:run
```

Use the actual frontend origin printed by the development server if different. Database defaults: `jdbc:mysql://localhost:3306/cinebook`, user `cinebook`. Override `DB_URL`, `DB_USER`, `DB_PASSWORD` when needed. Tables initialize from `src/main/resources/schema.sql`. The server defaults to loopback; a separately managed deployment can set `SERVER_ADDRESS=0.0.0.0` behind TLS and suitable access controls.

## API

- `GET /api/health`
- `GET /api/availability?movieId=dune&date=YYYY-MM-DD&time=19:00&cinema=colombo`
- `POST /api/bookings` — JSON `movieId`, `date`, `time`, `cinema`, `seats` array, `name`, `email`.

The response contains the booking ID, selected show and seats, guest name and total in LKR. Rates: Dune 2200; Interstellar 1500; Batman 1800; booking fee 100 per seat. All prices are calculated again on the server. Date validation uses Asia/Colombo. The composite seat primary key plus transaction rollback prevents duplicate reservations. The API never provides a public guest/email listing.

## Backend verification limitation

Spring Boot/MySQL was not run here. Maven was unavailable and could not be downloaded during the original delivery. Included backend tests cover pricing, availability, duplicate seats, past dates and rollback on a conflicting reservation. Run `mvn test` in `backend`; verify against real MySQL separately. Backend account authentication, account-scoped history, profile management, cancellation, payment and email integration remain future work.

## Update the downloadable ZIP

```sh
python3 scripts/export-source.py
```

The archive includes standalone configuration without the hosted project identity, all source assets and backend code. It excludes credentials, installed dependencies and generated build output.

## Poster credits

Existing copyrighted promotional posters are used for a private educational demo; no open reuse licence was verified.

- Dune: Part Two: https://www.zachhammill.com/moviefriend/dune-part-two-review
- Interstellar: https://www.omelete.com.br/interstellar/interestelar/interstellar-filme-de-christopher-nolan-ganha-jogo-para-pc-e-smartphones
- The Batman: https://www.rottentomatoes.com/m/the_batman
# CineBook-DevOps
