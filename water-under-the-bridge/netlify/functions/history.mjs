import {json,get,base} from './shared.mjs';
export const handler=async(event)=>{const id=event.queryStringParameters?.id||'';if(!/^[0-9a-f-]{36}$/i.test(id))return json({error:'Invalid station'},400);try{const d=await get(`${base}/stations/${id}/W/measurements.json?start=P30D`);return json(d,200,1800)}catch{return json({error:'History unavailable'},502)}};
