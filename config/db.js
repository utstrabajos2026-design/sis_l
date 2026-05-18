/**
 * config/db.js  ─  Conexión MySQL con pool de conexiones
 * ─────────────────────────────────────────────────────
 * CAPA: Infraestructura compartida (no pertenece a M, V ni W)
 * Provee el pool que usan los Watchers para consultar el Model (BD).
 * RNF-R3: pool de 10 conexiones para soportar concurrencia.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'turntable.proxy.rlwy.net',
  port:               process.env.DB_PORT     || 22229,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || 'HmjHDFsMwttYJTsxpXoqVAKfnJwlbvyB',
  database:           process.env.DB_NAME     || 'railway',
  waitForConnections: true,
  connectionLimit:    10,       // RNF-R3: soporte de múltiples usuarios
  queueLimit:         0,
  charset:            'utf8mb4'
});

// Verificar conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL conectado correctamente');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar MySQL:', err.message);
  });

module.exports = pool;
