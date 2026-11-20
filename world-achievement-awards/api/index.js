import worker, { demoContent, socialImage, logoImage, homeBgImage, trophyBgImage, ivoryBgImage, galleryImages, awardeeImages, assets, pages, categories, siteBase } from '../dist/server/index.js';

if (typeof globalThis !== 'undefined') {
  if (demoContent) globalThis.demoContent = demoContent;
  if (socialImage) globalThis.socialImage = socialImage;
  if (logoImage) globalThis.logoImage = logoImage;
  if (homeBgImage) globalThis.homeBgImage = homeBgImage;
  if (trophyBgImage) globalThis.trophyBgImage = trophyBgImage;
  if (ivoryBgImage) globalThis.ivoryBgImage = ivoryBgImage;
  if (galleryImages) globalThis.galleryImages = galleryImages;
  if (awardeeImages) globalThis.awardeeImages = awardeeImages;
  if (assets) globalThis.assets = assets;
  if (pages) globalThis.pages = pages;
  if (categories) globalThis.categories = categories;
  if (siteBase) globalThis.siteBase = siteBase;
}

// In-memory bucket store for Vercel Serverless environment
const storage = new Map();
let ver = 0;

const env = {
  pages,
  assets,
  categories,
  siteBase,
  demoContent,
  socialImage,
  logoImage,
  homeBgImage,
  trophyBgImage,
  ivoryBgImage,
  galleryImages,
  awardeeImages,
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
    // 1. Sanitize protocol & host (Vercel proxies can append multiple values separated by commas)
    let proto = 'https';
    if (req.headers['x-forwarded-proto']) {
      proto = String(req.headers['x-forwarded-proto']).split(',')[0].trim() || 'https';
    }
    let host = 'localhost';
    if (req.headers['x-forwarded-host']) {
      host = String(req.headers['x-forwarded-host']).split(',')[0].trim() || 'localhost';
    } else if (req.headers.host) {
      host = String(req.headers.host).split(',')[0].trim() || 'localhost';
    }

    // 2. Resolve original requested path on Vercel
    // x-matched-path / x-invoke-path hold the real route before internal rewrites
    let rawPath = req.headers['x-matched-path'] || req.headers['x-invoke-path'] || req.url || '/';

    // Separate pathname and query string
    let pathname = rawPath;
    let search = '';
    const queryIdx = req.url.indexOf('?');
    if (queryIdx !== -1) {
      search = req.url.slice(queryIdx);
    }
    const pathQueryIdx = pathname.indexOf('?');
    if (pathQueryIdx !== -1) {
      if (!search) search = pathname.slice(pathQueryIdx);
      pathname = pathname.slice(0, pathQueryIdx);
    }

    // Normalize rewritten paths
    if (pathname === '/api/index.js' || pathname === '/api/index' || pathname === '/api' || !pathname) {
      pathname = '/';
    } else if (pathname.startsWith('/api/') && !['/api/nominations', '/api/contact'].includes(pathname) && !pathname.startsWith('/api/admin')) {
      pathname = pathname.slice(4) || '/';
    }

    const fullUrl = `${proto}://${host}${pathname}${search}`;

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
