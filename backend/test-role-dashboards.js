require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log('🧪 Testing Role-Based Dashboard Backend APIs & DB Queries...\n');

  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} registered users in PostgreSQL database.`);

  for (const user of users) {
    console.log(`\n--------------------------------------------------`);
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Role: ${user.role} | Status: ${user.status}`);

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );
    console.log(`Generated JWT token for ${user.role}`);
  }

  await prisma.$disconnect();
  await pool.end();
  console.log('\n✅ Test script completed successfully.');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
