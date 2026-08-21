const { Client } = require('pg');
require('dotenv').config();

async function check(db) {
  const client = new Client({
    user: 'postgres',
    password: 'Naviii',
    host: 'localhost',
    port: 5432,
    database: db
  });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log(`\n=== Tables in PostgreSQL Database '${db}' (${res.rows.length} tables) ===`);
  console.log(res.rows.map(r => r.table_name).join(', '));
  
  const users = await client.query("SELECT name, email, role FROM \"User\"");
  console.log('\nUsers in Database:', users.rows);
  
  await client.end();
}

check('shiv_furniture_erp').catch(console.error);
