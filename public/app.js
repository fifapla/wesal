const $=s=>document.querySelector(s),app=$('#app');
const S={s:'splash',g:'groom',st:0,D:{},E:{},ph:'',pw:'',oath:false,code:'',spec:{},wa:'',tab:'search',F:{},fo:false,list:[],reqs:[],prof:null,ld:false};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const nd=s=>String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const rg=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const AR=/^[\u0621-\u064A ]+$/,ADR=/^[\u0621-\u064A\u0660-\u0669 \-]+$/,TX=/^[\u0621-\u064A \-]+$/;
/* ---------- المظهر (فاتح / داكن / تلقائي) ---------- */
function applyTheme(){if(typeof matchMedia=='undefined')return;const m=localStorage.th||'auto',d=m=='dark'||(m=='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
 document.documentElement.dataset.theme=d?'dark':'light';const t=document.querySelector('meta[name=theme-color]');if(t)t.content=d?'#14110d':'#0f3d22'}
applyTheme();if(typeof matchMedia!='undefined')matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applyTheme);
/* ---------- أيقونات ---------- */
const I={user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
pin:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',send:'<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',check:'<path d="M20 6L9 17l-5-5"/>',x:'<path d="M18 6L6 18M6 6l12 12"/>',next:'<path d="M19 12H5M12 19l-7-7 7-7"/>',prev:'<path d="M5 12h14M12 5l7 7-7 7"/>',
copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'};
const ic=(n,s=20,f)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const tgl=c=>`<button class="ib tg${c?' corner':''}" data-theme-toggle aria-label="تبديل المظهر"><span class="sun">${ic('sun',20)}</span><span class="moon">${ic('moon',20)}</span></button>`;
/* ---------- أدوات ---------- */
const NATIVE=typeof Capacitor!=='undefined'&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform();
const API=NATIVE?(window.WESAL_API||''):'';
async function api(p,b){if(NATIVE&&!API)throw new Error('حدد عنوان السيرفر في ملف public/config.js ثم أعد بناء التطبيق');
 const wake=setTimeout(()=>toast('السيرفر بيستيقظ، قد يستغرق دقيقة... استنى لحظات'),5000);
 try{return await api1(p,b)}catch(x){if(b===undefined&&x.net){await new Promise(r=>setTimeout(r,2500));return await api1(p,b)}throw x}finally{clearTimeout(wake)}}
async function api1(p,b){
 const r=await fetch(API+'/api'+p,{method:b===undefined?'GET':'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(localStorage.wt||'')},body:b===undefined?undefined:JSON.stringify(b)}).catch(()=>{throw Object.assign(new Error('تعذر الاتصال بالسيرفر، تأكد من الإنترنت وأن السيرفر يعمل'),{net:1})});
 const j=await r.json().catch(()=>({}));
 if(r.status==401&&p!='/login'&&localStorage.wt){localStorage.removeItem('wt');setTimeout(()=>go('enter'),0)}
 if(!r.ok)throw Object.assign(new Error(j.error||'حدث خطأ'),{fields:j.fields,status:r.status});return j}
function toast(m,t){const e=$('#toast');e.className='on '+(t||'');e.innerHTML=ic(t=='er'?'x':'check',16)+esc(m);clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',3400)}
function ask(t,d,ok){return new Promise(res=>{const m=$('#modal');m.innerHTML=`<div class="mbg" data-n></div><div class="md" role="dialog" aria-modal="true"><h3>${t}</h3><p>${d}</p><div class="ma"><button class="btn p" data-y>${ok}</button><button class="btn o" data-n>إلغاء</button></div></div>`;m.className='on';
 m.onclick=e=>{const y=e.target.closest('[data-y]'),n=e.target.closest('[data-n]');if(y||n){m.className='';m.innerHTML='';res(!!y)}}})}
const WM='<div class="wm"></div>',HB='<div class="hb"><img class="l" src="img/house.webp" alt=""><img class="r" src="img/house.webp" alt=""></div>';
/* ---------- قواعد الاستمارة (نفس منطق السيرفر) ---------- */
const on=f=>{if(!f.c)return true;const[k,op,v]=f.c,x=String(S.D[k]??'');return op=='!='?x!==String(v):x===String(v)};
function normD(){const m=S.D.marital_status||'';if(/بدون أولاد/.test(m))S.D.has_children='لا';else if(/مع أولاد/.test(m))S.D.has_children='نعم';
 if(S.D.has_children!='نعم')delete S.D.children_count;if(String(S.D.siblings_count)==='0')delete S.D.siblings_job}
function saveDraft(){try{if(S.s=='form'&&S.st<4)localStorage.wd=JSON.stringify({g:S.g,D:S.D,st:S.st,ph:S.ph})}catch{}}
function chk(f,v){v=String(v??'').trim();if(!v)return'هذا الحقل مطلوب';
 if(f.t=='ar'&&!AR.test(v))return'حروف عربية فقط';if(f.t=='addr'&&!ADR.test(v))return'حروف عربية وأرقام هندية فقط';if(f.t=='txt'&&!TX.test(v))return'حروف عربية فقط (بدون أرقام أو رموز)';return''}
const STT=['البيانات الأساسية','الدين والتعليم والعمل','الصحة والأسرة','التفضيلات والمواصفات','بيانات الحساب'];
const who=()=>S.g=='groom'?'عريس':'عروس';
const inw=(i,h,eye)=>`<div class="inw">${ic(i,18)}${h}${eye?`<button type="button" class="eye" data-eye aria-label="إظهار كلمة السر">${ic('eye',18)}</button>`:''}</div>`;
function fh(f){const v=S.D[f.k]??'',e=S.E[f.k],act=on(f);let c;
 if(!act&&!f.dis)return'';
 const lock=f.k=='has_children'&&/أولاد/.test(S.D.marital_status||'');
 if(!act)c=f.t=='sel'?`<select class="in" disabled><option>غير متاح</option></select>`:`<input class="in" disabled placeholder="غير متاح">`;
 else if(f.t=='rad')c=`<div class="opts${f.o.length==3?' c3':''}${lock?' dis':''}">${f.o.map(o=>`<label class="rb${v==o?' on':''}"><input type="radio" name="${f.k}" value="${esc(o)}" data-r="${f.k}"${v==o?' checked':''}${lock?' disabled':''}><span class="dot"></span><span class="t">${o}</span></label>`).join('')}</div>`;
 else if(f.t=='sel')c=`<select class="in" data-s="${f.k}"><option value="">اختر</option>${f.o.map(o=>`<option${v==o?' selected':''}>${o}</option>`).join('')}</select>`;
 else c=`<input class="in" data-i="${f.k}" value="${esc(v)}" autocomplete="off">`;
 return`<div class="fld${e?' bad':''}${act?'':' off'}"><label class="lbl">${f.l}</label>${c}${e?`<div class="err">${e}</div>`:''}</div>`}
const hdr=(t,eb,prog)=>`<header class="hd z"><div class="eyebrow">${ic('user',14)} ${eb||'استمارة '+who()}</div><h1>${t}</h1>${prog?`<div class="seg">${[0,1,2,3,4].map(i=>`<i class="${i<S.st?'dn':i==S.st?'on':''}"></i>`).join('')}</div><div class="stepno">الخطوة ${S.st+1} من 5</div>`:''}</header>`;
/* ---------- البحث ---------- */
const T=()=>S.spec[S.g=='groom'?'bride':'groom'],tf=k=>T().flat().find(f=>f.k==k);
const STAT={new:'تم الاستلام وجارٍ المراجعة',contacted:'تم التواصل معك',closed:'مغلق'};
const FIL=()=>{const b=S.g=='groom';return[['age_from','السن من',rg(18,80)],['age_to','السن إلى',rg(18,80)],['marital_status','الحالة الاجتماعية',tf('marital_status').o],['has_children','لديه/لديها أطفال',['نعم','لا']],['education','المؤهل الدراسي',tf('education').o],['prayer','المحافظة على الصلاة',['نعم','لا']],['quran_min','حفظ القرآن (أجزاء على الأقل)',rg(1,30)],['height_from','الطول من',rg(100,210)],['height_to','الطول إلى',rg(100,210)],['skin_color','لون البشرة',tf('skin_color').o],...(b?[['hijab','الحجاب',tf('hijab').o]]:[['beard','اللحية',tf('beard').o],['smoker','مدخن',['نعم','لا']]])]};
const activeF=()=>Object.entries(S.F).filter(([k,v])=>v!==''&&v!=null);
const flab=k=>k=='residence'?'الإقامة':(FIL().find(x=>x[0]==k)||[k,k])[1];
const avc=()=>S.g=='groom'?'b':'';
const chips=p=>[p.marital_status,p.education,p.job,p.hijab?'الحجاب: '+p.hijab:p.beard?'اللحية: '+p.beard:'',p.has_children=='نعم'?'أطفال: '+p.children_count:'بدون أطفال','قرآن: '+p.quran_parts+' جزء',p.height+' سم','الصلاة: '+p.prayer].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
const favb=(id,on,st)=>`<button class="fav${on?' on':''}"${st?` style="${st}"`:''} data-fav="${id}" aria-label="${on?'إزالة من المفضلة':'إضافة للمفضلة'}">${ic('star',20,on)}</button>`;
const card=(p,i)=>`<article class="pf" style="animation-delay:${Math.min(i,8)*50}ms"><div class="pf-top"><div class="av ${avc()}">${esc(p.name.charAt(0))}</div><div class="pf-info"><b>${esc(p.name)}<span class="vb" title="حساب موثّق">${ic('shield',16)}</span></b><div class="meta"><span>${p.age} سنة</span><span>${ic('pin',13)}${esc(p.residence)}</span></div></div>${favb(p.id,p.fav)}</div>
<div class="chips">${chips(p)}</div>${p.about_self?`<p class="ab">${esc(p.about_self.slice(0,100))}${p.about_self.length>100?'…':''}</p>`:''}<button class="btn o" data-open="${p.id}">عرض الملف الكامل</button></article>`;
const empty=(i,t,d)=>`<div class="empty"><div class="ei">${ic(i,38)}</div><b>${t}</b>${d}</div>`;
const sheet=()=>S.fo?`<div class="sheet-bg" data-fo></div><section class="sheet" role="dialog" aria-label="تصفية النتائج"><div class="grab"></div><h2>تصفية النتائج</h2><div class="fgrid"><div style="grid-column:1/-1;margin-bottom:10px"><label class="lbl">محل الإقامة</label><input class="in" data-fi value="${esc(S.F.residence||'')}" placeholder="مثال: القاهرة"></div>${FIL().map(([k,l,o])=>`<div style="margin-bottom:10px"><label class="lbl">${l}</label><select class="in" data-fs="${k}"><option value="">الكل</option>${o.map(x=>`<option${S.F[k]==x?' selected':''}>${x}</option>`).join('')}</select></div>`).join('')}</div><div class="sheet-act"><button class="btn p" data-search>${ic('search',18)} عرض النتائج</button><button class="btn o" data-clear>مسح</button></div></section>`:'';
const topbar=(t,act)=>`<header class="top z"><div class="brand"><img src="img/mark.webp" alt="وصال"><div><small>مبادرة وصال</small><h1>${t}</h1></div></div><div class="acts">${act||''}${tgl()}</div></header>`;
const tabs=()=>`<nav class="tabs">${[['search','search','بحث'],['favs','star','المفضلة'],['reqs','send','طلباتي'],['me','user','حسابي']].map(([k,i,l])=>`<button class="${S.tab==k?'on':''}" data-tab="${k}">${ic(i,22)}${l}</button>`).join('')}</nav>`;
const mePage=()=>{const th=localStorage.th||'auto';return`<div class="card" style="margin:0 0 14px;padding-bottom:14px"><div class="hero" style="padding:0 0 10px"><div class="av ${S.g=='bride'?'b':''}">${ic('user',28)}</div><h2>${who()}</h2><div class="meta"><span class="vb">${ic('shield',15)} حساب موثّق</span></div></div>
<div class="kv"><span>رقم التليفون</span><b dir="ltr">${esc(S.ph)}</b></div><div class="kv"><span>نوع الحساب</span><b>${who()}</b></div></div>
<div class="card" style="margin:0 0 14px;padding-bottom:16px"><div class="lbl">المظهر</div><div class="seg2">${[['auto','تلقائي'],['light','فاتح'],['dark','داكن']].map(([k,l])=>`<button class="${th==k?'on':''}" data-th="${k}">${l}</button>`).join('')}</div></div>
<button class="btn o" data-out>${ic('out',18)} تسجيل الخروج</button><div class="mut" style="margin-top:14px">وصال · الإصدار 1.0</div>`};
const V={
splash:()=>`<div class="pg fix splash"><img class="a sp-bg" src="img/splash_bg.webp" alt=""><img class="a sp-logo" src="img/logo_tag.webp" alt="وصال"><img class="a sp-badge" src="img/badge.webp" alt=""><div class="sp-bar" role="progressbar" aria-label="جارٍ التحميل"><i></i></div><div class="sp-wait">جارٍ الاتصال بالسيرفر…</div></div>`,
enter:()=>`<div class="pg">${WM}${tgl(1)}<div class="enter z"><img class="mk" src="img/mark.webp" alt="وصال"><img class="t ti" src="img/title.webp" alt="مبادرة وصال"><img class="t du" src="img/dua.webp" alt="">
<h3>يرجى الضغط على الصورة<small>للدخول او التسجيل</small></h3><div class="pick"><button class="pc" data-pick="bride"><img src="img/bride.webp" alt="">عروس</button><button class="pc" data-pick="groom"><img src="img/groom.webp" alt="">عريس</button></div></div>${HB}</div>`,
login:()=>`<div class="pg">${WM}${tgl(1)}<div class="auth z"><img class="lg" src="img/logo_card.webp" alt="وصال"><h1>مرحباً بعودتك</h1><p class="sub">سجّل دخولك لمتابعة البحث عن شريك الحياة</p>
<div class="card"><div class="fld"><label class="lbl">رقم التليفون</label>${inw('phone','<input class="in ltr" id="lph" inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="username">')}</div>
<div class="fld"><label class="lbl">كلمة السر</label>${inw('lock','<input class="in ltr" id="lpw" type="password" autocomplete="current-password">',1)}</div><div class="err" id="lerr" style="margin:-8px 0 4px"></div>
<button class="btn p" data-login>دخول ${ic('next',18)}</button></div><div class="or">ليس لديك حساب؟</div><button class="btn o" data-reg>${ic('user',18)} إنشاء حساب جديد</button><button class="lnk" data-go="enter">رجوع</button></div>${HB}</div>`,
form:()=>{const T=S.spec[S.g];
 if(S.st<T.length)return`<div class="pg">${WM}${hdr(STT[S.st],0,1)}<main class="card z">${T[S.st].map(fh).join('')}</main><nav class="nav"><button class="btn p" data-next>التالي ${ic('next',18)}</button>${S.st?`<button class="btn o" data-prev>${ic('prev',18)} السابق</button>`:''}</nav>${HB}</div>`;
 return`<div class="pg">${WM}${hdr(STT[4],0,1)}<main class="card z"><div class="fld"><label class="lbl">رقم التليفون</label>${inw('phone',`<input class="in ltr" id="fph" inputmode="tel" placeholder="01XXXXXXXXX" value="${esc(S.ph)}">`)}</div>
<div class="fld"><label class="lbl">كلمة السر (6 أحرف على الأقل)</label>${inw('lock',`<input class="in ltr" id="fpw" type="password" value="${esc(S.pw)}" autocomplete="new-password">`,1)}</div>
<div class="oath${S.oath?' on':''}" data-ck role="checkbox" aria-checked="${S.oath}"><span class="ckb">${S.oath?ic('check',16):''}</span><span>اقسم بالله العظيم ان كافة البيانات والمعلومات المدخلة صحيحة</span></div><div class="err" id="ferr" style="margin:-8px 0 12px"></div></main>
<nav class="nav"><button class="btn p" id="send" data-send${S.oath?'':' disabled'}>ارسل ${ic('send',18)}</button><button class="btn o" data-prev>${ic('prev',18)} السابق</button></nav>${HB}</div>`},
verify:()=>`<div class="pg">${WM}${hdr('تأكيد رقم التليفون','خطوة أخيرة')}<main class="card z"><ol class="stp"><li><b>1</b>اضغط زر واتساب لإرسال الكود</li><li><b>2</b>ابعت الرسالة كما هي من رقمك المسجل</li><li><b>3</b>ارجع هنا واضغط "تم الإرسال"</li></ol>
<div class="mut">الرقم المسجل <b dir="ltr">${esc(S.ph||'')}</b></div><div class="code"><button class="cp" data-copy aria-label="نسخ الكود">${ic('copy',18)}</button><span>${esc(S.code)}</span><i style="width:42px"></i></div>
${S.wa?`<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${S.wa}?text=${encodeURIComponent('كود التحقق بتاعي هو '+S.code)}">${ic('send',18)} إرسال الكود على واتساب</a>`:'<div class="err" style="text-align:center">رقم واتساب الاستقبال غير مضبوط (WA_NUMBER)</div>'}
<button class="btn p" data-chk>${ic('check',18)} تم الإرسال</button><button class="lnk" data-newcode>إنشاء كود جديد</button><div class="mut" style="padding-bottom:12px">الكود صالح 15 دقيقة، ويتم تفعيل حسابك بعد وصول رسالتك لفريق المبادرة.</div></main>${HB}</div>`,
pending:()=>`<div class="pg">${WM}<div class="z" style="padding:56px 16px 170px"><main class="card ctr"><div class="pulse">${ic('clock',38)}</div><h2>استلمنا رسالتك</h2><p>جارٍ مراجعة رسالتك وتفعيل حسابك، وستصلك رسالة عبر الواتساب بمجرد تأكيد تسجيلك بنجاح.</p>
<ol class="tl"><li class="done">تم إنشاء الحساب</li><li class="done">إرسال كود التحقق</li><li class="now">مراجعة الإدارة</li><li>تفعيل الحساب والدخول</li></ol><p class="mut">يمكنك إغلاق التطبيق والرجوع لاحقاً، وسيفتح حسابك مباشرة بعد التفعيل.</p><button class="lnk" data-go="verify">الرجوع لشاشة الكود</button><button class="lnk" data-out>تسجيل الخروج</button></main></div>${HB}</div>`,
home:()=>{const t=S.tab,n=activeF().length,TT={search:'البحث عن شريك الحياة',favs:'المفضلة',reqs:'طلباتي',me:'حسابي'};let b;
 if(t=='me')b=mePage();
 else if(S.ld)b='<div class="sk"></div><div class="sk"></div><div class="sk"></div>';
 else if(t=='reqs')b=S.reqs.length?S.reqs.map((r,i)=>`<article class="pf" style="animation-delay:${i*50}ms"><div class="pf-top"><div class="av ${avc()}">${esc(r.name.charAt(0))}</div><div class="pf-info"><b>${esc(r.name)}</b><div class="meta"><span>${ic('clock',13)}${new Date(r.created_at).toLocaleDateString('ar-EG')}</span></div></div><span class="st ${r.status}">${STAT[r.status]}</span></div></article>`).join(''):empty('send','لا توجد طلبات بعد','افتح أي ملف واضغط "طلب تعارف" ليتواصل معك فريق المبادرة');
 else b=(t=='search'&&n?`<div class="fchips">${activeF().map(([k,v])=>`<button class="fc" data-rmf="${k}">${flab(k)}: ${esc(v)} ${ic('x',12)}</button>`).join('')}</div>`:'')+(S.list.length?`<div class="cnt">${S.list.length} ${t=='favs'?'ملف في المفضلة':'ملف مطابق'}</div>`+S.list.map(card).join(''):(t=='favs'?empty('star','المفضلة فارغة','اضغط على النجمة في أي ملف لحفظه هنا'):empty('search','لا توجد نتائج مطابقة','جرّب تغيير شروط التصفية أو توسيع نطاق البحث')));
 return`<div class="pg">${WM}${topbar(TT[t],t=='search'?`<button class="ib" data-fo aria-label="تصفية">${ic('sliders',20)}${n?`<b class="bd">${n}</b>`:''}</button>`:'')}<main class="z" style="padding:4px 16px 20px">${b}</main>${tabs()}${sheet()}</div>`},
detail:()=>{const p=S.prof,d=p.data,secs=T().map((st,i)=>{const rows=st.filter(f=>f.k!='name'&&d[f.k]!=null&&d[f.k]!=='').map(f=>`<div class="kv"><span>${f.l}</span><b>${esc(d[f.k])}</b></div>`).join('');return rows?`<section class="sec"><h3>${STT[i]}</h3>${rows}</section>`:''}).join('');
 return`<div class="pg">${WM}<div class="hero z"><div class="av ${avc()}">${esc(d.name.charAt(0))}</div><h2>${esc(d.name)}</h2><div class="meta"><span>${d.age} سنة</span><span>${ic('pin',13)}${esc(d.residence)}</span><span class="vb">${ic('shield',15)} حساب موثّق</span></div></div>${secs}
<div class="mut z" style="padding:0 30px 10px">لا تُعرض بيانات التواصل. تتواصل الإدارة مع الطرفين لترتيب التعارف.</div>
<nav class="nav"><button class="btn o sq" data-back aria-label="رجوع">${ic('prev',20)}</button>${favb(p.id,p.fav,'width:52px;height:52px;border-radius:16px')}${p.requested?`<div class="btn o" style="cursor:default">${STAT[p.requested]}</div>`:`<button class="btn p" data-req="${p.id}">${ic('send',18)} طلب تعارف عبر الإدارة</button>`}</nav></div>`}};
function draw(keep){const y=scrollY;document.body.className=S.g=='bride'&&['login','form','verify','pending','home','detail'].includes(S.s)?'bride':'';app.innerHTML=V[S.s]();scrollTo(0,keep?y:0)}
const go=s=>{S.s=s;draw()};
async function refreshWa(){try{S.wa=(await api('/config')).wa}catch{}}
async function loadSpec(g){if(!S.spec[g])S.spec[g]=await api('/spec/'+g)}
async function loadList(){const t=S.tab;if(t=='search')S.list=(await api('/profiles?'+new URLSearchParams(activeF()))).items;else if(t=='favs')S.list=(await api('/favs')).items;else if(t=='reqs')S.reqs=(await api('/requests')).items}
async function refresh(keep){S.ld=true;draw(1);try{await loadList()}catch(x){toast(x.message,'er')}S.ld=false;draw(keep?1:0)}
async function toHome(tab){S.tab=tab||S.tab;S.prof=null;S.fo=false;await loadSpec('groom');await loadSpec('bride');S.s='home';S.tab=='me'?draw():await refresh()}
async function afterAuth(r){await refreshWa();localStorage.wt=r.token;localStorage.removeItem('wd');S.g=r.gender;S.ph=r.phone;if(r.status=='verified')return toHome('search');S.code=r.code;go('verify')}
const AS='[data-login],[data-send],[data-chk],[data-newcode],[data-req],[data-search]';
app.onclick=async e=>{const t=e.target.closest('[data-go],[data-pick],[data-next],[data-prev],[data-login],[data-reg],[data-ck],[data-send],[data-chk],[data-newcode],[data-out],[data-tab],[data-fav],[data-open],[data-back],[data-req],[data-fo],[data-search],[data-clear],[data-rmf],[data-eye],[data-copy],[data-theme-toggle],[data-th]');if(!t)return;const d=t.dataset;
if(t.matches(AS))t.classList.add('ld');
try{
if(d.go)go(d.go);
else if(d.pick){S.g=d.pick;S.D={};S.st=0;S.E={};await loadSpec(S.g);go('login')}
else if(t.matches('[data-reg]')){S.D={};S.st=0;S.E={};S.oath=false;S.ph='';S.pw='';
 try{const w=JSON.parse(localStorage.wd||'null');if(w&&w.g==S.g&&w.D){S.D=w.D;S.st=Math.min(w.st||0,3);S.ph=w.ph||'';toast('تم استرجاع بياناتك المحفوظة')}}catch{}go('form')}
else if(t.matches('[data-prev]')){S.st--;saveDraft();draw()}
else if(t.matches('[data-next]')){S.E={};S.spec[S.g][S.st].filter(on).forEach(f=>{const m=f.t=='rad'||f.t=='sel'?(S.D[f.k]?'':'هذا الحقل مطلوب'):chk(f,S.D[f.k]);if(m)S.E[f.k]=m});
 if(Object.keys(S.E).length){draw(1);document.querySelector('.fld.bad')?.scrollIntoView({block:'center'});return}S.st++;saveDraft();draw()}
else if(t.matches('[data-ck]')){S.oath=!S.oath;draw(1)}
else if(t.matches('[data-eye]')){const i=t.parentElement.querySelector('input');i.type=i.type=='password'?'text':'password'}
else if(t.matches('[data-copy]')){try{await navigator.clipboard.writeText(S.code);toast('تم نسخ الكود')}catch{toast('انسخ الكود يدوياً','er')}}
else if(t.matches('[data-theme-toggle]')){localStorage.th=document.documentElement.dataset.theme=='dark'?'light':'dark';applyTheme()}
else if(d.th){if(d.th=='auto')localStorage.removeItem('th');else localStorage.th=d.th;applyTheme();draw(1)}
else if(t.matches('[data-login]')){try{await afterAuth(await api('/login',{phone:$('#lph').value,password:$('#lpw').value}))}catch(x){$('#lerr').textContent=x.message}}
else if(t.matches('[data-send]')){t.disabled=true;try{await afterAuth(await api('/register',{gender:S.g,phone:S.ph,password:S.pw,data:S.D}))}
 catch(x){t.disabled=false;if(x.fields){S.E=x.fields;S.st=Math.max(0,S.spec[S.g].findIndex(s=>s.some(f=>x.fields[f.k])));draw();toast(x.message,'er')}else $('#ferr').textContent=x.message}}
else if(t.matches('[data-chk]')){await api('/verify/claim',{});go('pending')}
else if(t.matches('[data-newcode]')){S.code=(await api('/code/new',{})).code;await refreshWa();draw()}
else if(t.matches('[data-out]')){if(!await ask('تسجيل الخروج','هل تريد تسجيل الخروج من حسابك؟','تسجيل الخروج'))return;localStorage.removeItem('wt');S.D={};S.F={};S.tab='search';go('enter')}
else if(d.tab){S.tab=d.tab;d.tab=='me'?draw():await refresh()}
else if(t.matches('[data-fo]')){S.fo=!S.fo;draw(1)}
else if(t.matches('[data-search]')){S.fo=false;await refresh();toast(S.list.length?'تم العثور على '+S.list.length+' ملف':'لا توجد نتائج مطابقة')}
else if(t.matches('[data-clear]')){S.F={};S.fo=false;await refresh()}
else if(d.rmf){delete S.F[d.rmf];await refresh(1)}
else if(d.open){S.prof=await api('/profiles/'+d.open);go('detail')}
else if(t.matches('[data-back]')){S.prof=null;go('home')}
else if(d.fav){const r=await api('/fav/'+d.fav,{}),id=+d.fav;S.list.forEach(p=>{if(p.id==id)p.fav=r.fav});if(S.s=='home'&&S.tab=='favs'&&!r.fav)S.list=S.list.filter(p=>p.id!=id);if(S.prof&&S.prof.id==id)S.prof.fav=r.fav;draw(1)}
else if(d.req){if(!await ask('طلب تعارف','سيتم إرسال طلبك للإدارة للتواصل مع الطرف الآخر وترتيب التعارف. هل تريد المتابعة؟','إرسال الطلب'))return;await api('/requests',{to_id:+d.req});S.prof.requested='new';draw(1);toast('تم إرسال طلبك للإدارة، وسيتم التواصل معك')}
}catch(x){toast(x.message,'er')}finally{t.classList?.remove('ld')}};
app.oninput=e=>{const t=e.target;if(t.dataset.i){S.D[t.dataset.i]=t.value;saveDraft()}if(t.dataset.fi!==undefined)S.F.residence=t.value;if(t.id=='fph')S.ph=t.value;if(t.id=='fpw')S.pw=t.value};
app.onchange=e=>{const t=e.target;
 if(t.dataset.r){const k=t.dataset.r,v=t.value;if(k=='marital_status'&&/أولاد/.test(S.D[k]||'')&&!/أولاد/.test(v))delete S.D.has_children;S.D[k]=v;normD();saveDraft();draw(1)}
 if(t.dataset.fs)S.F[t.dataset.fs]=t.value;
 if(t.dataset.s){S.D[t.dataset.s]=t.value;normD();saveDraft();draw(1)}};
app.onkeydown=e=>{if(e.key=='Enter'&&(e.target.id=='lph'||e.target.id=='lpw'))$('[data-login]')?.click()};
setInterval(async()=>{if(S.s=='verify'||S.s=='pending'){try{if((await api('/me')).status=='verified'){toast('تم تفعيل حسابك بنجاح');toHome('search')}}catch{}}},5000);
(async()=>{draw();const t0=Date.now();
 const prep=(async()=>{await refreshWa();let next='enter';if(localStorage.wt){try{const me=await api('/me');S.g=me.gender;S.ph=me.phone;if(me.status=='verified')next='home';else{S.code=(await api('/code/new',{})).code;next='verify'}}catch{localStorage.removeItem('wt')}}return next})();
 const w=setTimeout(()=>{if(S.s=='splash')$('.sp-wait')?.classList.add('on')},1800);
 const next=await prep;setTimeout(()=>{clearTimeout(w);if(S.s=='splash')next=='home'?toHome('search'):go(next)},Math.max(0,1500-(Date.now()-t0)))})();
