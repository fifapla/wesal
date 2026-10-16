// إنشاء (أو إعادة تعيين كلمة سر) حساب الأدمن:  npm run admin:create
require('dotenv').config();const{Pool}=require('pg'),bcrypt=require('bcryptjs'),rl=require('readline');
const ask=q=>new Promise(r=>{const i=rl.createInterface({input:process.stdin,output:process.stdout});i.question(q,a=>{i.close();r(a.trim())})});
(async()=>{let[u,p]=process.argv.slice(2);u=(u||await ask('اسم مستخدم الأدمن (إنجليزي): ')).toLowerCase();p=p||await ask('كلمة السر (8 أحرف على الأقل): ');
 if(!/^[a-z0-9_.-]{3,30}$/.test(u)){console.error('اسم المستخدم: حروف إنجليزية وأرقام فقط (3-30)');process.exit(1)}
 if(p.length<8){console.error('كلمة السر قصيرة (8 أحرف على الأقل)');process.exit(1)}
 const pool=require('../db/pool')();
 await pool.query('INSERT INTO admins(username,password_hash) VALUES($1,$2) ON CONFLICT(username) DO UPDATE SET password_hash=EXCLUDED.password_hash',[u,await bcrypt.hash(p,10)]);
 console.log('تم إنشاء/تحديث حساب الأدمن:',u);process.exit(0)})().catch(e=>{console.error(e.message);process.exit(1)});
