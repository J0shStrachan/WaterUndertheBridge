export const json=(data,status=200,ttl=300)=>({statusCode:status,headers:{'Content-Type':'application/json','Cache-Control':status===200?`public, max-age=${ttl}, s-maxage=${ttl}`:'no-store'},body:JSON.stringify(data)});
export async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'WaterUnderTheBridge/1.0 public river dashboard'}});if(!r.ok)throw Error('Upstream '+r.status);return r.json()}
export const base='https://www.pegelonline.wsv.de/webservices/rest-api/v2';
