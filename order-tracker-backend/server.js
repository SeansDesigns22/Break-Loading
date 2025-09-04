// server.js
// Simple Express + SQLite backend for the Order Tracker
// Endpoints:
//   GET    /api/breaking
//   POST   /api/breaking
//   PUT    /api/breaking/:id
//   DELETE /api/breaking/:id
//   GET    /api/loading
//   POST   /api/loading
//   PUT    /api/loading/:id
//   DELETE /api/loading/:id

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3001;
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'orders.db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function init() {
  db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  await db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS breaking (
      id TEXT PRIMARY KEY,
      mark TEXT NOT NULL,
      orderId TEXT NOT NULL,
      bales INTEGER DEFAULT 0,
      status TEXT,
      breaker TEXT,
      hauler TEXT,
      dateToLoad TEXT,
      completedDate TEXT,
      location TEXT,
      ready INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS loading (
      id TEXT PRIMARY KEY,
      mark TEXT NOT NULL,
      orderId TEXT,
      dateToLoad TEXT,
      location TEXT,
      clearDate TEXT,
      dateLoaded TEXT,
      status TEXT,
      loadedBy TEXT,
      type TEXT,
      vehicleId TEXT,
      driverName TEXT,
      phone TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_breaking_mark ON breaking(mark);
    CREATE INDEX IF NOT EXISTS idx_loading_mark ON loading(mark);
    CREATE INDEX IF NOT EXISTS idx_breaking_date ON breaking(dateToLoad);
    CREATE INDEX IF NOT EXISTS idx_loading_date ON loading(dateToLoad);
  `);
}

// Helpers
function cleanRecord(obj, table) {
  const allow = table === 'breaking'
    ? ['id','mark','orderId','bales','status','breaker','hauler','dateToLoad','completedDate','location','ready']
    : ['id','mark','orderId','dateToLoad','location','clearDate','dateLoaded','status','loadedBy','type','vehicleId','driverName','phone'];
  const out = {};
  for (const k of allow) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

// CRUD routes for breaking
app.get('/api/breaking', async (req, res) => {
  const rows = await db.all('SELECT * FROM breaking');
  res.json(rows);
});
app.post('/api/breaking', async (req, res) => {
  const r = cleanRecord(req.body, 'breaking');
  r.id = r.id || randomUUID();
  await db.run(`INSERT INTO breaking
    (id, mark, orderId, bales, status, breaker, hauler, dateToLoad, completedDate, location, ready)
    VALUES ($id,$mark,$orderId,$bales,$status,$breaker,$hauler,$dateToLoad,$completedDate,$location,$ready)`,
    {
      $id:r.id, $mark:r.mark||'', $orderId:r.orderId||'',
      $bales: Number(r.bales||0), $status:r.status||'',
      $breaker:r.breaker||'', $hauler:r.hauler||'',
      $dateToLoad:r.dateToLoad||'', $completedDate:r.completedDate||'',
      $location:r.location||'', $ready: r.ready?1:0
    });
  res.status(201).json(r);
});
app.put('/api/breaking/:id', async (req, res) => {
  const id = req.params.id;
  const r = cleanRecord(req.body, 'breaking'); r.id = id;
  await db.run(`UPDATE breaking SET
    mark=$mark, orderId=$orderId, bales=$bales, status=$status, breaker=$breaker,
    hauler=$hauler, dateToLoad=$dateToLoad, completedDate=$completedDate,
    location=$location, ready=$ready
    WHERE id=$id`,
    {
      $id:id, $mark:r.mark||'', $orderId:r.orderId||'',
      $bales:Number(r.bales||0), $status:r.status||'',
      $breaker:r.breaker||'', $hauler:r.hauler||'',
      $dateToLoad:r.dateToLoad||'', $completedDate:r.completedDate||'',
      $location:r.location||'', $ready:r.ready?1:0
    });
  res.json({ ok: true, id });
});
app.delete('/api/breaking/:id', async (req, res) => {
  await db.run('DELETE FROM breaking WHERE id = $id', { $id: req.params.id });
  res.json({ ok: true });
});

// CRUD routes for loading
app.get('/api/loading', async (req, res) => {
  const rows = await db.all('SELECT * FROM loading');
  res.json(rows);
});
app.post('/api/loading', async (req, res) => {
  const r = cleanRecord(req.body, 'loading');
  r.id = r.id || randomUUID();
  await db.run(`INSERT INTO loading
    (id, mark, orderId, dateToLoad, location, clearDate, dateLoaded, status, loadedBy, type, vehicleId, driverName, phone)
    VALUES ($id,$mark,$orderId,$dateToLoad,$location,$clearDate,$dateLoaded,$status,$loadedBy,$type,$vehicleId,$driverName,$phone)`,
    {
      $id:r.id, $mark:r.mark||'', $orderId:r.orderId||'',
      $dateToLoad:r.dateToLoad||'', $location:r.location||'',
      $clearDate:r.clearDate||'', $dateLoaded:r.dateLoaded||'',
      $status:r.status||'', $loadedBy:r.loadedBy||'', $type:r.type||'',
      $vehicleId:r.vehicleId||'', $driverName:r.driverName||'', $phone:r.phone||''
    });
  res.status(201).json(r);
});
app.put('/api/loading/:id', async (req, res) => {
  const id = req.params.id;
  const r = cleanRecord(req.body, 'loading'); r.id = id;
  await db.run(`UPDATE loading SET
    mark=$mark, orderId=$orderId, dateToLoad=$dateToLoad, location=$location,
    clearDate=$clearDate, dateLoaded=$dateLoaded, status=$status, loadedBy=$loadedBy,
    type=$type, vehicleId=$vehicleId, driverName=$driverName, phone=$phone
    WHERE id=$id`,
    {
      $id:id, $mark:r.mark||'', $orderId:r.orderId||'',
      $dateToLoad:r.dateToLoad||'', $location:r.location||'',
      $clearDate:r.clearDate||'', $dateLoaded:r.dateLoaded||'',
      $status:r.status||'', $loadedBy:r.loadedBy||'', $type:r.type||'',
      $vehicleId:r.vehicleId||'', $driverName:r.driverName||'', $phone:r.phone||''
    });
  res.json({ ok: true, id });
});
app.delete('/api/loading/:id', async (req, res) => {
  await db.run('DELETE FROM loading WHERE id = $id', { $id: req.params.id });
  res.json({ ok: true });
});

init().then(() => {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to init DB', err);
  process.exit(1);
});
