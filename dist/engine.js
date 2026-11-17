import { SIZE, VERSION, CHAINS, GENERATORS, CHAPTERS, CUSTOMERS, ACHIEVEMENTS, itemKey } from './data.js';
export const clone = value => structuredClone(value);
export const chapterOf = s => Math.min(5, Math.floor(s.built / 3));
export const unlocked = (s, g) => chapterOf(s) >= g.chapter;
export const currentProject = s => s.built < 18 ? CHAPTERS[chapterOf(s)].projects[s.built % 3] : null;
export const valueOf = i => 2 ** (i.l - 1);
export function random(s) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function discover(s, i) {
  if (i && i.c && !s.discovered.includes(itemKey(i))) s.discovered.push(itemKey(i));
  if (i?.l) s.stats.maxLevel = Math.max(s.stats.maxLevel, i.l);
}
export function createOrder(s, slot) {
  const gens = GENERATORS.filter(g => unlocked(s, g));
  const gen = gens[Math.floor(random(s) * gens.length)];
  const chapter = chapterOf(s);
  const level = slot === 0 ? 2 + Math.floor(random(s) * 2) : slot === 1 ? 3 + Math.floor(random(s) * (chapter > 1 ? 2 : 1)) : Math.min(6, 4 + Math.floor(chapter / 2));
  const req = [[gen.chains[random(s) > .68 ? 1 : 0], level]];
  if (slot === 1 || (slot === 2 && chapter > 0)) {
    const other = gens[Math.floor(random(s) * gens.length)];
    req.push([other.chains[0], Math.max(2, level - 1)]);
  }
  const customer = Math.min(5, Math.floor(random(s) * (chapter + 2)));
  return {id: s.nextId++, customer, req, reward: Math.round(req.reduce((n, [, l]) => n + 2 ** (l - 1), 0) * 3.5 + 12), title: ['顺路小件','暖心包裹','远方委托'][slot]};
}
export function newGame(seed = Date.now() >>> 0) {
  const s = {version:VERSION, seed, coins:80, parts:0, built:0, board:Array(SIZE).fill(null), storage:[], capacity:8, gens:Object.fromEntries(GENERATORS.map(g=>[g.id,1])), orders:[], discovered:[], claimed:[], nextId:1, stats:{produced:0, merges:0, orders:0, maxLevel:1}, settings:{sound:false, reducedMotion:false}, welcomed:false, savedAt:Date.now()};
  for (const g of GENERATORS) s.board[g.slot] = {g:g.id};
  [['paper',1,16],['paper',1,17],['wood',1,23],['wood',1,24],['wax',1,31],['paper',2,32]].forEach(([c,l,p]) => {s.board[p]={c,l};discover(s,s.board[p]);});
  s.orders = [0,1,2].map(i=>createOrder(s,i));
  return s;
}
export function spawn(s, id) {
  const g = GENERATORS.find(g=>g.id===id);
  if (!g || !unlocked(s,g)) return {ok:false, message:`完成前一座岛的建设后解锁`};
  const empty = s.board.indexOf(null);
  if (empty === -1) return {ok:false, message:'工作台满了，先合成、交单或把物品放进仓库吧'};
  const c = g.chains[random(s) < .74 ? 0 : 1];
  const level = s.gens[id];
  const r = random(s);
  const l = level === 4 && r < .07 ? 3 : r < .04 + (level - 1) * .14 ? 2 : 1;
  const item = {c,l};
  s.board[empty]=item; s.stats.produced++; discover(s,item);
  return {ok:true, index:empty, kind:'spawn'};
}
export function move(s, from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from<0 || to<0 || from>=SIZE || to>=SIZE || from===to) return {ok:false};
  const a=s.board[from], b=s.board[to];
  if (!a || a.g || b?.g) return {ok:false, message:'生成器固定在工作台边缘，请移动其他物品'};
  if (b && a.c===b.c && a.l===b.l && a.l<7) {
    s.board[to]={c:a.c,l:a.l+1};s.board[from]=null;s.stats.merges++;discover(s,s.board[to]);
    return {ok:true,kind:'merge',index:to};
  }
  s.board[to]=a;s.board[from]=b;
  return {ok:true,kind:b?'swap':'move',index:to};
}
export function tapIntent(s,selected,index) {
  const item=s.board[index],chosen=selected===null?null:s.board[selected];
  if(item?.g)return {kind:'generate',id:item.g,index};
  if(selected===index)return {kind:'select',index:null};
  if(chosen?.c&&(!item||(item.c===chosen.c&&item.l===chosen.l&&chosen.l<7)))return {kind:'move',from:selected,index};
  // Selecting another chain must not carry the previous selection around.
  // Swapping occupied cells remains available through deliberate dragging.
  return {kind:'select',index:item?index:null};
}
export function locateRequirements(s, req) {
  const locations=[]; const used=new Set();
  for (const [c,l] of req) {
    let found=null;
    for (const source of ['board','storage']) {
      const index=s[source].findIndex((i,index)=>i?.c===c&&i.l===l&&!used.has(`${source}:${index}`));
      if(index>=0){found={source,index};break;}
    }
    if(!found) return null;
    used.add(`${found.source}:${found.index}`);locations.push(found);
  }
  return locations;
}
// Use the same allocation as fulfillment: include storage and duplicate quantities.
// Orders are alternatives; a board item may be usable by more than one ready order.
export function readyOrderItems(s) {
  const items=new Map();
  s.orders.forEach((order,slot)=>{
    const locations=locateRequirements(s,order.req);
    if(!locations)return;
    for(const {source,index} of locations)if(source==='board'){
      if(!items.has(index))items.set(index,[]);
      items.get(index).push(slot);
    }
  });
  return items;
}
export function consume(s, locations) {
  locations.filter(x=>x.source==='board').forEach(x=>s.board[x.index]=null);
  locations.filter(x=>x.source==='storage').sort((a,b)=>b.index-a.index).forEach(x=>s.storage.splice(x.index,1));
}
export function fulfill(s, slot) {
  const order=s.orders[slot];if(!order)return {ok:false};
  const locations=locateRequirements(s,order.req);
  if(!locations)return {ok:false,message:'还有物品没准备好，点需求图标查看合成路线'};
  consume(s,locations);s.coins+=order.reward;s.stats.orders++;
  let bonus=0;
  if(s.stats.orders%5===0){bonus=40+chapterOf(s)*15;s.coins+=bonus;s.parts+=3;}
  s.orders[slot]=createOrder(s,slot);
  return {ok:true,reward:order.reward,bonus,kind:'order',customer:CUSTOMERS[order.customer]};
}
export function build(s) {
  const p=currentProject(s);if(!p)return {ok:false};
  if(s.coins<p.coins)return {ok:false,message:'邮票还不够，完成居民委托可以获得邮票'};
  const locations=locateRequirements(s,p.req);
  if(!locations)return {ok:false,message:'准备好建设材料后，就能开工啦'};
  consume(s,locations);s.coins-=p.coins;s.built++;
  const newChapter=s.built%3===0&&s.built<18;
  if(newChapter){s.coins+=60;s.parts+=4;}
  return {ok:true,kind:'build',project:p,newChapter,ending:s.built===18};
}
export function recycle(s,index) {
  const item=s.board[index];if(!item||item.g)return {ok:false};
  const amount=Math.max(1,Math.floor(valueOf(item)/2));
  s.parts+=amount;s.board[index]=null;
  return {ok:true,kind:'recycle',amount};
}
export function storeItem(s,index) {
  if(s.storage.length>=s.capacity)return {ok:false,message:'仓库满了，可以取出物品，或扩建仓库'};
  const i=s.board[index];if(!i||i.g)return {ok:false};
  s.storage.push(i);s.board[index]=null;return {ok:true,kind:'store'};
}
export function retrieve(s,index) {
  const empty=s.board.indexOf(null);if(empty<0)return {ok:false,message:'工作台满了，先腾出一个位置吧'};
  if(!s.storage[index])return {ok:false};
  s.board[empty]=s.storage.splice(index,1)[0];return {ok:true,kind:'retrieve',index:empty};
}
export const capacityCost = s => 70 + (s.capacity-8)*15;
export function expand(s) {
  if(s.capacity>=32)return {ok:false,message:'仓库已经扩建到最大容量'};
  const cost=capacityCost(s);if(s.coins<cost)return {ok:false,message:'邮票不足，先完成几份委托吧'};
  s.coins-=cost;s.capacity+=4;return {ok:true,kind:'expand'};
}
export const upgradeCost = (s,id) => ({coins:s.gens[id]*120,parts:s.gens[id]*6});
export function upgrade(s,id) {
  const g=GENERATORS.find(g=>g.id===id);if(!g||!unlocked(s,g)||s.gens[id]>=4)return {ok:false};
  const cost=upgradeCost(s,id);
  if(s.coins<cost.coins||s.parts<cost.parts)return {ok:false,message:'材料不足：完成委托赚邮票，回收闲置物品获得零件'};
  s.coins-=cost.coins;s.parts-=cost.parts;s.gens[id]++;return {ok:true,kind:'upgrade'};
}
export function reroll(s,slot) {if(!s.orders[slot])return {ok:false};s.orders[slot]=createOrder(s,slot);return {ok:true,kind:'reroll'};}
export function tidy(s) {
  const before=JSON.stringify(s.board);
  const list=s.board.filter(i=>i&&!i.g).sort((a,b)=>Object.keys(CHAINS).indexOf(a.c)-Object.keys(CHAINS).indexOf(b.c)||b.l-a.l);
  s.board=s.board.map(i=>i?.g?i:list.shift()||null);
  return {ok:JSON.stringify(s.board)!==before,kind:'tidy',message:JSON.stringify(s.board)===before?'工作台已经整整齐齐了':undefined};
}
export const achievementProgress = (s,a) => a.type==='discovered'?s.discovered.length:a.type==='built'?s.built:s.stats[a.type];
export function claim(s,id) {
  const a=ACHIEVEMENTS.find(a=>a.id===id);
  if(!a||s.claimed.includes(id)||achievementProgress(s,a)<a.goal)return {ok:false};
  s.claimed.push(id);s.coins+=a.reward;return {ok:true,kind:'claim',reward:a.reward};
}
const int=(n,min=0,max=1e9)=>Number.isInteger(n)&&n>=min&&n<=max;
export function validateState(s) {
  const fail=()=>{throw new Error('存档内容不完整或格式不正确，当前进度未被修改。');};
  if(!s||s.version!==VERSION||!int(s.seed,0,4294967295)||!int(s.coins)||!int(s.parts)||!int(s.built,0,18)||!int(s.nextId,1)||!int(s.capacity,8,32)||s.capacity%4!==0)fail();
  const validItem=i=>i&&Object.keys(i).length===2&&Object.hasOwn(CHAINS,i.c)&&int(i.l,1,7);
  if(!Array.isArray(s.board)||s.board.length!==SIZE||!Array.isArray(s.storage)||s.storage.length>s.capacity||!s.storage.every(validItem))fail();
  s.board.forEach((i,index)=>{const gen=GENERATORS.find(g=>g.slot===index);if(gen){if(i?.g!==gen.id||Object.keys(i).length!==1)fail();}else if(i!==null&&!validItem(i))fail();});
  if(!s.gens||!GENERATORS.every(g=>int(s.gens[g.id],1,4)))fail();
  const allowed=new Set(GENERATORS.filter(g=>unlocked(s,g)).flatMap(g=>g.chains));
  const validReq=r=>Array.isArray(r)&&r.length>=1&&r.length<=3&&r.every(x=>Array.isArray(x)&&x.length===2&&allowed.has(x[0])&&int(x[1],1,7));
  if(!Array.isArray(s.orders)||s.orders.length!==3||!s.orders.every(o=>o&&int(o.id,1)&&o.id<s.nextId&&int(o.customer,0,5)&&validReq(o.req)&&int(o.reward,1,10000)&&typeof o.title==='string'&&o.title.length<30))fail();
  if(new Set(s.orders.map(o=>o.id)).size!==3)fail();
  if(!s.stats||!['produced','merges','orders'].every(k=>int(s.stats[k]))||!int(s.stats.maxLevel,1,7))fail();
  if(!Array.isArray(s.discovered)||s.discovered.length>84||new Set(s.discovered).size!==s.discovered.length||!s.discovered.every(k=>typeof k==='string'&&Object.keys(CHAINS).some(c=>new RegExp(`^${c}:[1-7]$`).test(k))))fail();
  if(!Array.isArray(s.claimed)||s.claimed.length>ACHIEVEMENTS.length||new Set(s.claimed).size!==s.claimed.length||!s.claimed.every(id=>ACHIEVEMENTS.some(a=>a.id===id)))fail();
  if(!s.settings||typeof s.settings.sound!=='boolean'||typeof s.settings.reducedMotion!=='boolean'||typeof s.welcomed!=='boolean'||!Number.isFinite(s.savedAt))fail();
  return s;
}
export function checksum(text) {let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);return (hash>>>0).toString(16);}
export function encodeSave(s) {const data=JSON.stringify(s);return JSON.stringify({format:'cloudpost-save',version:VERSION,checksum:checksum(data),data:s});}
export function decodeSave(text) {
  if(typeof text!=='string'||text.length>250000)throw new Error('请选择云海邮局导出的存档文件（小于 250 KB）。');
  let save;try{save=JSON.parse(text);}catch{throw new Error('无法读取这个文件，请选择 JSON 存档。');}
  if(save?.format!=='cloudpost-save'||save.version!==VERSION||save.checksum!==checksum(JSON.stringify(save.data)))throw new Error('存档版本不受支持或文件已损坏，当前进度未被修改。');
  return validateState(save.data);
}

