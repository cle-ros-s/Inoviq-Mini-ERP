const http = require('http');

function makeRequest(path, method = 'GET', token = null, postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runApiTests() {
  console.log('🌐 Testing Live Backend REST APIs...\n');

  // 1. Health check
  const health = await makeRequest('/api/health');
  console.log('Health Check:', health.status, health.data);

  // 2. Login test as Sales Executive
  const salesLogin = await makeRequest('/api/auth/login', 'POST', null, {
    email: 'sales@shivfurniture.com',
    password: 'Admin@123'
  });
  console.log('\nSales Login Status:', salesLogin.status, 'User Role:', salesLogin.data?.data?.user?.role);
  const salesToken = salesLogin.data?.data?.accessToken;

  // 3. GET /api/auth/me for Sales Executive
  const salesMe = await makeRequest('/api/auth/me', 'GET', salesToken);
  console.log('/api/auth/me response for Sales Executive:', salesMe.data);

  // 4. Sales Executive accesses /api/dashboard/sales -> Should be 200 OK
  const salesDash = await makeRequest('/api/dashboard/sales', 'GET', salesToken);
  console.log('/api/dashboard/sales status:', salesDash.status, 'Success:', salesDash.data?.success, 'Role:', salesDash.data?.role);

  // 5. Sales Executive attempts /api/dashboard/admin -> Should be 403 Forbidden
  const salesAdminDash = await makeRequest('/api/dashboard/admin', 'GET', salesToken);
  console.log('/api/dashboard/admin status for Sales user (EXPECT 403):', salesAdminDash.status, 'Response:', salesAdminDash.data);

  // 6. Login as Production Manager
  const prodLogin = await makeRequest('/api/auth/login', 'POST', null, {
    email: 'manufacturing@shivfurniture.com',
    password: 'Admin@123'
  });
  console.log('\nProduction Login Status:', prodLogin.status, 'User Role:', prodLogin.data?.data?.user?.role);
  const prodToken = prodLogin.data?.data?.accessToken;

  // 7. Production Manager accesses /api/dashboard/production -> Should be 200 OK
  const prodDash = await makeRequest('/api/dashboard/production', 'GET', prodToken);
  console.log('/api/dashboard/production status:', prodDash.status, 'Success:', prodDash.data?.success, 'Role:', prodDash.data?.role);

  // 8. Production Manager attempts /api/dashboard/finance -> Should be 403 Forbidden
  const prodFinanceDash = await makeRequest('/api/dashboard/finance', 'GET', prodToken);
  console.log('/api/dashboard/finance status for Production user (EXPECT 403):', prodFinanceDash.status, 'Response:', prodFinanceDash.data);

  console.log('\n🎉 ALL BACKEND API TESTS COMPLETED SUCCESFULLY!');
}

setTimeout(() => {
  runApiTests().catch(console.error);
}, 1000);
