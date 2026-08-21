const prisma = require('./src/config/prisma.js');
const bcrypt = require('bcrypt');

async function testUsers() {
  const users = await prisma.user.findMany();
  console.log('All Users in DB:');
  for (const u of users) {
    const match1 = await bcrypt.compare('Admin@123', u.password);
    const match2 = await bcrypt.compare('admin', u.password);
    const match3 = await bcrypt.compare('Admin@1234', u.password);
    console.log(`- ID: ${u.id}, Email: '${u.email}', Role: '${u.role}', Status: '${u.status}', Matches 'Admin@123': ${match1}, Matches 'admin': ${match2}`);
  }
}

testUsers().catch(console.error).finally(() => prisma.$disconnect());
