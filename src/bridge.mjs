const DEFAULT_BASE_URL='https://aosaiqunxing.com';
const API_KEY_PATTERN=/^osqx_[a-f0-9]{64}$/;

export class ServiceError extends Error {
  constructor(status,message){super(message);this.name='ServiceError';this.status=status;}
}

export function createBridge({apiKey,baseUrl=DEFAULT_BASE_URL,fetchImpl=fetch,timeoutMs=20000}={}){
  if(!API_KEY_PATTERN.test(apiKey||''))throw new Error('请先设置有效的 AOSAIQUNXING_API_KEY');
  const origin=new URL(baseUrl);
  if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)
    throw new Error('AOSAIQUNXING_BASE_URL 须为 HTTPS 服务根地址');
  let id=0;
  async function rpc(method,params){
    let response;
    try{
      response=await fetchImpl(new URL('/mcp',origin),{
        method:'POST',
        headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({jsonrpc:'2.0',id:++id,method,...(params===undefined?{}:{params})}),
        redirect:'error',
        signal:AbortSignal.timeout(timeoutMs)
      });
    }catch{throw new ServiceError(503,'暂时无法连接奥赛群星数据服务');}
    if(!response.ok){
      const message=response.status===401?'API Key 无效或已失效，请在奥赛群星闪耀时重新复制连接信息':response.status===429?'调用额度或频率已达上限，请稍后再试':'奥赛群星数据服务暂时无法完成请求';
      throw new ServiceError(response.status,message);
    }
    let data;try{data=await response.json();}catch{throw new ServiceError(502,'奥赛群星数据服务返回了无效内容');}
    if(data?.error)throw new ServiceError(502,data.error.message||'远程 MCP 调用失败');
    if(!data||!('result' in data))throw new ServiceError(502,'远程 MCP 响应格式无效');
    return data.result;
  }
  return {
    async listTools(){const result=await rpc('tools/list',{});if(!Array.isArray(result?.tools))throw new ServiceError(502,'工具目录格式无效');return result.tools;},
    async callTool(name,args={}){if(typeof name!=='string'||!name||args===null||typeof args!=='object'||Array.isArray(args))throw new ServiceError(400,'工具调用参数无效');return rpc('tools/call',{name,arguments:args});}
  };
}


