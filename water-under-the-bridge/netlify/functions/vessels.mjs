const ids = ['9601489','9476659','10645489','6711459','6541299','8976572'];
let cache, expires=0, pending;
const number = v => v == null || String(v).trim()==='' ? null : Number.isFinite(Number(v)) ? Number(v) : null;
const empty = (id, reason) => ({id,reason});
async function vessel(id,key){
  try {
    const url = 'https://services.marinetraffic.com/api/exportvessel/'+encodeURIComponent(key)+'/shipid:'+id+'/protocol:jsono/msgtype:extended';
    const res=await fetch(url,{signal:AbortSignal.timeout(8000)});
    if(!res.ok)return empty(id,'Provider unavailable');
    const data=await res.json();
    const rows=Array.isArray(data)?data:[data];
    const r=rows.find(x=>x && String(x.SHIP_ID)===id);
    if(!r)return empty(id,'No reported position');
    const lat=number(r.LAT), lon=number(r.LON);
    const raw=String(r.TIMESTAMP||'').replace(' ','T');
    const date=Date.parse(/Z$|[+-]\\d{2}:?\\d{2}$/.test(raw)?raw:raw+'Z');
    if(lat===null||lon===null||Math.abs(lat)>90||Math.abs(lon)>180||!Number.isFinite(date)||date>Date.now()+600000||(lat===0&&lon===0))return empty(id,'Invalid or missing position');
    const heading=number(r.HEADING),course=number(r.COURSE),speed=number(r.SPEED);
    return {id,name:typeof r.SHIPNAME==='string'?r.SHIPNAME:null,lat,lon,heading:heading!==null&&heading>=0&&heading<360?heading:course!==null&&course>=0&&course<360?course:null,speed:speed!==null&&speed>=0&&speed<1023?speed/10:null,timestamp:new Date(date).toISOString()};
  } catch {return empty(id,'Provider unavailable');}
}
export const handler=async event=>{
  if(event.httpMethod!=='GET')return {statusCode:405,body:'Method not allowed'};
  const key=process.env.MARINETRAFFIC_API_KEY;
  const enabled=Boolean(key)&&process.env.MARINETRAFFIC_PUBLIC_DISPLAY==='true';
  if(!enabled)return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({configured:false,vessels:ids.map(id=>empty(id,'AIS feed not configured'))})};
  if(!cache||Date.now()>=expires){
    if(!pending)pending=Promise.all(ids.map(id=>vessel(id,key))).then(vessels=>{cache={configured:true,vessels};expires=Date.now()+300000;return cache;}).finally(()=>{pending=null;});
    await pending;
  }
  return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=60, s-maxage=300'},body:JSON.stringify(cache)};
};