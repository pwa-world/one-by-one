import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
function worker({network=true,failInstall=false}={}) {
  const listeners={},entries=new Map(),stores=new Map([['other-app-cache',new Map()],['cloudpost-shell-old',new Map()]]);
  const calls={network:0,claimed:0,skipped:0,cacheModes:[]};
  const base='https://example.test/game/';
  const caches={
    open:async name=>{stores.set(name,entries);return {addAll:async assets=>{if(failInstall)throw new Error('network interrupted');for(const a of assets){calls.cacheModes.push(a.cache);const url=new URL(a.url||a,base);entries.set(url.href,`cached:${url.pathname.replace('/game/','./')}`);}}};},
    keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),
    match:async request=>{const url=typeof request==='string'?request:request.url;return entries.get(url);}
  };
  const self={location:{origin:'https://example.test'},registration:{scope:base},clients:{claim:async()=>{calls.claimed++;}},skipWaiting:async()=>{calls.skipped++;},addEventListener:(name,fn)=>listeners[name]=fn};
  class Request {constructor(input,options){this.url=new URL(input,base).href;this.cache=options?.cache;}}
  vm.runInNewContext(code,{self,caches,URL,Request,fetch:async()=>{calls.network++;if(!network)throw new Error('offline');return 'network';}});
  const lifecycle=name=>{let promise;listeners[name]({waitUntil:p=>promise=p});return promise;};
  const request=(url,mode='cors',method='GET')=>{let response;listeners.fetch({request:{url,mode,method},respondWith:p=>response=p});return response;};
  return {calls,entries,stores,lifecycle,request,message:event=>listeners.message(event)};
}
test('install pre-caches full shell, then activation cleans only this games old caches',async()=>{
  const w=worker();await w.lifecycle('install');assert.equal(w.entries.size,14);assert.equal(w.calls.skipped,1);
  await w.lifecycle('activate');assert.equal(w.calls.claimed,1);assert.ok(w.stores.has('other-app-cache'));assert.ok(!w.stores.has('cloudpost-shell-old'));
});
test('installed navigation and all resources load without any network, including subpath deployment',async()=>{
  const w=worker({network:false});await w.lifecycle('install');
  assert.equal(await w.request('https://example.test/game/','navigate'),'cached:./index.html');
  for(const url of w.entries.keys())assert.match(await w.request(url),/^cached:/);
  assert.equal(w.calls.network,0);
});
test('worker never intercepts other origins or mutations',async()=>{
  const w=worker();await w.lifecycle('install');
  assert.equal(w.request('https://elsewhere.test/foo'),undefined);assert.equal(w.request('https://example.test/game/save','cors','POST'),undefined);
});
test('incomplete shell install fails instead of declaring offline readiness',async()=>{
  const w=worker({failInstall:true});await assert.rejects(w.lifecycle('install'));assert.equal(w.calls.skipped,0);
});
test('a new offline shell bypasses stale HTTP cache for every asset',async()=>{
  const w=worker();await w.lifecycle('install');assert.equal(w.calls.cacheModes.length,14);assert.ok(w.calls.cacheModes.every(mode=>mode==='reload'));
});
test('every static module dependency is pre-cached, including item illustrations',async()=>{
  const w=worker();await w.lifecycle('install');
  for(const url of w.entries.keys()){
    if(!url.endsWith('.js'))continue;
    const local=new URL('../dist/'+new URL(url).pathname.slice('/game/'.length),import.meta.url);
    const script=await readFile(local,'utf8');
    for(const [,dependency] of script.matchAll(/\bfrom\s*['"](\.\/[^'"]+)['"]/g)){
      assert.ok(w.entries.has(new URL(dependency,url).href),`${dependency} imported by ${url} must work offline`);
    }
  }
});


test('active worker reports the same shell version as shipped HTML',async()=>{
  const w=worker();await w.lifecycle('install');await w.lifecycle('activate');
  let reply;w.message({data:{type:'GET_SHELL_VERSION'},ports:[{postMessage:data=>reply=data}]});
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.equal(reply.type,'SHELL_VERSION');
  assert.equal(reply.version,html.match(/name="shell-version" content="([^"]+)"/)[1]);
  reply=null;w.message({data:{type:'unrelated'},ports:[{postMessage:data=>reply=data}]});
  assert.equal(reply,null);
  assert.doesNotThrow(()=>w.message({data:{type:'GET_SHELL_VERSION'}}));
});
