const http = require('http');

const data = JSON.stringify({ email: 'test@example.com' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/send-verification-code',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('Response:', body); });
});

req.on('error', (error) => { console.error('Error:', error); });
req.write(data);
req.end();
