(() => {
  'use strict';
  const point=[40.3839366,49.846628];
  const webLink='https://www.google.com/maps?q='+point.join(',');
  const address='3D Diaqnostika, Sahib Zeynalov 26, Bakı';
  const mapNode=document.getElementById('location-map');
  const open=document.getElementById('open-maps');
  const share=document.getElementById('share-location');
  const shareStatus=document.getElementById('map-share-status');
  const android=/Android/i.test(navigator.userAgent);
  const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(android){open.href='geo:'+point.join(',')+'?q='+point.join(',')+'('+encodeURIComponent(address)+')';open.removeAttribute('target');}
  else if(ios){open.href='maps://?ll='+point.join(',')+'&q='+encodeURIComponent(address);open.removeAttribute('target');}
  else open.href=webLink;
  share.addEventListener('click',async()=>{
    try{
      if(navigator.share){await navigator.share({title:'3D Diaqnostika',text:address,url:webLink});}
      else if(navigator.clipboard){await navigator.clipboard.writeText(webLink);shareStatus.textContent=document.documentElement.lang==='ru'?'Ссылка на точку скопирована.':'Məkanın keçidi kopyalandı.';}
      else{shareStatus.replaceChildren();const link=document.createElement('a');link.href=webLink;link.textContent=webLink;shareStatus.append(link);}
    }catch(error){if(error.name!=='AbortError')shareStatus.textContent=document.documentElement.lang==='ru'?'Точку можно открыть кнопкой «Открыть в картах».':'Məkanı «Xəritədə aç» düyməsi ilə aça bilərsiniz.';}
  });
  function initialize(){
    if(!window.L)return;
    const coarse=matchMedia('(pointer:coarse)').matches;
    const map=L.map(mapNode,{scrollWheelZoom:false,dragging:!coarse,touchZoom:!coarse,zoomControl:true}).setView(point,17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    const icon=L.divIcon({className:'clinic-map-marker',html:'<span class="map-pin"><b>3D</b></span>',iconSize:[48,56],iconAnchor:[24,48]});
    L.marker(point,{icon,title:'3D Diaqnostika',alt:'3D Diaqnostika'}).addTo(map).bindPopup('<strong>3D Diaqnostika</strong><br>Sahib Zeynalov 26');
    map.on('load',()=>document.getElementById('map-placeholder').hidden=true);
    map.whenReady(()=>{document.getElementById('map-placeholder').hidden=true;map.invalidateSize();});
    new ResizeObserver(()=>map.invalidateSize()).observe(mapNode);
  }
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();initialize();}},{rootMargin:'300px'});observer.observe(mapNode);}
  else initialize();
})();
