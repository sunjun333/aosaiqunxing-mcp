#!/usr/bin/env node
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {createAosaiqunxingServer} from '../src/server.mjs';

try {
  const server=createAosaiqunxingServer({
    apiKey:process.env.AOSAIQUNXING_API_KEY,
    baseUrl:process.env.AOSAIQUNXING_BASE_URL||'https://aosaiqunxing.com'
  });
  await server.connect(new StdioServerTransport());
} catch (error) {
  console.error(`奥赛群星 MCP 启动失败：${error.message}`);
  process.exitCode=1;
}


