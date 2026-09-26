import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {createBridge,ServiceError} from '../src/bridge.mjs';
import {createAosaiqunxingServer} from '../src/server.mjs';

const apiKey='osqx_'+'a'.repeat(64);
const tools=[{name:'describe_data',description:'数据覆盖',inputSchema:{type:'object',properties:{},additionalProperties:false}}];
const calls=[];
const mockFetch=async(url,options)=>{
  const body=JSON.parse(options.body);calls.push({url:String(url),authorization:options.headers.Authorization,body});
  if(body.method==='tools/list')return Response.json({jsonrpc:'2.0',id:body.id,result:{tools}});
  return Response.json({jsonrpc:'2.0',id:body.id,result:{content:[{type:'text',text:'已查询'}],structuredContent:{rows:[{count:2}]},isError:false}});
};

test('rejects absent credentials and unsafe service origins',()=>{
  assert.throws(()=>createBridge({apiKey:''}),/AOSAIQUNXING_API_KEY/);
  assert.throws(()=>createBridge({apiKey,baseUrl:'http://example.com'}),/HTTPS/);
  assert.throws(()=>createBridge({apiKey,baseUrl:'https://example.com/private'}),/根地址/);
});

test('stdio MCP forwards tools/list and tools/call to the authenticated remote MCP',async()=>{
  calls.length=0;
  const server=createAosaiqunxingServer({apiKey,fetchImpl:mockFetch});
  const client=new Client({name:'test-client',version:'1.0.0'});
  const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
  try{
    await server.connect(serverTransport);await client.connect(clientTransport);
    assert.deepEqual((await client.listTools()).tools,tools);
    const result=await client.callTool({name:'describe_data',arguments:{}});
    assert.equal(result.isError,false);assert.equal(result.structuredContent.rows[0].count,2);
    assert.deepEqual(calls.map(x=>x.body.method),['tools/list','tools/call']);
    assert(calls.every(x=>x.url==='https://aosaiqunxing.com/mcp'&&x.authorization==='Bearer '+apiKey));
  }finally{await client.close();await server.close();}
});

test('service failures are safe and do not leak credentials',async()=>{
  const bridge=createBridge({apiKey,fetchImpl:async()=>new Response('private diagnostic',{status:401})});
  await assert.rejects(bridge.listTools(),error=>error instanceof ServiceError&&error.status===401&&!error.message.includes(apiKey)&&!error.message.includes('private diagnostic'));
  const server=createAosaiqunxingServer({apiKey,fetchImpl:async(url,options)=>{const body=JSON.parse(options.body);return body.method==='tools/list'?Response.json({jsonrpc:'2.0',id:body.id,result:{tools}}):new Response('private diagnostic',{status:429});}});
  const client=new Client({name:'test-client',version:'1.0.0'});const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
  try{await server.connect(serverTransport);await client.connect(clientTransport);const result=await client.callTool({name:'describe_data',arguments:{}});assert.equal(result.isError,true);assert.match(result.content[0].text,/额度或频率/);assert(!JSON.stringify(result).includes(apiKey));}finally{await client.close();await server.close();}
});


