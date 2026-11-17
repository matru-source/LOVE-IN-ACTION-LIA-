import worker, { demoContent, socialImage, assets, pages, categories, siteBase } from './dist/server/index.js';

const storage = new Map();
let ver = 0;
const vercelBucket = {
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
    return { objects: page.map(key => ({ key })), truncated: !!nextCursor, cursor: nextCursor };
  }
};

const defaultEnv = {
  BUCKET: vercelBucket,
  ADMIN_SECRET: (typeof process !== 'undefined' && process.env?.ADMIN_SECRET) || 'lia-admin-2026',
  ADMIN_EMAIL: (typeof process !== 'undefined' && process.env?.ADMIN_EMAIL) || 'zex4uofficial@gmail.com',
  NOTIFY_EMAIL: (typeof process !== 'undefined' && process.env?.NOTIFY_EMAIL) || 'Infoworldachivementaward@gmail.com',
  pages,
  assets,
  categories,
  siteBase,
  demoContent,
  socialImage
};

export default {
  async fetch(r, e) {
    return worker.fetch(r, (e && e.BUCKET) ? e : defaultEnv);
  }
};
export { demoContent, socialImage, assets, pages, categories, siteBase };
