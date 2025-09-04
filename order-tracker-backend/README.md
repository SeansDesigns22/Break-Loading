# Order Tracker Backend (Node + Express + SQLite)

This is the shared database/API for your Breaking + Loading + Calendar app.

## What it gives you
- Shared SQLite DB (`orders.db`) so multiple users see the same data
- REST endpoints:
  - `GET/POST/PUT/DELETE /api/breaking`
  - `GET/POST/PUT/DELETE /api/loading`

## Quick start (Windows)
1. Install **Node.js LTS** from https://nodejs.org/
2. Extract this folder somewhere simple, e.g. `C:\order-tracker-backend`
3. Double‑click **`start.bat`** (first run will do `npm install` automatically)
4. You should see: `API listening on http://localhost:3001`

## Quick start (Mac/Linux)
```bash
cd order-tracker-backend
./start.sh   # first run installs dependencies, then starts the server
```

## Point your frontend to the API
Open your app in the browser, then press F12 → Application → Local Storage and set:
- Key: `ORDER_TRACKER_API`
- Value: `http://<SERVER-IP>:3001`  (example: `http://localhost:3001` if the server runs on the same machine)

Reload the page. You’ll see a green banner under the header when connected.

## Change port or DB file (optional)
Use environment variables:
- `PORT=3001`
- `DB_FILE=C:\data\orders.db`  (or `/var/data/orders.db` on Linux)

## Backup
Just copy the `orders.db` file while the server is running (WAL mode minimizes locking). For a consistent backup, stop the server, copy the file, then start again.

## Notes
- This server enables CORS for convenience. For production, consider restricting origins and adding auth.
