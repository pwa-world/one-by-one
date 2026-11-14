// Isolated manual browser-test origin. This server is never deployed to Pages.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/qa/art') {res.writeHead(200,{'Content-Type':types['.html'],'Cache-Control':'no-store'});return res.end(await readFile(path.join(here,'item-art-gallery.html')));}
    if(url.pathname==='/qa/') {res.writeHead(200,{'Content-Type':types['.html'],'Cache-Control':'no-store'});return res.end(await readFile(path.join(here,'browser-harness.html')));}
    if(!url.pathname.startsWith('/one-by-one/')){res.writeHead(404);return res.end();}
    const rel=decodeURIComponent(url.pathname.slice('/one-by-one/'.length))||'index.html',file=path.resolve(root,rel);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end();}
}).listen(4187,'127.0.0.1',()=>console.log('QA: http://localhost:4187/qa/ | Game: http://localhost:4187/one-by-one/'));
