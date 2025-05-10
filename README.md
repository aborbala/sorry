# sorry counter PoC

deployed: https://sorry-drab.vercel.app/

## Developer README

### Prerequisites

* Node.js v14+ (v20+ recommended)
* npm (comes with Node.js)
* A Google Service Account with access to the target Google Sheet -> admin: Anna
* The ID of the Google Spreadsheet and the service account credentials

---

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

---

## 2. Set Up Environment Variables

Create a `.env` file in the project root (next to `package.json`) with the following values:

```
# Google Sheet configuration
dotenv_config_path=.env
SHEET_ID=<your-spreadsheet-id>
GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL=<your-service-account-email>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<your-private-key-with-\\n-line-breaks>
```

> **Do not** commit `.env` to version control.

---

## 3. Install Dependencies

Install both server and client dependencies in one go:

```bash
npm install
```

---

## 4. Running the Express API Server

The server exposes three endpoints under `/api`:

* **GET /api/counts?month=YYYY-MM-01**: Returns JSON: `{ felix: number, anna: number }` for the specified month.
* **GET /api/table**: Returns full table of all months: `[{ month, felix, anna }, ...]`.
* **POST /api/counts**: Accepts JSON `{ month, felix, anna }` to upsert the counts for the given month.

To start the server locally:

```bash
npm run start:server
```

You should see:

```
Sheets API listening on http://localhost:3001
```

#### Example API Queries

* Fetch counts for May 2025:

  ```bash
  curl "http://localhost:3001/api/counts?month=2025-05-01"
  ```

* Fetch entire table:

  ```bash
  curl "http://localhost:3001/api/table"
  ```

* Upsert counts (e.g. 3 and 5):

  ```bash
  curl -X POST http://localhost:3001/api/counts \
    -H "Content-Type: application/json" \
    -d '{ "month": "2025-05-01", "felix": 3, "anna": 5 }'
  ```

---

## 5. Running the React Frontend

The React app is configured with a Vite proxy that forwards `/api/*` to `http://localhost:3001`.

To start the frontend in development mode:

```bash
npm run dev
```

## 7. Deployment Notes

* **Ver cel**

  * Copy the contents of `/api` into the `api/` folder at the repo root.
  * In Vercel Dashboard, set the same environment variables (`SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`).
  * Push to the main branch and Vercel will build and deploy both the frontend and serverless functions.

* **Other Platforms**

  * Ensure your platform supports Node serverless functions or a Node server.
  * Provide the environment variables in the hosting configuration.


