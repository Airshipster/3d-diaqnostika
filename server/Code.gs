/* 3D Diaqnostika: doctor applications and private Telegram notifications.
   Credentials, allowed admin IDs, subscriptions and sheet ID live in Script Properties.
   No tokens or personal Telegram IDs belong in this source repository. */
var LEAD_HEADERS=['Created at (Baku)','Request ID','Doctor','Clinic','Phone','Specialty','Comment','Language','Status','Delivered chats','Last notification error','Origin'];
function props_(){return PropertiesService.getScriptProperties();}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function text_(value){return HtmlService.createHtmlOutput(value);}
function safeEqual_(a,b){a=String(a||'');b=String(b||'');var diff=a.length^b.length;for(var i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
function doGet(e){return json_({service:'3d-diaqnostika-doctor-applications',ready:!!props_().getProperty('SPREADSHEET_ID'),telegramConfigured:!!props_().getProperty('BOT_TOKEN')});}
function doPost(e){
  e=e||{};var p=e.parameter||{};
  if(p.route==='setup'&&typeof bootstrapSetup_==='function')return bootstrapSetup_(e);
  if(p.route==='telegram'){
    if(!safeEqual_(p.hook,props_().getProperty('WEBHOOK_SECRET')))return text_('OK');
    try{processTelegramUpdate_(JSON.parse(e.postData.contents||'{}'));}catch(error){console.error('Telegram update processing failed');}
    return text_('OK');
  }
  return acceptApplication_(p);
}
function clean_(value,max){return String(value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim().slice(0,max);}
function sheetText_(value){var text=String(value||'');return /^[\s]*[=+@-]/.test(text)?"'"+text:text;}
function allowedOrigin_(origin){var allowed=JSON.parse(props_().getProperty('ALLOWED_ORIGINS')||'[]');return allowed.indexOf(origin)!==-1;}
function reply_(p,result){
  if(!allowedOrigin_(p.origin))return text_('This form origin is not configured.');
  var message={type:'3d-diaqnostika-submission',requestId:String(p.requestId||''),ok:!!result.ok,stored:!!result.stored,code:result.code||''};
  var js=JSON.stringify(message).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>window.top.postMessage('+js+','+JSON.stringify(p.origin)+');<\/script>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function leads_(){
  var id=props_().getProperty('SPREADSHEET_ID');if(!id)throw Error('not_configured');
  var ss=SpreadsheetApp.openById(id),sheet=ss.getSheetByName('Doctor applications');
  if(!sheet){sheet=ss.getSheets()[0];sheet.setName('Doctor applications');}
  if(sheet.getLastRow()===0){sheet.getRange(1,1,1,LEAD_HEADERS.length).setValues([LEAD_HEADERS]).setFontWeight('bold').setBackground('#e0f1f2');sheet.setFrozenRows(1);sheet.setColumnWidths(1,LEAD_HEADERS.length,155);sheet.setColumnWidth(7,320);}
  return sheet;
}
function acceptApplication_(p){
  if(!allowedOrigin_(p.origin))return reply_(p,{code:'origin'});
  var id=clean_(p.requestId,60),name=clean_(p.doctorName,100),clinic=clean_(p.clinic,120),phone=clean_(p.phone,28),comment=clean_(p.comment,1000),specialty=clean_(p.specialty,30);
  var validId=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  var digits=phone.replace(/\D/g,''),age=Date.now()-Number(p.startedAt||0);
  if(!validId||name.length<2||clinic.length<2||digits.length<7||digits.length>15||p.consent!=='yes'||p.website||!Number.isFinite(age)||age<1000)return reply_(p,{code:'validation'});
  if(['','general','implantology','orthodontics','endodontics','other'].indexOf(specialty)<0)specialty='other';
  var lock=LockService.getScriptLock();if(!lock.tryLock(10000))return reply_(p,{code:'busy'});
  var row;
  try{
    var sheet=leads_(),last=sheet.getLastRow();
    var existing=last>1?sheet.getRange(2,2,last-1,1).createTextFinder(id).matchEntireCell(true).findNext():null;
    if(existing)return reply_(p,{ok:true,stored:true});
    var cache=CacheService.getScriptCache(),key='phone:'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,digits)).slice(0,40);
    if(cache.get(key))return reply_(p,{code:'rate_limit'});
    row=last+1;
    var values=[Utilities.formatDate(new Date(),'Asia/Baku','yyyy-MM-dd HH:mm:ss'),id,name,clinic,phone,specialty,comment,p.lang==='ru'?'ru':'az','pending','[]','',p.origin].map(sheetText_);
    sheet.getRange(row,1,1,values.length).setNumberFormat('@').setValues([values]);
    SpreadsheetApp.flush();cache.put(key,'1',90);
  }catch(error){console.error('Lead storage failed');return reply_(p,{code:'storage'});}
  finally{lock.releaseLock();}
  var notificationLock=LockService.getScriptLock();
  if(notificationLock.tryLock(1000)){try{notifyLead_(row);}catch(error){console.error('Notification deferred; application already stored');}finally{notificationLock.releaseLock();}}
  return reply_(p,{ok:true,stored:true});
}
function recipients_(){return JSON.parse(props_().getProperty('RECIPIENTS')||'{}');}
function telegram_(method,payload){
  var token=props_().getProperty('BOT_TOKEN');if(!token)throw Error('bot_not_configured');
  var response;
  try{response=UrlFetchApp.fetch('https://api.telegram.org/bot'+token+'/'+method,{method:'post',contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true});}
  catch(error){throw Error('telegram_network');}
  var body;try{body=JSON.parse(response.getContentText());}catch(e){throw Error('telegram_response');}
  if(response.getResponseCode()!==200||!body.ok)throw Error('telegram_'+(body.error_code||response.getResponseCode()));
  return body.result;
}
function notifyLead_(row){
  var sheet=leads_(),record=sheet.getRange(row,1,1,LEAD_HEADERS.length).getDisplayValues()[0];
  if(!record[1])return;
  var recipients=recipients_(),keys=Object.keys(recipients).filter(function(k){return recipients[k].enabled;});
  if(!keys.length){sheet.getRange(row,9).setValue('waiting_for_start');return;}
  var sent;try{sent=JSON.parse(record[9]||'[]');}catch(e){sent=[];}
  var text='3D Diaqnostika — новая заявка врача\n\nИмя: '+record[2]+'\nКлиника: '+record[3]+'\nТелефон: '+record[4]+(record[5]?'\nСпециализация: '+record[5]:'')+(record[6]?'\nКомментарий: '+record[6]:'')+'\nЯзык: '+record[7].toUpperCase()+'\nВремя: '+record[0]+' (Баку)';
  var errors=[];
  keys.forEach(function(key){
    if(sent.indexOf(key)!==-1)return;
    var recipient=recipients[key],payload={chat_id:recipient.chatId,text:text,disable_web_page_preview:true};if(recipient.threadId)payload.message_thread_id=recipient.threadId;
    try{telegram_('sendMessage',payload);sent.push(key);sheet.getRange(row,10).setNumberFormat('@').setValue(JSON.stringify(sent));}
    catch(error){errors.push(String(error.message).replace(/[^a-zA-Z_0-9]/g,'').slice(0,80));}
  });
  sheet.getRange(row,9).setValue(keys.every(function(k){return sent.indexOf(k)!==-1;})?'notified':'pending');
  sheet.getRange(row,11).setValue(errors.join(', '));
}
function retryNotifications(){
  var lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  try{var sheet=leads_(),last=sheet.getLastRow();if(last<2)return;var first=Math.max(2,last-499),rows=sheet.getRange(first,1,last-first+1,LEAD_HEADERS.length).getDisplayValues(),count=0;for(var i=0;i<rows.length&&count<20;i++){if(rows[i][8]==='pending'||rows[i][8]==='waiting_for_start'){notifyLead_(first+i);count++;}}}finally{lock.releaseLock();}
}
function processTelegramUpdate_(update){
  var message=update.message;if(!message||!message.from||!message.chat)return;
  var admins=JSON.parse(props_().getProperty('ADMIN_USER_IDS')||'[]').map(String);
  if(admins.indexOf(String(message.from.id))===-1)return;
  var command=String(message.text||'').trim().split(/\s/)[0].split('@')[0].toLowerCase();
  if(['/start','/stop','/status','/help'].indexOf(command)===-1)return;
  var cache=CacheService.getScriptCache(),updateKey='tg:'+update.update_id;if(cache.get(updateKey))return;
  var lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw Error('subscription_busy');
  var recipients,chatId=String(message.chat.id),thread=message.message_thread_id||null,key=chatId+(thread?':'+thread:'');
  try{
    recipients=recipients_();
    if(command==='/start'){recipients[key]={chatId:chatId,threadId:thread,enabled:true,subscribedBy:String(message.from.id),kind:message.chat.type,subscribedAt:new Date().toISOString()};props_().setProperty('RECIPIENTS',JSON.stringify(recipients));}
    if(command==='/stop'&&recipients[key]){recipients[key].enabled=false;props_().setProperty('RECIPIENTS',JSON.stringify(recipients));}
    cache.put(updateKey,'1',21600);
  }finally{lock.releaseLock();}
  var response=command==='/start'?'Готово. Заявки врачей 3D Diaqnostika будут приходить в этот чат. /stop — отключить.':command==='/stop'?'Уведомления в этом чате отключены. /start — включить снова.':command==='/status'?'Уведомления в этом чате: '+(recipients[key]&&recipients[key].enabled?'включены.':'выключены.'):'/start — получать заявки в этом чате\n/stop — отключить\n/status — статус текущего чата';
  var payload={chat_id:chatId,text:response};if(thread)payload.message_thread_id=thread;telegram_('sendMessage',payload);
}
function authorizeProject(){
  SpreadsheetApp.getActiveSpreadsheet();
  UrlFetchApp.fetch('https://core.telegram.org/bots/api',{muteHttpExceptions:true});
  ScriptApp.getProjectTriggers();
  return 'Authorization completed. Configure the isolated integration next.';
}
function installRetryTrigger_(){
  var existing=ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='retryNotifications';});
  if(!existing)ScriptApp.newTrigger('retryNotifications').timeBased().everyMinutes(5).create();
}
