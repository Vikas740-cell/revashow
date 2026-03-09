const { Pool } = require('pg');

// Try each port to find the running Postgres
async function findWorkingPool() {
  const ports = [51214, 5432, 5433, 5434, 5435];
  for (const port of ports) {
    try {
      const pool = new Pool({ host: 'localhost', port, user: 'postgres', password: 'postgres', database: 'template1', ssl: false });
      await pool.query('SELECT 1');
      console.log(`Connected on port ${port}`);
      await pool.end();
      return port;
    } catch (e) {
      // Try next port
    }
  }
  return null;
}

findWorkingPool().then(port => {
  if (port) console.log('Found port:', port);
  else console.log('No port found');
});
