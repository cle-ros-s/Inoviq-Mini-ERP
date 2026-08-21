const http = require('http');

async function testPO() {
  const loginData = JSON.stringify({ email: 'admin@shivfurniture.com', password: 'Admin@123' });
  const loginRes = await new Promise((resolve) => {
    const req = http.request('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.write(loginData);
    req.end();
  });

  const token = loginRes.data.accessToken;

  const prods = await new Promise((resolve) => {
    http.get('http://localhost:5000/api/products', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });

  const sups = await new Promise((resolve) => {
    http.get('http://localhost:5000/api/suppliers', {
      headers: { 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });

  console.log('Products:', prods.data.length, 'Suppliers:', sups.data.length);

  const poData = JSON.stringify({
    supplierId: sups.data[0].id,
    items: [
      { productId: prods.data[0].id, quantity: 10, costPrice: 850 }
    ],
    notes: 'Urgent delivery for assembly batch A'
  });

  const poRes = await new Promise((resolve) => {
    const req = http.request('http://localhost:5000/api/purchase-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': poData.length,
        'Authorization': 'Bearer ' + token
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.write(poData);
    req.end();
  });

  console.log('PO Response Status:', poRes.status, JSON.stringify(poRes.body, null, 2));
}

testPO().catch(console.error);
