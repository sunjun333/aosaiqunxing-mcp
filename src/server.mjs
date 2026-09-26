import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {CallToolRequestSchema,ListToolsRequestSchema} from '@modelcontextprotocol/sdk/types.js';
import {createBridge,ServiceError} from './bridge.mjs';

export function createAosaiqunxingServer(options){
  const bridge=createBridge(options);
  const server=new Server({name:'aosaiqunxing',version:'0.1.0'},{capabilities:{tools:{listChanged:false}}});
  server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:await bridge.listTools()}));
  server.setRequestHandler(CallToolRequestSchema,async request=>{
    try{
      const remote=await bridge.callTool(request.params.name,request.params.arguments||{});
      if(remote?.content)return remote;
      return {content:[{type:'text',text:JSON.stringify(remote)}],structuredContent:remote,isError:false};
    }catch(error){
      const message=error instanceof ServiceError?error.message:'查询暂时失败，请稍后重试';
      return {content:[{type:'text',text:message}],isError:true};
    }
  });
  return server;
}


