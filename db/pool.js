// اتصال Postgres: يعمل محلياً، وعلى الاستضافات المجانية (Neon / Render / Supabase) مع SSL تلقائي
const{Pool}=require('pg');
module.exports=()=>{let u=process.env.DATABASE_URL||'';
 const ssl=process.env.PGSSL==='true'||/sslmode=require|\.neon\.tech|supabase\.co|render\.com/.test(u)?{rejectUnauthorized:false}:undefined;
 try{const x=new URL(u);x.searchParams.delete('sslmode');x.searchParams.delete('channel_binding');u=x.toString()}catch{}
 const p=new Pool({connectionString:u,ssl,max:process.env.VERCEL?1:5,idleTimeoutMillis:30000,connectionTimeoutMillis:20000});
 p.on('error',e=>console.error('pg idle error:',e.message));return p};
