const { Client } = require('pg');

async function createFurnitureDB() {
  const client = new Client({
    user: 'postgres',
    password: 'Naviii',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  });

  await client.connect();
  
  const check = await client.query("SELECT 1 FROM pg_database WHERE datname='shiv_furniture_erp'");
  if (check.rows.length === 0) {
    console.log('Creating database shiv_furniture_erp in PostgreSQL...');
    await client.query('CREATE DATABASE shiv_furniture_erp');
    console.log(' Database shiv_furniture_erp created successfully!');
  } else {
    console.log(' Database shiv_furniture_erp already exists.');
  }

  const list = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
  console.log('All databases in PostgreSQL:', list.rows.map(r => r.datname));

  await client.end();
}

createFurnitureDB().catch(console.error);
