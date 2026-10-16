// إشعارات الأدمن (تليجرام / بريد / واتساب) وإشعار المستخدم (واتساب Cloud API). لا تُسقط السيرفر أبداً عند الفشل.
const E=process.env,num=p=>{p=String(p).replace(/\D/g,'');return p.startsWith('0')?'20'+p.slice(1):p};
async function tg(t){if(!E.TELEGRAM_BOT_TOKEN||!E.TELEGRAM_CHAT_ID)return;
 const r=await fetch(`https://api.telegram.org/bot${E.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:E.TELEGRAM_CHAT_ID,text:t})});if(!r.ok)throw new Error('telegram '+r.status)}
async function mail(subject,text){if(!E.SMTP_HOST||!E.ADMIN_EMAIL)return;
 const m=require('nodemailer').createTransport({host:E.SMTP_HOST,port:+(E.SMTP_PORT||587),secure:E.SMTP_PORT=='465',auth:{user:E.SMTP_USER,pass:E.SMTP_PASS}});
 await m.sendMail({from:E.SMTP_USER,to:E.ADMIN_EMAIL,subject,text})}
async function wa(to,text,tpl){if(!E.WA_CLOUD_TOKEN||!E.WA_CLOUD_PHONE_ID)return;
 const body=tpl?{messaging_product:'whatsapp',to:num(to),type:'template',template:{name:tpl,language:{code:'ar'}}}:{messaging_product:'whatsapp',to:num(to),type:'text',text:{body:text}};
 const r=await fetch(`https://graph.facebook.com/v20.0/${E.WA_CLOUD_PHONE_ID}/messages`,{method:'POST',headers:{Authorization:'Bearer '+E.WA_CLOUD_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!r.ok)throw new Error('whatsapp '+r.status+' '+await r.text())}
const safe=(n,p)=>p.catch(e=>console.error('[notify:'+n+']',e.message));
exports.notifyAdmin=(subject,text)=>{console.log('[notify-admin]',subject);return Promise.all([safe('telegram',tg(subject+'\n'+text)),safe('email',mail(subject,text)),E.ADMIN_WA?safe('whatsapp',wa(E.ADMIN_WA,subject+'\n'+text)):0])};
exports.notifyUser=(phone,text)=>{console.log('[notify-user]',phone);return safe('whatsapp',wa(phone,text,E.WA_TEMPLATE_ACTIVATED))};
