// المصدر الوحيد لحقول الاستمارة: يُستخدم في السيرفر (تحقق + إنشاء الجداول) وفي الواجهة (رسم الفورم)
const yn=['نعم','لا'],ypa=['نعم','لا','حسب الاتفاق'],rg=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const QUAL=['بدون','محو الأمية','ابتدائي','إعدادي','دبلوم','ثانوية عامة','بكالوريوس','ليسانس','ماجستير','دكتوراه'];
const SKIN=['أسمر غامق','أسمر','قمحي','فاتح','مائل للبياض','أبيض'];
const F=(k,l,t,o,c,dis)=>({k,l,t,o,c,dis});
function steps(g){const M=g==='groom',m=(a,b)=>M?a:b,HS=m('يعاني من أمراض','تعاني من أمراض');
const ST=m(['أعزب','مطلق بدون أولاد','مطلق مع أولاد','أرمل بدون أولاد','أرمل مع أولاد'],['آنسة','مطلقة بدون أولاد','مطلقة مع أولاد','أرملة بدون أولاد','أرملة مع أولاد']);
const AC=m(['آنسة','مطلقة بدون أولاد','مطلقة مع أولاد','أرملة بدون أولاد','أرملة مع أولاد','جميع ما سبق'],['أعزب','مطلق بدون أولاد','مطلق مع أولاد','أرمل بدون أولاد','أرمل مع أولاد','جميع ما سبق']);
return[
[F('name','الاسم','ar'),F('age','السن','sel',rg(18,80)),F('residence','محل الاقامة','addr'),F('nationality','الجنسية','ar'),F('marital_status','الحالة الاجتماعية','rad',ST),F('has_children','هل لديك اطفال','rad',yn),F('children_count','عدد الاطفال','sel',rg(1,7),['has_children','=','نعم'],1),F('quran_parts','عدد اجزاء القرآن المحفوظة','sel',rg(0,30))],
[F('prayer','المحافظة على الصلاة المفروضة','rad',yn),M?F('beard','هل انت ملتحي','sel',['لا','لحية قصيرة','لحية طويلة']):F('hijab','الحجاب','sel',['بدون','طرحة','حجاب طويل','مختمرة','منتقبة']),F('education','المؤهل الدراسي','sel',QUAL),F('major','التخصص','ar'),F('job','الوظيفة الحالية','ar'),M?F('marriage_residence','محل سكن الزوجية','ar'):F('work_after_marriage','هل تفضلين العمل بعد الزواج','rad',ypa),F('height','الطول','sel',rg(100,210)),F('weight','الوزن','sel',rg(30,200))],
[F('skin_color','لون البشرة','sel',SKIN),F('health_status','الحالة الصحية','rad',['جيدة',HS]),F('health_details',m('اذكر المشاكل الصحية','اذكري المشاكل الصحية'),'txt',0,['health_status','=',HS]),F('father_job','عمل الوالد','ar'),F('mother_job','عمل الوالدة','ar'),F('siblings_count','عدد الاخوة','sel',rg(0,10)),F('siblings_job','عمل الاخوة','txt',0,['siblings_count','!=',0],1),
 M?F('smoker','هل انت مدخن','rad',yn):F('polygamy_accept','هل تقبلين التعدد','rad',yn),M?F('watches_media','هل تشاهد المسلسلات او الافلام','rad',yn):F('outside_governorate','هل تقبلين الاستقرار خارج محافظتك','rad',yn)],
[M?F('listens_songs','هل تسمع اغاني','rad',yn):F('outside_egypt','هل تقبلين الاستقرار خارج مصر','rad',yn),F('movables_list',m('هل تقبل بقائمة المنقولات','هل تتمسكين بقائمة المنقولات'),'rad',ypa),F('special_conditions','هل لديك شروط خاصة','txt'),F('about_self',m('تكلم عن نفسك','تكلمي عن نفسك'),'txt'),F('preferred_governorate',m('محافظة العروس المفضلة','محافظة العريس المفضلة'),'txt'),F('accepted_status',m('الحالة الاجتماعية المقبولة للعروس','الحالة الاجتماعية المقبولة للعريس'),'rad',AC),F('family_house',m('هل السكن في بيت عيلة','هل تقبلين السكن في بيت عيلة'),'rad',yn),F('partner_specs',m('مواصفات العروس','مواصفات العريس'),'txt')]]}
const AR=/^[\u0621-\u064A ]+$/,ADR=/^[\u0621-\u064A\u0660-\u0669 \-]+$/,TX=/^[\u0621-\u064A \-]+$/;
const nd=s=>String(s??'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const isNum=f=>f.t==='age'||(f.t==='sel'&&typeof f.o[0]==='number');
function check(f,v){v=String(v??'').trim();if(!v)return'هذا الحقل مطلوب';
if(f.t==='ar'&&!AR.test(v))return'حروف عربية فقط';if(f.t==='addr'&&!ADR.test(v))return'حروف عربية وأرقام هندية فقط';if(f.t==='txt'&&!TX.test(v))return'حروف عربية فقط (بدون أرقام أو رموز)';
if(f.t==='age'){const n=nd(v);if(!/^\d+$/.test(n)||+n<18||+n>80)return'السن من 18 إلى 80 فقط'}
if((f.t==='rad'||f.t==='sel')&&!f.o.map(String).includes(v))return'اختيار غير صحيح';return''}
const on=(f,d)=>{if(!f.c)return true;const[k,op,v]=f.c,x=String(d[k]??'');return op==='!='?x!==String(v):x===String(v)};
function norm(d){d={...d};const m=String(d.marital_status||'');if(/بدون أولاد/.test(m))d.has_children='لا';else if(/مع أولاد/.test(m))d.has_children='نعم';return d}
function validate(g,d0){const d=norm(d0),e={},clean={};for(const f of steps(g).flat()){if(!on(f,d)){clean[f.k]=null;continue}
const m=check(f,d[f.k]);if(m)e[f.k]=m;else clean[f.k]=isNum(f)?+nd(d[f.k]):String(d[f.k]).trim()}
if(clean.siblings_count===0)clean.siblings_job='لا يوجد';return{e,clean}}
module.exports={steps,validate,check,isNum,nd,on,norm};
