require('dotenv').config();
const express = require('express'), { Pool } = require('pg'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), crypto = require('crypto'), rl = require('express-rate-limit');
const { steps, validate, nd } = require('./spec'), { notifyAdmin, notifyUser } = require('./notify');
const pool = require('./db/pool')(), app = express(), SECRET = process.env.JWT_SECRET || 'dev-secret';
app.set('trust proxy', 1);
app.get('/healthz', (q, s) => s.json({ ok: true }));
app.use(express.json({ limit: '100kb' })); app.use(express.static(require('path').join(__dirname, 'public')));
const ORIGINS = ['https://localhost', 'http://localhost', 'capacitor://localhost', ...(process.env.CORS_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean)];
app.use('/api', (q, s, n) => { const o = q.headers.origin; if (o && ORIGINS.includes(o)) { s.setHeader('Access-Control-Allow-Origin', o); s.setHeader('Vary', 'Origin'); s.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization'); s.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS') } if (q.method === 'OPTIONS') return s.sendStatus(204); n() });
const lim = rl({ windowMs: 15 * 60 * 1000, max: 60 }), wrap = f => (q, s) => f(q, s).catch(e => { console.error(e); s.status(500).json({ error: 'خطأ في السيرفر' }) });
const PH = /^01[0125]\d{8}$/, tok = u => jwt.sign({ id: u.id, gender: u.gender, role: 'user' }, SECRET, { expiresIn: '30d' });
const auth = (q, s, n) => { try { q.u = jwt.verify((q.headers.authorization || '').replace('Bearer ', ''), SECRET); if (q.u.role === 'admin') throw 0; n() } catch { s.status(401).json({ error: 'سجّل الدخول من جديد' }) } };
const admin = (q, s, n) => {
  let p; try { p = jwt.verify((q.headers.authorization || '').replace('Bearer ', ''), SECRET) } catch { return s.status(401).json({ error: 'سجّل دخول الأدمن' }) }
  if (p.role !== 'admin') return s.status(403).json({ error: 'غير مصرح' });
  pool.query('SELECT 1 FROM admins WHERE id=$1', [p.id]).then(r => r.rowCount ? n() : s.status(401).json({ error: 'حساب الأدمن غير موجود' })).catch(() => s.sendStatus(500))
};
async function newCode(uid, db = pool) {
  await db.query('UPDATE verification_codes SET used=true WHERE user_id=$1 AND NOT used', [uid]);
  for (; ;) {
    const c = 'WSL-' + crypto.randomInt(1000, 10000);
    try { await db.query("INSERT INTO verification_codes(code,user_id,expires_at) VALUES($1,$2,now()+interval '15 minutes')", [c, uid]); return c } catch (e) { if (e.code !== '23505') throw e }
  }
}
const wa = () => { let n = String(process.env.WA_NUMBER || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '20' + n.slice(1); return /^\d{11,15}$/.test(n) ? n : '' };
app.get('/api/config', (q, s) => s.json({ wa: wa() }));
app.get('/api/spec/:g', (q, s) => ['groom', 'bride'].includes(q.params.g) ? s.json(steps(q.params.g)) : s.sendStatus(404));
app.post('/api/register', lim, wrap(async (q, s) => {
  const { gender, password, data } = q.body || {}, phone = nd(q.body?.phone).trim();
  if (!['groom', 'bride'].includes(gender)) return s.status(400).json({ error: 'نوع غير صحيح' });
  if (!PH.test(phone)) return s.status(400).json({ error: 'رقم التليفون غير صحيح (مثال: 01012345678)' });
  if (!password || password.length < 6) return s.status(400).json({ error: 'كلمة السر 6 أحرف على الأقل' });
  const { e, clean } = validate(gender, data || {}); if (Object.keys(e).length) return s.status(400).json({ error: 'راجع البيانات المدخلة', fields: e });
  const db = await pool.connect(); try {
    await db.query('BEGIN');
    const u = (await db.query('INSERT INTO users(phone,password_hash,gender) VALUES($1,$2,$3) RETURNING id,gender', [phone, await bcrypt.hash(password, 10), gender])).rows[0];
    const k = Object.keys(clean); await db.query(`INSERT INTO ${gender}_profiles(user_id,${k}) VALUES($1,${k.map((_, i) => '$' + (i + 2))})`, [u.id, ...k.map(x => clean[x])]);
    const code = await newCode(u.id, db); await db.query('COMMIT'); s.json({ token: tok(u), gender, phone, status: 'pending', code })
  }
  catch (e) { await db.query('ROLLBACK'); if (e.code === '23505') return s.status(409).json({ error: 'هذا الرقم مسجل بالفعل، استخدم تسجيل الدخول' }); throw e } finally { db.release() }
}));
app.post('/api/login', lim, wrap(async (q, s) => {
  const phone = nd(q.body?.phone).trim(), u = (await pool.query('SELECT * FROM users WHERE phone=$1', [phone])).rows[0];
  if (!u || !await bcrypt.compare(String(q.body?.password || ''), u.password_hash)) return s.status(401).json({ error: 'رقم التليفون أو كلمة السر غير صحيحة' });
  s.json({ token: tok(u), gender: u.gender, phone: u.phone, status: u.status, code: u.status === 'pending' ? await newCode(u.id) : null })
}));
app.get('/api/me', auth, wrap(async (q, s) => { const u = (await pool.query('SELECT gender,phone,status FROM users WHERE id=$1', [q.u.id])).rows[0]; u ? s.json(u) : s.sendStatus(401) }));
app.post('/api/code/new', auth, wrap(async (q, s) => s.json({ code: await newCode(q.u.id) })));
const alim = rl({ windowMs: 15 * 60 * 1000, max: 10 }), ACT_MSG = process.env.ACTIVATION_MSG || 'السلام عليكم ورحمة الله، تم تفعيل حسابك في مبادرة وصال بنجاح ✅ يمكنك الآن الدخول إلى التطبيق والبحث. بارك الله لك وعليك.';
app.post('/api/admin/login', alim, wrap(async (q, s) => {
  const a = (await pool.query('SELECT * FROM admins WHERE username=$1', [String(q.body?.username || '').trim().toLowerCase()])).rows[0];
  if (!a || !await bcrypt.compare(String(q.body?.password || ''), a.password_hash)) return s.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
  s.json({ token: jwt.sign({ id: a.id, role: 'admin' }, SECRET, { expiresIn: '12h' }), username: a.username })
}));
app.get('/api/admin/stats', admin, wrap(async (q, s) => {
  const r = (await pool.query("SELECT count(*) FILTER(WHERE status='pending')::int pending,count(*) FILTER(WHERE status='verified')::int verified,count(*) FILTER(WHERE status='verified' AND gender='groom')::int grooms,count(*) FILTER(WHERE status='verified' AND gender='bride')::int brides FROM users")).rows[0];
  r.requests = (await pool.query("SELECT count(*)::int c FROM intro_requests WHERE status='new'")).rows[0].c; s.json(r)
}));
app.get('/api/admin/users', admin, wrap(async (q, s) => {
  const f = q.query, w = [], p = [];
  if (['pending', 'verified'].includes(f.status)) { p.push(f.status); w.push('u.status=$' + p.length) }
  if (f.q) { p.push('%' + String(f.q).replace(/[\\%_]/g, '\\$&') + '%'); w.push(`(u.phone ILIKE $${p.length} OR COALESCE(g.name,b.name) ILIKE $${p.length})`) }
  const r = await pool.query(`SELECT u.id,u.phone,u.gender,u.status,u.created_at,u.verified_at,u.notified_at,COALESCE(g.name,b.name) AS name,COALESCE(g.age,b.age) AS age,COALESCE(g.residence,b.residence) AS residence,
  (SELECT code FROM verification_codes c WHERE c.user_id=u.id ORDER BY c.created_at DESC LIMIT 1) AS code,
  EXISTS(SELECT 1 FROM verification_codes c WHERE c.user_id=u.id AND c.claimed_at IS NOT NULL) AS claimed
  FROM users u LEFT JOIN groom_profiles g ON g.user_id=u.id LEFT JOIN bride_profiles b ON b.user_id=u.id ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
  ORDER BY (u.status='pending') DESC,claimed DESC,u.created_at DESC LIMIT 300`, p); s.json({ items: r.rows, msg: ACT_MSG })
}));
app.get('/api/admin/users/:id', admin, wrap(async (q, s) => {
  const u = (await pool.query('SELECT id,phone,gender,status,created_at,verified_at,notified_at FROM users WHERE id=$1', [+q.params.id])).rows[0]; if (!u) return s.sendStatus(404);
  const d = (await pool.query(`SELECT * FROM ${u.gender}_profiles WHERE user_id=$1`, [u.id])).rows[0] || {};
  s.json({ user: u, fields: steps(u.gender).flat().filter(f => d[f.k] != null && d[f.k] !== '').map(f => ({ l: f.l, v: d[f.k] })) })
}));
app.post('/api/admin/users/:id/activate', admin, wrap(async (q, s) => {
  const r = await pool.query("UPDATE users SET status='verified',verified_at=COALESCE(verified_at,now()) WHERE id=$1 RETURNING phone", [+q.params.id]);
  if (!r.rowCount) return s.sendStatus(404); await pool.query('UPDATE verification_codes SET used=true WHERE user_id=$1', [+q.params.id]); s.json({ ok: true, phone: r.rows[0].phone, msg: ACT_MSG })
}));
app.post('/api/admin/users/:id/notified', admin, wrap(async (q, s) => { await pool.query('UPDATE users SET notified_at=now() WHERE id=$1', [+q.params.id]); s.json({ ok: true }) }));
app.post('/api/admin/users/:id/deactivate', admin, wrap(async (q, s) => { await pool.query("UPDATE users SET status='pending',verified_at=NULL,notified_at=NULL WHERE id=$1", [+q.params.id]); s.json({ ok: true }) }));
app.delete('/api/admin/users/:id', admin, wrap(async (q, s) => { await pool.query('DELETE FROM users WHERE id=$1', [+q.params.id]); s.json({ ok: true }) }));

// ===== بعد التفعيل: ادّعاء الإرسال، البحث، المفضلة، طلبات التعارف =====
const ver = [auth, (q, s, n) => (async () => {
  const u = (await pool.query('SELECT id,gender,status,phone FROM users WHERE id=$1', [q.u.id])).rows[0];
  if (!u) return s.sendStatus(401); if (u.status !== 'verified') return s.status(403).json({ error: 'الحساب لم يتم تفعيله بعد' }); q.me = u; n()
})().catch(e => { console.error(e); s.sendStatus(500) })];
const opp = g => g === 'groom' ? 'bride' : 'groom', first = n => String(n || '').split(' ')[0];
const CARD = t => ['name', 'age', 'residence', 'marital_status', 'has_children', 'children_count', 'education', 'job', 'quran_parts', 'height', 'weight', 'prayer', 'about_self', ...(t === 'bride' ? ['hijab'] : ['beard', 'smoker'])].map(c => 'p.' + c).join(',');
const shape = r => ({ ...r, name: first(r.name) });
const who = async (id) => (await pool.query(`SELECT u.id,u.phone,u.gender,COALESCE(g.name,b.name) AS name FROM users u LEFT JOIN groom_profiles g ON g.user_id=u.id LEFT JOIN bride_profiles b ON b.user_id=u.id WHERE u.id=$1`, [id])).rows[0];
app.post('/api/verify/claim', auth, wrap(async (q, s) => {
  const c = (await pool.query('SELECT code,claimed_at FROM verification_codes WHERE user_id=$1 AND NOT used AND expires_at>now() ORDER BY created_at DESC LIMIT 1', [q.u.id])).rows[0];
  if (!c) return s.status(404).json({ error: 'انتهت صلاحية الكود، أنشئ كوداً جديداً' });
  if (!c.claimed_at) { await pool.query('UPDATE verification_codes SET claimed_at=now() WHERE code=$1', [c.code]); const u = await who(q.u.id); notifyAdmin('🔔 مستخدم جديد بانتظار التفعيل', `${u.name} (${u.gender === 'groom' ? 'عريس' : 'عروس'})\nالرقم: ${u.phone}\nالكود: ${c.code}\nراجع رسائل الواتساب ثم فعّل الحساب من لوحة الإدارة.`) }
  s.json({ ok: true })
}));
app.get('/api/profiles', ver, wrap(async (q, s) => {
  const t = opp(q.me.gender), f = q.query, w = ["u.status='verified'"], p = [q.me.id];
  const add = (sql, v) => { p.push(v); w.push(sql.replace('?', '$' + p.length)) }, n = k => f[k] !== undefined && f[k] !== '' && Number.isFinite(+f[k]);
  if (n('age_from')) add('p.age>=?', +f.age_from); if (n('age_to')) add('p.age<=?', +f.age_to); if (n('height_from')) add('p.height>=?', +f.height_from); if (n('height_to')) add('p.height<=?', +f.height_to); if (n('quran_min')) add('p.quran_parts>=?', +f.quran_min);
  ['marital_status', 'has_children', 'education', 'prayer', 'skin_color', ...(t === 'bride' ? ['hijab'] : ['beard', 'smoker'])].forEach(k => f[k] && add(`p.${k}=?`, String(f[k])));
  if (f.residence) add('p.residence ILIKE ?', '%' + String(f.residence).replace(/[\\%_]/g, '\\$&') + '%');
  const r = await pool.query(`SELECT u.id,${CARD(t)},(fv.profile_id IS NOT NULL) AS fav FROM users u JOIN ${t}_profiles p ON p.user_id=u.id LEFT JOIN favorites fv ON fv.user_id=$1 AND fv.profile_id=u.id WHERE ${w.join(' AND ')} ORDER BY u.verified_at DESC NULLS LAST LIMIT 60`, p);
  s.json({ items: r.rows.map(shape) })
}));
app.get('/api/profiles/:id', ver, wrap(async (q, s) => {
  const t = opp(q.me.gender), id = +q.params.id;
  const r = (await pool.query(`SELECT ${steps(t).flat().map(f => 'p.' + f.k)} FROM users u JOIN ${t}_profiles p ON p.user_id=u.id WHERE u.id=$1 AND u.status='verified'`, [id])).rows[0]; if (!r) return s.sendStatus(404);
  const fav = (await pool.query('SELECT 1 FROM favorites WHERE user_id=$1 AND profile_id=$2', [q.me.id, id])).rowCount > 0, rq = (await pool.query('SELECT status FROM intro_requests WHERE from_id=$1 AND to_id=$2', [q.me.id, id])).rows[0];
  s.json({ id, data: shape(r), fav, requested: rq ? rq.status : null })
}));
app.post('/api/fav/:id', ver, wrap(async (q, s) => {
  const id = +q.params.id;
  if (!(await pool.query("SELECT 1 FROM users WHERE id=$1 AND status='verified' AND gender=$2", [id, opp(q.me.gender)])).rowCount) return s.sendStatus(404);
  const r = await pool.query('INSERT INTO favorites(user_id,profile_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [q.me.id, id]);
  if (!r.rowCount) await pool.query('DELETE FROM favorites WHERE user_id=$1 AND profile_id=$2', [q.me.id, id]); s.json({ fav: !!r.rowCount })
}));
app.get('/api/favs', ver, wrap(async (q, s) => {
  const t = opp(q.me.gender);
  s.json({ items: (await pool.query(`SELECT u.id,${CARD(t)},true AS fav FROM favorites fv JOIN users u ON u.id=fv.profile_id JOIN ${t}_profiles p ON p.user_id=u.id WHERE fv.user_id=$1 ORDER BY fv.created_at DESC`, [q.me.id])).rows.map(shape) })
}));
app.post('/api/requests', ver, wrap(async (q, s) => {
  const to = +q.body?.to_id, note = String(q.body?.note || '').slice(0, 300);
  if (!(await pool.query("SELECT 1 FROM users WHERE id=$1 AND status='verified' AND gender=$2", [to, opp(q.me.gender)])).rowCount) return s.sendStatus(404);
  if ((await pool.query("SELECT count(*)::int c FROM intro_requests WHERE from_id=$1 AND status='new'", [q.me.id])).rows[0].c >= 10) return s.status(429).json({ error: 'لديك 10 طلبات قيد المراجعة، انتظر ردّ الإدارة' });
  try { await pool.query('INSERT INTO intro_requests(from_id,to_id,note) VALUES($1,$2,$3)', [q.me.id, to, note]) } catch (e) { if (e.code === '23505') return s.status(409).json({ error: 'أرسلت طلباً لهذا الملف من قبل' }); throw e }
  const [a, b] = await Promise.all([who(q.me.id), who(to)]);
  notifyAdmin('🤝 طلب تعارف جديد', `من: ${a.name} (${a.gender === 'groom' ? 'عريس' : 'عروس'}) ${a.phone} #${a.id}\nإلى: ${b.name} ${b.phone} #${b.id}${note ? '\nملاحظة: ' + note : ''}`);
  s.json({ ok: true })
}));
app.get('/api/requests', ver, wrap(async (q, s) => {
  const t = opp(q.me.gender);
  s.json({ items: (await pool.query(`SELECT r.id,r.to_id,r.status,r.created_at,p.name FROM intro_requests r JOIN ${t}_profiles p ON p.user_id=r.to_id WHERE r.from_id=$1 ORDER BY r.created_at DESC`, [q.me.id])).rows.map(shape) })
}));
app.get('/api/admin/requests', admin, wrap(async (q, s) => s.json((await pool.query(`SELECT r.id,r.status,r.note,r.created_at,uf.phone AS from_phone,uf.gender AS from_gender,COALESCE(gf.name,bf.name) AS from_name,ut.phone AS to_phone,COALESCE(gt.name,bt.name) AS to_name
 FROM intro_requests r JOIN users uf ON uf.id=r.from_id JOIN users ut ON ut.id=r.to_id LEFT JOIN groom_profiles gf ON gf.user_id=uf.id LEFT JOIN bride_profiles bf ON bf.user_id=uf.id LEFT JOIN groom_profiles gt ON gt.user_id=ut.id LEFT JOIN bride_profiles bt ON bt.user_id=ut.id ORDER BY r.created_at DESC LIMIT 100`)).rows)));
app.post('/api/admin/requests/:id', admin, wrap(async (q, s) => {
  if (!['new', 'contacted', 'closed'].includes(q.body.status)) return s.sendStatus(400);
  await pool.query('UPDATE intro_requests SET status=$1 WHERE id=$2', [q.body.status, +q.params.id]); s.json({ ok: true })
}));

if (require.main === module) app.listen(process.env.PORT || 3000, () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) console.log('⚠ JWT_SECRET ضعيف أو غير مضبوط: ضع نصاً عشوائياً طويلاً في .env');
  pool.query('SELECT count(*)::int c FROM admins').then(r => { if (!r.rows[0].c) console.log('⚠ لا يوجد حساب أدمن بعد: شغّل  npm run admin:create') }).catch(() => console.log('⚠ تأكد من تشغيل npm run db:init'));
  console.log(wa() ? 'رقم الواتساب: ' + wa() : '⚠ WA_NUMBER غير مضبوط في ملف .env');
  console.log('وصال شغال على http://localhost:' + (process.env.PORT || 3000) + '  |  الإدارة: /admin.html')
});
module.exports = app;
