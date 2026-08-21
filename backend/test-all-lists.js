const http = require('http');

async function testAllLists() {
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
  console.log('✅ Access Token generated with 7d expiration.');

  const endpoints = [
    '/sales-orders',
    '/purchase-orders',
    '/production',
    '/boms',
    '/products',
    '/customers',
    '/suppliers'
  ];

  for (const ep of endpoints) {
    const res = await new Promise((resolve) => {
      http.get('http://localhost:5000/api' + ep, {
        headers: { 'Authorization': 'Bearer ' + token }
      }, (r) => {
        let body = '';
        r.on('data', chunk => body += chunk);
        r.on('end', () => {
          try {
            resolve({ status: r.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: r.statusCode, data: body });
          }
        });
      });
    });

    console.log(`Endpoint GET /api${ep} -> Status: ${res.status}, Count: ${res.data?.data?.length || 0}`);
  }
}

testAllLists().catch(console.error);
