(() => {
const ids=['9601489','9476659','10645489','6711459','6541299','8976572'];
const ports={'North Sea':[52.48,4.56],Amsterdam:[52.40,4.90],Arnhem:[51.97,5.90],Düsseldorf:[51.23,6.77],Cologne:[50.94,6.97],Koblenz:[50.36,7.60],Kaub:[50.087,7.76],Mainz:[50.00,8.28],Mannheim:[49.49,8.46],Strasbourg:[48.58,7.80],Breisach:[48.03,7.57],Basel:[47.58,7.59],Cochem:[50.15,7.17],Bernkastel:[49.92,7.07],Trier:[49.76,6.63],Heidelberg:[49.41,8.69],Frankfurt:[50.10,8.68],Miltenberg:[49.70,9.25],Würzburg:[49.79,9.92],Bamberg:[49.90,10.88],Nuremberg:[49.40,11.05],Kelheim:[48.92,11.87],Regensburg:[49.02,12.10],Passau:[48.57,13.46],Linz:[48.31,14.29],Melk:[48.23,15.34],Vienna:[48.23,16.42],Bratislava:[48.14,17.12],Budapest:[47.50,19.05],Dunaújváros:[46.97,18.95],Baja:[46.18,18.96]};
const toggle=document.getElementById('vessel-toggle'),status=document.getElementById('vessel-status'),list=document.getElementById('vessel-list');
if(!toggle||!status||!list)return;
let rows=[],configured=false,busy=false,failed=false;
const rad=x=>x*Math.PI/180;
function distance(a,b){const d= Math.sin(rad(b[0]-a[0])/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(rad(b[1]-a[1])/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,d)));}
function locate(v){const age=(Date.now()-Date.parse(v.timestamp))/60000;if(!Number.isFinite(v.lat)||!Number.isFinite(v.lon)||Math.abs(v.lat)>90||Math.abs(v.lon)>180||!Number.isFinite(age)||age< -10||age>1440)return null;const p=Object.entries(ports).map(([name,coord])=>({name,km:distance([v.lat,v.lon],coord)})).sort((a,b)=>a.km-b.km)[0];return p.km<=75?{...p,age}:null;}
const url=id=>'https://www.marinetraffic.com/en/ais/details/ships/shipid:'+id;
const name=v=>v.name||'Vessel '+v.id;
const state=(v,p)=>!p?'Position unavailable or outside mapped area':p.age>30?'Delayed position':v.speed==null?'Movement unknown':v.speed>0.5?'Underway':'Stationary';
function link(id){const a=document.createElement('a');a.href=url(id);a.target='_blank';a.rel='noopener noreferrer';a.textContent='MarineTraffic ↗';return a;}
function details(v,p){const box=document.getElementById('detail');box.replaceChildren();const h=document.createElement('h3');h.textContent=name(v);const text=document.createElement('p');text.textContent='Nearest schematic point: '+p.name+' · '+Math.round(p.km)+' km from reference point. '+state(v,p)+' · '+(v.speed==null?'Speed unknown':v.speed.toFixed(1)+' kn')+' · Last reported '+new Date(v.timestamp).toLocaleString();box.append(h,text,link(v.id));box.focus();}
function svg(tag,attrs){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;}
window.renderVesselSymbols=(map,nodes,edges,river)=>{
 if(!toggle.checked)return;
 const count={};
 for(const v of rows){const p=locate(v);if(!p||!nodes[p.name])continue;if(river!=='All waterways'&&!edges.some(e=>e.river===river&&(e.a===p.name||e.b===p.name)))continue;
 const i=count[p.name]||0;count[p.name]=i+1;const [x,y]=nodes[p.name];const dx=-20-i*18,dy=-12;
 const color=p.age>30?'#a45b12':v.speed==null?'#65727d':'#173c58';
 const g=svg('g',{class:'schematic-vessel interactive',transform:'translate('+(x+dx)+' '+(y+dy)+')',tabindex:'0',role:'button','aria-label':name(v)+' near '+p.name+', '+state(v,p)});
 g.append(svg('path',{d:'M0 0 L'+(-dx)+' '+(-dy),stroke:color,'stroke-width':1.2,'stroke-dasharray':'2 2'}));
 const icon=svg('g',{});icon.append(svg('path',{d:'M0 -12 Q6 -7 6 -2 V10 Q0 14 -6 10 V-2 Q-6 -7 0 -12Z',fill:color,stroke:'white','stroke-width':1.3}));icon.append(svg('rect',{x:-3,y:-4,width:6,height:12,rx:1,fill:'white'}));icon.append(svg('path',{d:'M-2 0H2M-2 4H2',stroke:color,'stroke-width':1}));g.append(icon);
 const title=svg('title',{});title.textContent=name(v)+' · near '+p.name+' · '+state(v,p);g.append(title);
 g.addEventListener('click',()=>details(v,p));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();details(v,p);}});map.append(g);
 }
};
function redraw(){if(typeof renderMap==='function')renderMap();}
function render(){list.replaceChildren();let count=0;for(const id of ids){const v=rows.find(r=>r.id===id)||{id};const p=locate(v);if(p)count++;const li=document.createElement('li'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=name(v);span.textContent=p?'Near '+p.name+' · '+state(v,p)+' · '+new Date(v.timestamp).toLocaleString():v.reason||state(v,p);li.append(strong,span,link(id));list.append(li);}status.textContent=failed?'Vessel service unavailable.':!configured?'AIS feed not configured. Vessel profile links remain available.':count+' of 6 vessels located near schematic points (last 24 hours).';redraw();}
async function refresh(){if(busy)return;busy=true;try{const r=await fetch('/.netlify/functions/vessels',{cache:'no-cache'});if(!r.ok)throw Error();const data=await r.json();configured=data.configured===true;rows=Array.isArray(data.vessels)?data.vessels:[];failed=false;}catch{rows=[];failed=true;}finally{busy=false;render();}}
toggle.addEventListener('change',redraw);document.getElementById('refresh')?.addEventListener('click',refresh);refresh();setInterval(()=>{if(!document.hidden)refresh();},300000);
})();