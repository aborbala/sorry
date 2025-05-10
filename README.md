# sorry counter PoC

deployed: https://sorry-drab.vercel.app/

## Developer README

### Prerequisites

* Node.js v14+ (v20+ recommended)
* npm (comes with Node.js)
* A Google Service Account with access to the target Google Sheet (admin: Anna)
* The ID of the Google Spreadsheet and service account credentials

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

---

## 2. Set Up Environment Variables

Create a `.env` file in the project root (next to `package.json`) with:

```
SHEET_ID=<your-spreadsheet-id>
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=<your-service-account-email>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<your-private-key-with-\n-line-breaks>
```

> **Do not** commit `.env` to version control.

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Running Locally (Frontend + API)

We use one command to run both the React dev server and the Vercel functions emulator:

1. **Install dev dependency (once):**
   ```bash
   npm install --save-dev concurrently
   ```

2. **Run both servers:**
   ```bash
   npm run dev
   ```

   This launches:
   - **Vite** on http://localhost:5173 (React app with HMR)
   - **Vercel dev** on http://localhost:3000 (your `/api` functions)

3. **Proxy setup:**
   The Vite config proxies `/api/*` to `http://localhost:3000`, so in your browser:
   - App: http://localhost:5173/
   - API: http://localhost:5173/api/counts?month=2025-05-01 and http://localhost:5173/api/table

---

## 5. Preview Production Build Locally

To serve the built static files without the API emulator:

```bash
npm run preview
```

Open http://localhost:4173 to see the production build of the React app.

---

## 6. Deployment Notes

### Vercel

1. Ensure your `/api` folder (with `counts.js` and `table.js`) is in the repo root.
2. In Vercel Dashboard → Settings → Environment Variables, add:
   - `SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (with literal `\n` line-breaks)
3. Push to your main branch. Vercel will:
   - Run `npm run build` (builds your React app)
   - Deploy your `/api` functions automatically

### Other Platforms

- Host must support Node serverless functions or a Node process.
- Provide equivalent environment variables in the hosting configuration.
