import worker from '../dist/server/index.js';

// In-memory bucket store for Vercel Serverless environment
const storage = new Map();
let ver = 0;

const env = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'zex4uofficial@gmail.com',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'lia-admin-2026',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  MAIL_FROM: process.env.MAIL_FROM || '',
  NOTIFY_EMAIL: process.env.NOTIFY_EMAIL || 'Infoworldachivementaward@gmail.com',
  BUCKET: {
    async get(k) {
      if (!storage.has(k)) return null;
      const { val, etag } = storage.get(k);
      return {
        etag,
        text: async () => typeof val === 'string' ? val : new TextDecoder().decode(val),
        body: val
      };
    },
    async put(k, val, opt = {}) {
      const old = storage.get(k);
      if (opt.onlyIf?.etagMatches && old?.etag !== opt.onlyIf.etagMatches) return null;
      if (opt.onlyIf instanceof Headers && opt.onlyIf.get('If-None-Match') === '*' && old) return null;
      const etag = String(++ver);
      storage.set(k, { val, etag });
      return { etag };
    },
    async delete(k) {
      storage.delete(k);
    },
    async list({ prefix = '', limit = 50, cursor } = {}) {
      let keys = [...storage.keys()].filter(k => k.startsWith(prefix));
      keys.sort();
      let startIdx = 0;
      if (cursor) {
        const found = keys.indexOf(cursor);
        if (found !== -1) startIdx = found + 1;
      }
      const page = keys.slice(startIdx, startIdx + limit);
      const nextCursor = startIdx + limit < keys.length ? page[page.length - 1] : null;
      return {
        objects: page.map(key => ({ key })),
        truncated: !!nextCursor,
        cursor: nextCursor
      };
    }
  }
};

export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const fullUrl = `${proto}://${host}${req.url}`;

    let body = undefined;
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (req.body) {
        if (Buffer.isBuffer(req.body)) {
          body = req.body;
        } else if (typeof req.body === 'string') {
          body = Buffer.from(req.body);
        } else if (typeof req.body === 'object') {
          body = Buffer.from(JSON.stringify(req.body));
        }
      } else {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        if (chunks.length > 0) {
          body = Buffer.concat(chunks);
        }
      }
    }

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else if (value !== undefined) {
        headers.set(key, value);
      }
    }

    const request = new Request(fullUrl, {
      method: req.method,
      headers,
      ...(body ? { body } : {})
    });

    const response = await worker.fetch(request, env);

    res.statusCode = response.status;
    for (const [k, v] of response.headers.entries()) {
      res.setHeader(k, v);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('LIA Vercel Handler Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<h1>500 Server Error</h1><p>${err?.message || 'Unknown error'}</p>`);
  }
}
