const prisma = require('./src/config/prisma.js');

async function checkData() {
  const products = await prisma.product.findMany({ include: { category: true } });
  const suppliers = await prisma.supplier.findMany();
  console.log('PRODUCTS IN DB (' + products.length + '):');
  products.forEach(p => console.log(`- [${p.id}] ${p.name} (${p.sku}) | Price: ₹${p.salesPrice} | Cost: ₹${p.costPrice} | Category: ${p.category?.name}`));
  console.log('\nSUPPLIERS IN DB (' + suppliers.length + '):');
  suppliers.forEach(s => console.log(`- [${s.id}] ${s.companyName} (${s.supplierCode}) | Email: ${s.email} | Phone: ${s.phone}`));
}

checkData().catch(console.error).finally(() => prisma.$disconnect());
