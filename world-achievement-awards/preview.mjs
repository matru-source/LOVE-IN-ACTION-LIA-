import http from 'node:http';
import worker, { galleryImages, awardeeImages } from './dist/server/index.js';

const storage = new Map();
let ver = 0;
const previewEnv = {
  galleryImages,
  awardeeImages,
  ADMIN_EMAIL: 'zex4uofficial@gmail.com',
  ADMIN_SECRET: 'lia-admin-2026',
  BUCKET: {
    async get(k) {
      if (!storage.has(k)) return null;
      const { val, etag } = storage.get(k);
      return { etag, text: async () => typeof val === 'string' ? val : new TextDecoder().decode(val), body: val };
    },
    async put(k, val, opt = {}) {
      const old = storage.get(k);
      if (opt.onlyIf?.etagMatches && old?.etag !== opt.onlyIf.etagMatches) return null;
      if (opt.onlyIf instanceof Headers && opt.onlyIf.get('If-None-Match') === '*' && old) return null;
      const etag = String(++ver);
      storage.set(k, { val, etag });
      return { etag };
    },
    async delete(k) { storage.delete(k); },
    async list({ prefix = '' }) {
      const keys = [...storage.keys()].filter(k => k.startsWith(prefix));
      return { objects: keys.map(key => ({ key })), truncated: false };
    }
  }
};

http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const request = new Request('http://localhost:4173' + req.url, {
      method: req.method,
      headers: req.headers,
      ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {})
    });
    const response = await worker.fetch(request, previewEnv);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Preview error');
  }
}).listen(4173, '127.0.0.1', () => console.log('Local Preview running at: http://localhost:4173'));
