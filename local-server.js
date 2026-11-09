const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ไม่พบหน้าที่ต้องการ');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(` โรงเรียนวชิรธรรมสาธิต - ระบบรับสมัครเลือกตั้ง 2570`);
  console.log(` เว็บไซต์เปิดใช้งานแล้วที่: http://localhost:${PORT}`);
  console.log(` หน้าบ้าน: http://localhost:${PORT}/index.html`);
  console.log(` หลังบ้าน: http://localhost:${PORT}/admin.html (admin / admin1234)`);
  console.log(`=====================================================`);
});

module.exports = (req, res) => {
  server.emit('request', req, res);
};

