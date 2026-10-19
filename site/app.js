(() => {
  'use strict';
  const services=[{"id": "both", "group": "whole", "az": "Alt + üst tam", "ru": "Обе челюсти", "price": 80, "description": {"az": "Üst və alt çənənin tam 3D müayinəsi.", "ru": "Полное 3D-исследование верхней и нижней челюстей."}, "image": "scope-both.svg", "kind": "schematic"}, {"id": "upper", "group": "whole", "az": "Üst çənə", "ru": "Верхняя челюсть", "price": 50, "description": {"az": "Üst çənənin ayrıca 3D müayinəsi.", "ru": "Отдельное 3D-исследование верхней челюсти."}, "image": "scope-upper.svg", "kind": "schematic"}, {"id": "lower", "group": "whole", "az": "Alt çənə", "ru": "Нижняя челюсть", "price": 50, "description": {"az": "Alt çənənin ayrıca 3D müayinəsi.", "ru": "Отдельное 3D-исследование нижней челюсти."}, "image": "scope-lower.svg", "kind": "schematic"}, {"id": "q11", "group": "partial", "az": "11 - 18", "ru": "11 - 18", "price": 30, "description": {"az": "Üst çənənin sağ seqmenti.", "ru": "Правый сегмент верхней челюсти."}, "image": "scope-q11.svg", "kind": "schematic"}, {"id": "q21", "group": "partial", "az": "21 - 28", "ru": "21 - 28", "price": 30, "description": {"az": "Üst çənənin sol seqmenti.", "ru": "Левый сегмент верхней челюсти."}, "image": "scope-q21.svg", "kind": "schematic"}, {"id": "q31", "group": "partial", "az": "31 - 38", "ru": "31 - 38", "price": 30, "description": {"az": "Alt çənənin sol seqmenti.", "ru": "Левый сегмент нижней челюсти."}, "image": "scope-q31.svg", "kind": "schematic"}, {"id": "q41", "group": "partial", "az": "41 - 48", "ru": "41 - 48", "price": 30, "description": {"az": "Alt çənənin sağ seqmenti.", "ru": "Правый сегмент нижней челюсти."}, "image": "scope-q41.svg", "kind": "schematic"}, {"id": "front-lower", "group": "partial", "az": "Frontal alt", "ru": "Фронтальный отдел снизу", "price": 30, "description": {"az": "Alt çənənin ön nahiyəsinin 3D müayinəsi.", "ru": "3D-исследование фронтального отдела нижней челюсти."}, "image": "scope-front-lower.svg", "kind": "schematic"}, {"id": "front-upper", "group": "partial", "az": "Frontal üst", "ru": "Фронтальный отдел сверху", "price": 30, "description": {"az": "Üst çənənin ön nahiyəsinin 3D müayinəsi.", "ru": "3D-исследование фронтального отдела верхней челюсти."}, "image": "scope-front-upper.svg", "kind": "schematic"}, {"id": "panoramic", "group": "2d", "az": "Ortopantomoqramma", "ru": "Ортопантомограмма", "price": 20, "description": {"az": "Rəqəmsal panoramik rentgen. Diskdə.", "ru": "Цифровой панорамный снимок. На диске."}, "image": "panoramic.jpg", "kind": "clinical"}, {"id": "ceph", "group": "2d", "az": "Sefalometrik", "ru": "Цефалометрия", "price": 20, "description": {"az": "Rəqəmsal sefalometrik çəkiliş. Diskdə.", "ru": "Цифровой цефалометрический снимок. На диске."}, "image": "ceph.jpg", "kind": "clinical"}, {"id": "tmj", "group": "2d", "az": "Gicgah-çənə oynaqları / TMJ", "ru": "ВНЧС / TMJ", "price": 20, "description": {"az": "Gicgah-çənə oynaqlarının rəqəmsal 2D çəkilişi. Diskdə.", "ru": "Цифровой 2D-снимок височно-нижнечелюстных суставов. На диске."}, "image": "tmj.jpg", "kind": "clinical"}];
  const settings=window.DIAQNOSTIKA_CONFIG||{};
  const form=document.getElementById('doctor-form');
  let formEnabled=false;
  try { const endpoint=new URL(settings.formEndpoint);formEnabled=endpoint.protocol==='https:'&&endpoint.hostname==='script.google.com'&&/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname); } catch {}
  form.hidden=!formEnabled;
  document.getElementById('application-contact').hidden=formEnabled;
  document.querySelectorAll('[data-application-form-copy]').forEach(el=>el.hidden=!formEnabled);
  document.querySelectorAll('[data-application-contact-copy]').forEach(el=>el.hidden=formEnabled);
  const status=document.getElementById('form-status');
  const sendButton=form.querySelector('[type=submit]');
  const state={lang:'az',service:0};
  let pending=null,timeout=null,lastPayload='',currentRequestId='';
  const messages={
    az:{sending:'Müraciət göndərilir…',success:'Müraciətiniz qəbul edildi. Əməkdaşlığı müzakirə etmək üçün sizinlə əlaqə saxlayacağıq.',failed:'Müraciəti göndərmək mümkün olmadı. Məlumatlarınız formada saxlanılıb. Yenidən cəhd edin və ya +994 50 833 73 32 nömrəsinə zəng edin.',phone:'Əlaqə nömrəsini ölkə kodu ilə daxil edin.',busy:'Bir qədər sonra yenidən cəhd edin.',schematic:'Nahiyə sxemi, öndən görünüş. R/L:  pasiyentin tərəfləri. Sərhədlər göndərişlə dəqiqləşdirilir.',clinical:'İstehsalçının illüstrativ 2D nümunəsi. Mənbə: ',ceph:'İstehsalçının işarələnmiş sefalometrik nümunəsi. Mənbə: '},
    ru:{sending:'Отправляем заявку…',success:'Заявка принята. Мы свяжемся с вами, чтобы обсудить сотрудничество.',failed:'Не удалось отправить заявку. Ваши данные остались в форме. Попробуйте ещё раз или позвоните по номеру +994 50 833 73 32.',phone:'Укажите номер для связи с кодом страны.',busy:'Попробуйте отправить заявку немного позже.',schematic:'Схема области, вид спереди. R/L:  стороны пациента. Границы уточняются по направлению.',clinical:'Иллюстративный 2D-пример производителя. Источник: ',ceph:'Цефалометрический пример производителя с разметкой. Источник: '}
  };
  function setStatus(key,kind=''){status.textContent=key?messages[state.lang][key]:'';status.dataset.key=key||'';status.dataset.state=kind;}
  function selectService(index){
    const item=services[index];if(!item)return;state.service=index;
    document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===item.group)));
    document.querySelectorAll('[data-options]').forEach(el=>el.hidden=el.dataset.options!==item.group);
    document.querySelectorAll('[data-service]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.service)===index)));
    document.querySelectorAll('[data-service-image]').forEach(im=>{const selected=Number(im.dataset.serviceImage)===index;im.classList.toggle('is-selected',selected);im.setAttribute('aria-hidden',String(!selected));if(selected){im.alt=item.description[state.lang];im.loading='eager';}});
    document.getElementById('service-price').textContent=item.price;
    document.getElementById('service-description').textContent=item.description[state.lang];
    const caption=document.getElementById('service-caption');caption.replaceChildren();
    if(item.kind==='schematic'){caption.textContent=messages[state.lang].schematic;}
    else {caption.append(document.createTextNode(messages[state.lang][item.id==='ceph'?'ceph':'clinical']));const a=document.createElement('a');a.textContent='Planmeca';a.href=item.id==='ceph'?'https://www.planmeca.com/dental-software/planmeca-romexis/cephalometric-analysis-software/':'https://www.planmeca.com/dental-imaging/panoramic-machines/planmeca-promax-2d/clinical-images/';a.target='_blank';a.rel='noopener';caption.append(a);}
  }
  function setLanguage(lang,updateUrl=true){
    if(!messages[lang])return;state.lang=lang;document.documentElement.lang=lang;
    document.title=lang==='az'?'3D Diaqnostika: stomatoloqlar üçün':'3D Diaqnostika: для стоматологов';
    document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    document.querySelectorAll('[data-placeholder-az]').forEach(el=>el.placeholder=el.dataset[lang==='az'?'placeholderAz':'placeholderRu']);
    document.querySelectorAll('[data-option-az]').forEach(el=>el.textContent=el.dataset[lang==='az'?'optionAz':'optionRu']);
    form.elements.lang.value=lang;selectService(state.service);
    document.querySelector('.route-map svg').setAttribute('aria-label',lang==='az'?'28 May metrosundan Sahib Zeynalov 26 ünvanına piyada marşrutun sxemi':'Схема пешего маршрута от метро 28 May к адресу Sahib Zeynalov, 26');
    if(status.dataset.key)setStatus(status.dataset.key,status.dataset.state);
    if(updateUrl){try{const url=new URL(location.href);if(lang==='ru')url.searchParams.set('lang','ru');else url.searchParams.delete('lang');history.replaceState(null,'',url);}catch{}}
  }
  document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>selectService(Number(b.dataset.service))));
  document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{if(services[state.service].group!==b.dataset.group)selectService(services.findIndex(s=>s.group===b.dataset.group));}));
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
  const colourPreference=matchMedia('(prefers-color-scheme: dark)');
  let themeOverride=null;try{themeOverride=localStorage.getItem('3d-diaqnostika-theme');}catch{}
  function theme(){document.documentElement.dataset.theme=themeOverride||(colourPreference.matches?'dark':'light');document.querySelector('meta[name=theme-color]').content=document.documentElement.dataset.theme==='dark'?'#101e24':'#f7fbfb';}
  document.querySelector('.theme-button').addEventListener('click',()=>{themeOverride=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('3d-diaqnostika-theme',themeOverride);}catch{}theme();});colourPreference.addEventListener('change',theme);theme();
  form.elements.startedAt.value=String(Date.now());
  form.elements.origin.value=location.origin;
  form.elements.phone.addEventListener('input',()=>form.elements.phone.setCustomValidity(''));
  form.addEventListener('submit',event=>{
    event.preventDefault();if(pending)return;
    const digits=form.elements.phone.value.replace(/\D/g,'');
    if(digits.length<7||digits.length>15){form.elements.phone.setCustomValidity(messages[state.lang].phone);form.elements.phone.reportValidity();return;}
    if(!form.reportValidity())return;
    let endpoint;try{endpoint=new URL(settings.formEndpoint);if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!endpoint.pathname.includes('/macros/s/')||!endpoint.pathname.endsWith('/exec'))throw Error('endpoint');}catch{setStatus('failed','error');return;}
    const payload=JSON.stringify([form.elements.doctorName.value.trim(),form.elements.clinic.value.trim(),form.elements.phone.value.trim(),form.elements.specialty.value,form.elements.comment.value.trim()]);
    if(!currentRequestId||lastPayload!==payload){currentRequestId=crypto.randomUUID();lastPayload=payload;}
    form.elements.requestId.value=currentRequestId;
    form.elements.origin.value=location.origin;form.action=endpoint.href;
    pending=currentRequestId;sendButton.disabled=true;form.setAttribute('aria-busy','true');setStatus('sending','pending');
    timeout=setTimeout(()=>finish(false),30000);
    HTMLFormElement.prototype.submit.call(form);
  });
  function finish(ok,code){
    clearTimeout(timeout);timeout=null;pending=null;sendButton.disabled=false;form.removeAttribute('aria-busy');
    if(ok){form.reset();currentRequestId='';lastPayload='';form.elements.lang.value=state.lang;form.elements.startedAt.value=String(Date.now());setStatus('success','success');}
    else setStatus(code==='rate_limit'?'busy':'failed','error');
  }
  addEventListener('message',event=>{
    let origin;try{origin=new URL(event.origin);}catch{return;}
    const google=origin.protocol==='https:'&&(origin.hostname==='script.google.com'||origin.hostname==='script.googleusercontent.com'||origin.hostname.endsWith('.script.googleusercontent.com'));
    const data=event.data;
    if(!google||!pending||data?.type!=='3d-diaqnostika-submission'||data.requestId!==pending)return;
    finish(data.ok===true&&data.stored===true,data.code);
  });
  const requestedLanguage=new URLSearchParams(location.search).get('lang');setLanguage(requestedLanguage==='ru'?'ru':'az',false);
})();
