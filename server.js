const http = require('http');
const cors_proxy = require('cors-anywhere');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;

const allowedOrigin = 'https://cricketstan.github.io';

const proxy = cors_proxy.createServer({
  originWhitelist: [allowedOrigin],
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: [
    'cookie',
    'cookie2',
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time'
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
    changeOrigin: true
  },
  checkRequest: function (origin, url, callback) {
    if (!/^https?:\/\//.test(url)) {
      return callback(new Error('Invalid URL: ' + url));
    }

    if (
      origin !== allowedOrigin &&
      (!this.headers || !this.headers.referer || !this.headers.referer.startsWith(allowedOrigin))
    ) {
      return callback(new Error('Blocked: Unauthorized origin ' + origin));
    }

    callback(null, url);
  }
});

http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/help' || req.url === '/favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('✅ Server is running. Only allowed from https://cricketstan.github.io');
  } else {
    proxy.emit('request', req, res);
  }
}).listen(port, host, () => {
  console.log(`✅ CORS Proxy running at http://${host}:${port} for ${allowedOrigin}`);
});
