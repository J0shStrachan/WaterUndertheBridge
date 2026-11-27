(() => {
const ids=['9601489','9476659','10645489','6711459','6541299','8976572'];
const el=document.getElementById('vessel-map'),toggle=document.getElementById('vessel-toggle'),status=document.getElementById('vessel-status'),list=document.getElementById('vessel-list');
if(!el||!toggle||!status||!list)return;
let map,layer,busy=false,first=true;
const link=id=>{const a=document.createElement('a');a.href='https://www.marinetraffic.com/en/ais/details/ships/shipid:'+id;a.target='_blank';a.rel='noopener noreferrer';a.textContent='MarineTraffic ↗';return a};
function init(){if(map||!window.L)return;map=L.map(el,{scrollWheelZoom:false}).setView([50,11],5);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);layer=L.layerGroup().addTo(map);}
function render(data){
  list.replaceChildren();if(layer)layer.clearLayers();const bounds=[];
  const rows=Array.isArray(data.vessels)?data.vessels:[];
  for(const id of ids){
    const v=rows.find(r=>r.id===id)||{id,reason:'Position unavailable'};
    const li=document.createElement('li'),name=document.createElement('strong'),description=document.createElement('span');
    name.textContent=v.name||'Vessel '+id;
    const age=(Date.now()-Date.parse(v.timestamp))/60000;
    const valid=Number.isFinite(v.lat)&&Number.isFinite(v.lon)&&Math.abs(v.lat)<=90&&Math.abs(v.lon)<=180&&Number.isFinite(age)&&age>=-10&&age<=1440;
    const state=!valid?'Position unavailable':age>30?'Delayed position':v.speed===null?'Movement unknown':v.speed>0.5?'Underway':'Stationary';
    description.textContent=valid?state+' · '+(v.speed===null?'Speed unknown':v.speed.toFixed(1)+' kn')+' · '+new Date(v.timestamp).toLocaleString():(v.reason||state);
    li.append(name,description,link(id));list.append(li);
    if(!valid||!layer)continue;
    const color=age>30?'#a45b12':v.speed===null?'#65727d':v.speed>0.5?'#17643c':'#176a86';
    const angle=Number.isFinite(v.heading)&&v.heading>=0&&v.heading<360?v.heading:0;
    const icon=L.divIcon({className:'river-vessel-icon',iconSize:[24,42],iconAnchor:[12,21],html:'<svg viewBox="0 0 24 42" style="transform:rotate('+angle+'deg)" aria-hidden="true"><path d="M12 1 Q22 10 22 19 V36 Q12 43 2 36 V19 Q2 10 12 1Z" fill="'+color+'" stroke="white" stroke-width="2"/><rect x="6" y="14" width="12" height="20" rx="2" fill="white"/><path d="M8 19H16M8 24H16M8 29H16" stroke="'+color+'" stroke-width="2"/></svg>'});
    const popup=document.createElement('div');const title=document.createElement('strong');title.textContent=name.textContent;const p=document.createElement('p');p.textContent=description.textContent;popup.append(title,p,link(id));
    L.marker([v.lat,v.lon],{icon,title:name.textContent+' · '+state,alt:name.textContent+' · '+state}).bindPopup(popup).addTo(layer);bounds.push([v.lat,v.lon]);
  }
  if(map&&bounds.length&&first){map.fitBounds(bounds,{padding:[35,35],maxZoom:10});first=false;}
  status.textContent=!data.configured?'Live AIS feed not configured. All six vessel profiles are available below.':bounds.length+' of 6 vessels with usable positions (last 24 hours).'+(!map?' Geographic map unavailable.':'');
}
async function refresh(){if(busy)return;busy=true;try{const r=await fetch('/.netlify/functions/vessels',{cache:'no-cache'});if(!r.ok)throw Error();render(await r.json());}catch{render({configured:false,vessels:ids.map(id=>({id,reason:'Vessel service unavailable'}))});status.textContent='Vessel service unavailable. Profile links remain available.';}finally{busy=false;}}
toggle.addEventListener('change',()=>{el.hidden=!toggle.checked;if(toggle.checked){init();map?.invalidateSize();refresh();}});
init();refresh();document.getElementById('refresh')?.addEventListener('click',refresh);setInterval(()=>{if(!document.hidden&&toggle.checked)refresh();},300000);
})();