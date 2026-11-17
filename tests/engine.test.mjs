import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as E from '../dist/engine.js';
import {CHAINS,GENERATORS,CHAPTERS,ACHIEVEMENTS} from '../dist/data.js';
const clear=s=>{s.board=s.board.map(i=>i?.g?i:null);s.storage=[];};
const put=(s,c,l)=>{const index=s.board.indexOf(null);assert.notEqual(index,-1);s.board[index]={c,l};E.discover(s,{c,l});return index;};
test('new game has all six anchored generators, known items and three achievable orders',()=>{
  const s=E.newGame(10);assert.equal(s.board.length,56);assert.equal(s.board.filter(i=>i?.g).length,6);
  assert.equal(s.orders.length,3);assert.equal(E.validateState(s),s);
  assert.equal(GENERATORS.filter(g=>E.unlocked(s,g)).length,2);
});
test('normal production can continue without clock or energy; full board does not consume RNG',()=>{
  const s=E.newGame(5);clear(s);
  for(let i=0;i<50;i++)assert.equal(E.spawn(s,'post').ok,true);
  const before=E.encodeSave(s);assert.equal(E.spawn(s,'post').ok,false);assert.equal(E.encodeSave(s),before);
  assert.equal(s.stats.produced,50);
});
test('locked generators are atomic and produce nothing',()=>{
  const s=E.newGame(5),before=E.encodeSave(s);assert.equal(E.spawn(s,'scope').ok,false);assert.equal(E.encodeSave(s),before);
});
test('merge conserves item value, frees one slot and stops at level seven',()=>{
  const s=E.newGame(4);clear(s);
  for(let l=1;l<7;l++) {
    clear(s);const a=put(s,'paper',l),b=put(s,'paper',l);assert.equal(E.move(s,a,b).kind,'merge');
    assert.equal(s.board[a],null);assert.deepEqual(s.board[b],{c:'paper',l:l+1});assert.equal(E.valueOf(s.board[b]),2*2**(l-1));
  }
  clear(s);const a=put(s,'paper',7),b=put(s,'paper',7),merges=s.stats.merges;
  assert.equal(E.move(s,a,b).kind,'swap');assert.equal(s.stats.merges,merges);
});
test('move swaps items but never moves or overwrites a generator',()=>{
  const s=E.newGame(2);clear(s);const a=put(s,'paper',2),b=put(s,'wax',1);
  assert.equal(E.move(s,a,b).kind,'swap');assert.equal(s.board[a].c,'wax');assert.equal(s.board[b].c,'paper');
  const before=E.encodeSave(s);assert.equal(E.move(s,a,0).ok,false);assert.equal(E.move(s,0,a).ok,false);assert.equal(E.encodeSave(s),before);
});
test('order requirements count duplicate items correctly across board and storage',()=>{
  const s=E.newGame(1);clear(s);put(s,'paper',3);
  assert.equal(E.locateRequirements(s,[['paper',3],['paper',3]]),null);
  s.storage.push({c:'paper',l:3});const locations=E.locateRequirements(s,[['paper',3],['paper',3]]);
  assert.equal(locations.length,2);E.consume(s,locations);assert.equal(s.storage.length,0);assert.equal(s.board.filter(i=>i?.c).length,0);
});
test('completion is atomic when missing items; every fifth delivery awards a gift once',()=>{
  const s=E.newGame(1);clear(s);const before=E.encodeSave(s);assert.equal(E.fulfill(s,0).ok,false);assert.equal(E.encodeSave(s),before);
  for(let i=1;i<=5;i++) {
    const order=s.orders[0];order.req.forEach(([c,l])=>put(s,c,l));const old=s.coins,result=E.fulfill(s,0);
    assert.equal(result.ok,true);assert.equal(s.coins-old,order.reward+(i===5?40:0));assert.equal(result.bonus,i===5?40:0);
  }
  assert.equal(s.parts,3);assert.equal(s.stats.orders,5);
});
test('storage capacity and full-board retrieval protect items',()=>{
  const s=E.newGame(2);clear(s);for(let i=0;i<8;i++){const p=put(s,'paper',1);assert.equal(E.storeItem(s,p).ok,true);}
  const p=put(s,'wood',1);assert.equal(E.storeItem(s,p).ok,false);assert.equal(s.board[p].c,'wood');
  while(s.board.includes(null))put(s,'paper',1);
  const before=E.encodeSave(s);assert.equal(E.retrieve(s,0).ok,false);assert.equal(E.encodeSave(s),before);
  s.coins=10000;while(s.capacity<32)assert.equal(E.expand(s).ok,true);assert.equal(E.expand(s).ok,false);
});
test('upgrades enforce costs and max level, recycling provides required parts',()=>{
  const s=E.newGame(3);clear(s);const p=put(s,'wood',5);assert.equal(E.recycle(s,p).amount,8);
  assert.equal(E.upgrade(s,'post').ok,false);s.coins=10000;s.parts=100;
  assert.equal(E.upgrade(s,'post').ok,true);assert.equal(s.gens.post,2);assert.equal(s.coins,9880);assert.equal(s.parts,94);
  E.upgrade(s,'post');E.upgrade(s,'post');assert.equal(E.upgrade(s,'post').ok,false);
});
test('all 18 construction stages are reachable with only unlocked chains, ending remains playable',()=>{
  const s=E.newGame(3);s.coins=100000;
  for(let i=0;i<18;i++) {
    clear(s);const p=E.currentProject(s),allowed=GENERATORS.filter(g=>E.unlocked(s,g)).flatMap(g=>g.chains);
    p.req.forEach(([c,l])=>{assert.ok(allowed.includes(c),`unreachable ${i} ${c}`);put(s,c,l);});
    assert.equal(E.build(s).ok,true);assert.equal(s.built,i+1);E.validateState(s);
    for(let slot=0;slot<3;slot++){E.reroll(s,slot);assert.ok(s.orders[slot].req.every(([c])=>GENERATORS.filter(g=>E.unlocked(s,g)).some(g=>g.chains.includes(c))));}
  }
  assert.equal(E.currentProject(s),null);assert.equal(E.build(s).ok,false);
  clear(s);s.orders[0].req.forEach(([c,l])=>put(s,c,l));assert.equal(E.fulfill(s,0).ok,true);
});
test('save round trip restores all state, future random production and undo snapshots',()=>{
  const s=E.newGame(123);for(let i=0;i<12;i++)E.spawn(s,'bench');
  const text=E.encodeSave(s),restored=E.decodeSave(text);assert.deepEqual(restored,s);
  E.spawn(s,'post');E.spawn(restored,'post');assert.deepEqual(restored,s);
  assert.notEqual(E.encodeSave(s),text);assert.equal(E.encodeSave(E.decodeSave(text)),text);
});
test('reject corrupt, oversized, future-version and invalid saves without mutating valid state',()=>{
  const s=E.newGame(9),before=E.encodeSave(s);
  assert.throws(()=>E.decodeSave('broken'));assert.throws(()=>E.decodeSave('x'.repeat(250001)));
  assert.throws(()=>E.decodeSave(before.replace('"coins":80','"coins":81')));
  for(const mutate of [x=>x.version=2,x=>x.coins=-1,x=>x.board[0]=null,x=>x.storage=Array(9).fill({c:'paper',l:1}),x=>x.orders[0].req=[['star',7]],x=>x.board[1]={c:'paper',l:100},x=>x.settings.sound='yes',x=>x.gens.post=100]) {
    const bad=E.clone(s);mutate(bad);assert.throws(()=>E.decodeSave(E.encodeSave(bad)));
  }
  assert.equal(E.encodeSave(s),before);
});
test('achievements award once, never ahead of their threshold',()=>{
  const s=E.newGame(1);assert.equal(E.claim(s,'first').ok,false);s.stats.orders=1;
  const old=s.coins;assert.equal(E.claim(s,'first').ok,true);assert.equal(s.coins,old+30);assert.equal(E.claim(s,'first').ok,false);
});
test('randomized long sessions preserve valid state and finite inventories',()=>{
  const s=E.newGame(891);s.built=15;s.coins=10000;
  for(let n=0;n<10000;n++) {
    const action=n%9;
    if(action<3)E.spawn(s,GENERATORS[n%6].id);
    else if(action===3){const a=n%56,b=(n*7+3)%56;E.move(s,a,b);}
    else if(action===4)E.recycle(s,(n*3)%56);
    else if(action===5)E.storeItem(s,(n*11)%56);
    else if(action===6)E.retrieve(s,0);
    else if(action===7)E.tidy(s);
    else E.fulfill(s,n%3);
    if(n%100===0)assert.doesNotThrow(()=>E.decodeSave(E.encodeSave(s)));
  }
});
test('every declared offline asset exists; manifest has suitable install icons',async()=>{
  const sw=await readFile(new URL('../dist/sw.js',import.meta.url),'utf8');
  const assets=sw.match(/const ASSETS = \[(.*?)\]/s)[1].match(/'([^']+)'/g).map(x=>x.slice(1,-1));
  for(const asset of assets)await readFile(new URL('../dist/'+(asset==='./'?'index.html':asset),import.meta.url));
  const manifest=JSON.parse(await readFile(new URL('../dist/manifest.webmanifest',import.meta.url),'utf8'));
  assert.equal(manifest.display,'standalone');assert.ok(manifest.icons.some(i=>i.sizes==='192x192'));assert.ok(manifest.icons.some(i=>i.sizes==='512x512'));
  assert.equal(Object.values(CHAINS).reduce((sum,c)=>sum+c.names.length,0),84);assert.equal(CHAPTERS.flatMap(c=>c.projects).length,18);
});


test('ready order hints use exact fulfillment allocation including storage and duplicates',()=>{
  const s=E.newGame(10);clear(s);
  const a=put(s,'paper',1),b=put(s,'paper',1),extra=put(s,'paper',1);
  s.orders=[{req:[['paper',1],['paper',1],['wood',2]]},{req:[['paper',1]]},{req:[['paper',2]]}];
  assert.deepEqual([...E.readyOrderItems(s)],[[a,[1]]]); // Partial orders and wrong levels do not qualify.
  s.storage=[{c:'wood',l:2}];
  const before=E.clone(s);
  assert.deepEqual([...E.readyOrderItems(s)],[[a,[0,1]],[b,[0]]]);
  assert.ok(!E.readyOrderItems(s).has(extra));
  assert.deepEqual(s,before); // Hints never consume or reserve items.
  E.consume(s,E.locateRequirements(s,s.orders[0].req));
  assert.deepEqual([...E.readyOrderItems(s)],[[extra,[1]]]);
  assert.deepEqual([...E.readyOrderItems(before)],[[a,[0,1]],[b,[0]]]);
});
test('ready order hints follow moves and omit storage-only requirements',()=>{
  const s=E.newGame(11);clear(s);const a=put(s,'paper',2),target=s.board.indexOf(null);
  s.orders=[{req:[['paper',2]]}];
  E.move(s,a,target);assert.deepEqual([...E.readyOrderItems(s)],[[target,[0]]]);
  E.storeItem(s,target);assert.equal(E.readyOrderItems(s).size,0);
  assert.ok(E.locateRequirements(s,s.orders[0].req));
});
