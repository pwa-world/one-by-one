import {CHAINS, GENERATORS, CHAPTERS, CUSTOMERS, ACHIEVEMENTS, SIZE, itemName, itemKey} from './data.js';
import * as E from './engine.js';
import {icon,itemArt,generatorArt,avatar,scene} from './art.js';
const $=selector=>document.querySelector(selector);
const KEY='cloudpost.save.v1', BACKUP='cloudpost.backup.v1';
let state, lastStored=null, saveTimer, maxSaveTimer, loadMessage='', saveAvailable=true, readOnly=false, corruption=false;
let selected=null, history=[], currentView='', modalData=null, toastTimer, installPrompt=null, offlineReady=false, mobileTab='desk';
let audioContext, islandSignature='', orderSignature='', pendingImport=null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try {
  lastStored=localStorage.getItem(KEY);
  if(lastStored) {
    try {state=E.decodeSave(lastStored);} catch {
      const backup=localStorage.getItem(BACKUP);
      try {state=E.decodeSave(backup);loadMessage='已从上一份有效备份恢复进度。';} catch {corruption=true;readOnly=true;}
    }
  } else {
    const backup=localStorage.getItem(BACKUP);
    if(backup)try {state=E.decodeSave(backup);loadMessage='已找回本机备份。';}catch{}
  }
} catch {saveAvailable=false;loadMessage='浏览器无法写入本机存档。请在设置中导出进度，避免关闭后丢失。';}
state ||= E.newGame();
const board=$('#board');
const cells=Array.from({length:SIZE},(_,index)=>{
  const button=document.createElement('button');button.className='cell empty';button.dataset.cell=index;button.type='button';
  board.append(button);return button;
});
$('.settings-trigger').innerHTML=icon('settings');
$('#undo-button').innerHTML=icon('undo');
$('[data-action="tidy"]').innerHTML=icon('tidy');
$('.modal-header [data-action="close"]').innerHTML=icon('close');
document.querySelectorAll('.mobile-nav button').forEach((button,i)=>button.innerHTML=icon(['home','map','book','settings'][i])+button.textContent);

function toast(message) {
  if(!message)return;
  const node=$('#toast');node.textContent=message;node.classList.add('visible');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>node.classList.remove('visible'),3400);
}
function saveStatus(text,warning=false){$('#save-status').textContent=text;$('#save-status').classList.toggle('save-warning',warning);}
function conflict() {
  if(readOnly)return;
  readOnly=true;clearTimeout(saveTimer);clearTimeout(maxSaveTimer);saveStatus('另一窗口更新了进度，请重新载入',true);
  openModal('conflict');
}
function persist(force=false) {
  clearTimeout(saveTimer);clearTimeout(maxSaveTimer);saveTimer=maxSaveTimer=null;
  if(readOnly&&!force)return;
  try {
    const actual=localStorage.getItem(KEY);
    if(!force&&actual!==lastStored){conflict();return;}
    state.savedAt=Date.now();
    const next=E.encodeSave(state);
    if(actual){try{E.decodeSave(actual);localStorage.setItem(BACKUP,actual);}catch{}}
    localStorage.setItem(KEY,next);lastStored=next;saveAvailable=true;
    saveStatus('进度已保存在本机');
  } catch {
    saveAvailable=false;saveStatus('自动保存失败，请导出存档',true);
    toast('本机存储不可用或已满，请到设置导出存档。');
  }
}
function scheduleSave(){if(readOnly)return;saveStatus('正在保存…');clearTimeout(saveTimer);saveTimer=setTimeout(persist,280);maxSaveTimer ||= setTimeout(persist,1800);}
window.addEventListener('pagehide',()=>persist());
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});
window.addEventListener('storage',event=>{if(event.key===KEY&&event.newValue!==lastStored)conflict();});

function sound(kind) {
  if(!state.settings.sound)return;
  try {
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const now=audioContext.currentTime;
    const notes=kind==='merge'?[587,784]:kind==='order'||kind==='build'?[523,659,784]:[440];
    notes.forEach((note,index)=>{
      const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
      oscillator.type='sine';oscillator.frequency.value=note;gain.gain.setValueAtTime(0,now+index*.06);
      gain.gain.linearRampToValueAtTime(.035,now+index*.06+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+index*.06+.19);
      oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now+index*.06);oscillator.stop(now+index*.06+.2);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    });
  } catch{}
}
function act(fn,{keepSelection=false,quiet=false}={}) {
  if(readOnly){openModal(corruption?'corrupt':'conflict');return {ok:false};}
  const before=E.clone(state), result=fn(state);
  if(!result.ok){if(result.message)toast(result.message);return result;}
  history.push(before);if(history.length>20)history.shift();
  if(!keepSelection)selected=null;
  render();scheduleSave();
  if(!quiet)sound(result.kind);
  if(result.index!==undefined&&['merge','spawn'].includes(result.kind)) {
    const cell=cells[result.index];cell.classList.remove('burst','spawn-pop');
    requestAnimationFrame(()=>cell.classList.add(result.kind==='merge'?'burst':'spawn-pop'));
  }
  return result;
}
function undo() {
  if(readOnly)return toast('请先载入最新存档');
  if(!history.length)return toast('还没有可以撤销的操作');
  state=history.pop();selected=null;render();scheduleSave();toast('已撤销上一步，物品和资源都恢复了');
}
function count(c,l) {return [...state.board,...state.storage].filter(i=>i?.c===c&&i.l===l).length;}
function requirements(req) {
  const seen={};
  return `<div class="requirements">${req.map(([c,l])=>{
    const key=`${c}:${l}`;seen[key]=(seen[key]||0)+1;const ready=count(c,l)>=seen[key];
    return `<button class="requirement ${ready?'ready':''}" data-action="item" data-chain="${c}" data-level="${l}" aria-label="${itemName({c,l})}，${l} 级，${ready?'已备齐':'尚未备齐'}，查看合成路线">${itemArt(c,l)}<span class="req-level">${l}</span>${ready?`<span class="req-check">${icon('check')}</span>`:''}</button>`;
  }).join('')}</div>`;
}
function orderCard(order,slot) {
  const customer=CUSTOMERS[order.customer],ready=!!E.locateRequirements(state,order.req);
  return `<article class="order-card"><div class="order-person">${avatar(customer[1])}<div><strong>${customer[0]}</strong><small>${escape(order.title)}</small></div></div><p class="order-title">${customer[2]}</p>${requirements(order.req)}<div class="order-bottom"><span class="order-reward">${icon('stamp')} ${order.reward}</span><button class="order-reroll" data-action="reroll" data-slot="${slot}" aria-label="更换${customer[0]}的委托">${icon('refresh')}</button><button class="order-submit ${ready?'ready':''}" data-action="fulfill" data-slot="${slot}" ${ready?'':'disabled'}>${ready?'寄出包裹':'准备中'}</button></div></article>`;
}
function renderOrders() {
  const signature=JSON.stringify([state.orders,state.orders.map(o=>o.req.map(([c,l])=>count(c,l))),state.stats.orders,claimable()]);
  if(signature===orderSignature)return;orderSignature=signature;
  const cards=state.orders.map(orderCard).join('');
  $('#orders-panel').innerHTML=`<div class="orders-heading"><h2>远方的来信</h2><span>3 份待办委托</span></div>${cards}<div class="delivery-progress"><div class="delivery-title">${icon('heart')} 街坊的心意 <span style="margin-left:auto;font:11px var(--sans)">${state.stats.orders%5} / 5</span></div><div class="delivery-dots">${Array.from({length:5},(_,i)=>`<span class="${i<state.stats.orders%5?'done':''}"></span>`).join('')}</div><p>每寄出 5 份包裹，收到邮票与零件谢礼。</p></div><button class="journal-link" data-action="journal">${icon('book')} 翻开邮局手帐 ${claimable()?'<i class="available-badge"></i>':''}</button>`;
  $('#mobile-orders').innerHTML=cards;
}
function renderIsland() {
  const project=E.currentProject(state);
  const signature=JSON.stringify([state.built,state.coins,project?.req.map(([c,l])=>count(c,l))]);
  if(signature===islandSignature)return;islandSignature=signature;
  const ch=CHAPTERS[E.chapterOf(state)],p=E.currentProject(state),progress=state.built===18?3:state.built%3;
  const panel=$('#island-panel');
  const picture=panel.querySelector('.island-scene');const oldChapter=panel.dataset.chapter,oldBuilt=panel.dataset.built;
  panel.innerHTML=`<div class="island-title"><div><div class="section-label">我们的云海 · 第 ${E.chapterOf(state)+1} 章</div><h2>${ch.name}</h2></div><span class="chapter-number">0${E.chapterOf(state)+1}</span></div><div class="scene-placeholder"></div><p class="island-subtitle">${ch.subtitle}</p><div class="island-progress"><div class="progress-track"><span style="width:${progress/3*100}%"></span></div><span>${progress} / 3 已修复</span></div>${p?`<div class="build-card"><div class="section-label">下一件小事</div><h3>${p.name}</h3>${requirements(p.req)}<div class="build-cost">${icon('stamp')} ${p.coins} 邮票 <span style="margin-left:auto;font-size:10px;color:#969a83">建设材料</span></div><button class="primary-button full-width build-button" data-action="build" ${state.coins>=p.coins&&E.locateRequirements(state,p.req)?'':'disabled'}><span>一起修好它</span>${icon('arrow')}</button></div>`:`<div class="build-card"><div class="section-label">我们的故事</div><h3>所有远方，都有了回音</h3><p class="muted-note">航线已经全部连通。邮局依然营业，新的来信还会抵达。</p><button class="primary-button full-width" data-action="ending">重读云海的回信</button></div>`}<button class="route-button" data-action="routes">${icon('map')} 查看云海航线 ${icon('arrow')}</button><div class="resident-note">${avatar(ch.avatar)}<div><p>“${ch.subtitle}。”</p><small>—— ${ch.resident} · ${ch.role}</small></div></div>`;
  const placeholder=panel.querySelector('.scene-placeholder');
  if(picture&&oldChapter===String(E.chapterOf(state))&&oldBuilt===String(state.built))placeholder.replaceWith(picture);
  else placeholder.outerHTML=scene(E.chapterOf(state),state.built);
  panel.dataset.chapter=E.chapterOf(state);panel.dataset.built=state.built;
}
function renderBoard() {
  const chosen=selected!==null?state.board[selected]:null;
  cells.forEach((cell,index)=>{
    const item=state.board[index];const g=item?.g?GENERATORS.find(g=>g.id===item.g):null;
    const locked=g&&!E.unlocked(state,g),signature=JSON.stringify([item,g?state.gens[g.id]:null,locked]);
    if(cell.dataset.signature!==signature){
      cell.dataset.signature=signature;
      cell.innerHTML=g?`${generatorArt(g.id)}${locked?icon('lock'):`<span class="gen-level">Lv.${state.gens[g.id]}</span><span class="gen-plus">+</span>`}`:item?`${itemArt(item.c,item.l)}<span class="item-level">${item.l}</span>`:'';
      cell.setAttribute('aria-label',g?`${g.name}，${locked?'尚未解锁':'点击生成物品'}`:item?`${itemName(item)}，${item.l} 级，位置 ${index+1}`:`空格 ${index+1}`);
    }
    cell.classList.toggle('empty',!item);cell.classList.toggle('generator',!!g);cell.classList.toggle('locked',!!locked);
    cell.classList.toggle('selected',index===selected);
    cell.classList.toggle('match',!!(chosen?.c&&item?.c===chosen.c&&item.l===chosen.l&&chosen.l<7&&index!==selected));
    cell.setAttribute('aria-pressed',String(index===selected));
  });
  $('#space-count').textContent=`空位 ${state.board.filter(i=>!i).length} / 50`;
  $('#undo-button').disabled=!history.length||readOnly;
}
function renderSelection() {
  const i=selected!==null?state.board[selected]:null;
  if(!i){$('#selection-bar').innerHTML=`<div class="empty-selection">${icon('leaf')}<span>不必着急，先从一封信开始。<br>点绿色生成器制作物品，再拖动或点选合成。</span></div>`;return;}
  if(i.g){const g=GENERATORS.find(g=>g.id===i.g),available=E.unlocked(state,g);$('#selection-bar').innerHTML=`${generatorArt(g.id)}<div class="selected-description"><strong>${g.name} · ${available?`Lv.${state.gens[g.id]}`:'未解锁'}</strong><small>${available?`产出${CHAINS[g.chains[0]].name}与${CHAINS[g.chains[1]].name} · 无需等待`:`抵达${CHAPTERS[g.chapter].name}后开启`}</small></div><div class="selection-actions"><button data-action="workshop" aria-label="查看生成器升级">${icon('info')}</button>${available?`<button data-action="produce" data-id="${g.id}" aria-label="再生成一个物品">${icon('tidy')}</button>`:''}</div>`;return;}
  $('#selection-bar').innerHTML=`${itemArt(i.c,i.l)}<div class="selected-description"><strong>${itemName(i)} <span style="color:#92967e;font-size:10px">Lv.${i.l}</span></strong><small>${i.l===7?'已到最高等级，值得珍藏':'点击相同物品合成，或点击空格移动'}</small></div><div class="selection-actions"><button data-action="item" data-chain="${i.c}" data-level="${i.l}" aria-label="查看物品合成路线">${icon('info')}</button><button data-action="store" aria-label="将选中物品存入仓库">${icon('bag')}</button><button data-action="recycle" aria-label="回收选中物品">${icon('recycle')}</button></div>`;
}
function claimable(){return ACHIEVEMENTS.filter(a=>!state.claimed.includes(a.id)&&E.achievementProgress(state,a)>=a.goal).length;}
function render() {
  $('#wallet').innerHTML=`<div class="currency" aria-label="${state.coins} 邮票">${icon('stamp')}<span>${state.coins.toLocaleString()}</span><small>邮票</small></div><div class="currency parts" aria-label="${state.parts} 零件">${icon('parts')}<span>${state.parts.toLocaleString()}</span><small>零件</small></div>`;
  renderBoard();renderSelection();renderOrders();renderIsland();
  $('#storage-button').innerHTML=`${icon('bag')} 仓库 <small>${state.storage.length}/${state.capacity}</small>`;
  $('#collection-button').innerHTML=`${icon('book')} 图鉴 <small>${state.discovered.length}/84</small>`;
  $('#workshop-button').innerHTML=`${icon('parts')} 生成工坊`;
  document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);
  if($('#modal').open&&['storage','workshop','achievements','collection','settings'].includes(currentView))renderModal();
}
function choose(index) {
  const item=state.board[index];
  if(item?.g){selected=index;act(s=>E.spawn(s,item.g),{keepSelection:true});renderBoard();renderSelection();return;}
  if(selected===index){selected=null;renderBoard();renderSelection();return;}
  if(selected!==null&&state.board[selected]?.c) {
    const from=selected,result=act(s=>E.move(s,from,index));
    if(result.ok){selected=index;renderBoard();renderSelection();}
    return;
  }
  selected=item?index:null;renderBoard();renderSelection();
}

function openModal(view,data=null) {
  currentView=view;modalData=data;renderModal();
  const dialog=$('#modal');if(!dialog.open)dialog.showModal();
  $('#modal-body').scrollTop=0;dialog.scrollTop=0;
}
function closeModal(){if(corruption)return;$('#modal').close();currentView='';modalData=null;}
const modalTitles={welcome:'你好，新任邮局长',help:'新任邮局长指南',storage:'装下每一份小小珍藏',collection:'云海万物图鉴',workshop:'生成工坊',routes:'云海航线',journal:'邮局手帐',achievements:'邮局里的小成就',letter:'来自远方的一封信',settings:'让邮局更像你的家',item:'物品与合成路线',story:'一件小事，修好了',recycle:'给旧物一个新用途',reroll:'换一份委托',import:'接续另一段旅程',reset:'重新开始旅程',ending:'致每一个等待的人',conflict:'另一扇窗里的邮局',corrupt:'暂时无法读取本机存档'};
function renderModal() {
  $('#modal-title').textContent=modalTitles[currentView]||'云海邮局';let html='';
  const ch=CHAPTERS[E.chapterOf(state)];
  if(currentView==='welcome')html=`<div class="intro-art">${scene(0,0)}</div><p class="lead" style="text-align:center">云海很大，邮局很小。<br>但每一份想念，都值得抵达。</p><p>你接手了一座旧邮局。和信使阿芦一起，整理信件、合成物品，把断开的空岛航线重新连接起来。</p><div class="help-steps"><div class="help-step"><span class="step-number">1</span><div><strong>点击邮袋或工具箱</strong><p>随时生成材料，没有体力，也没有冷却。</p></div></div><div class="help-step"><span class="step-number">2</span><div><strong>把两个相同物品合在一起</strong><p>拖动合成，或先点一个，再点另一个。手机也很轻松。</p></div></div><div class="help-step"><span class="step-number">3</span><div><strong>寄出包裹，慢慢修好邮局</strong><p>订单赚邮票，建设开启新的岛屿和故事。</p></div></div></div><div class="welcome-actions"><button class="primary-button" data-action="welcome">打开邮局的门 ${icon('arrow')}</button></div><p class="muted-note" style="text-align:center">进度自动存在这台设备 · 准备好离线资源后，断网也能玩</p>`;
  else if(currentView==='help')html=`<p class="lead">没有倒计时，按自己的节奏来。</p><div class="help-steps">${[
    ['生产与合成','点击棋盘边缘的生成器生产。相同种类、相同等级的两个物品，可以合成更高一级，最高 7 级。生成器位置固定。'],
    ['两种操作方式','拖动一个物品到另一个物品上；也可以先点击物品，再点击目标。点击空格移动，点击不同物品互换。键盘可用方向键、Enter 和空格操作。'],
    ['恰好合到需要的等级','订单需要指定等级，较高级物品不能代替。点需求图标查看合成路线。仓库里的物品也能直接交单。'],
    ['满盘也不用着急','先合成、交单，或把物品存进仓库。回收闲置物品可获得零件，用来升级生成器；上方的撤销按钮可以回退最近 20 次操作。'],
    ['让世界一点点变大','每章完成 3 项建设，开启下一座岛。共 6 章、18 项建设、84 种物品。主线结束后仍可继续委托和收集。'],
    ['安心保存','自动保存在当前浏览器和网站地址下；不同地址、浏览器、设备不共用存档。清理网站数据前请导出备份。安装到主屏幕后依然使用本机进度。']
  ].map(([title,text],i)=>`<div class="help-step"><span class="step-number">${i+1}</span><div><strong>${title}</strong><p>${text}</p></div></div>`).join('')}</div><button class="primary-button full-width" data-action="close">明白了，慢慢来</button>`;
  else if(currentView==='storage')html=`<p>暂存舍不得用的小物件。点击物品取回工作台，交单时也会自动取用这里的材料。</p><div class="storage-grid">${Array.from({length:state.capacity},(_,i)=>{const item=state.storage[i];return `<button class="storage-slot ${item?'filled':''}" ${item?`data-action="retrieve" data-index="${i}" aria-label="取回${itemName(item)}，${item.l}级"`:'disabled aria-label="仓库空位"'}>${item?`${itemArt(item.c,item.l)}<span class="item-level">${item.l}</span>`:'<span>·</span>'}</button>`;}).join('')}</div><p>已使用 ${state.storage.length} / ${state.capacity} 格</p><button class="secondary-button full-width" data-action="expand" ${state.capacity>=32||state.coins<E.capacityCost(state)?'disabled':''}>${icon('bag')} ${state.capacity>=32?'仓库已扩建完成':`扩建 4 格 · ${E.capacityCost(state)} 邮票`}</button>`;
  else if(currentView==='collection')html=`<div class="collection-count"><strong>${state.discovered.length}<span style="font-size:15px;color:#9c9e87"> / 84</span></strong><span>已发现的云海小物<br>每一件，都有抵达远方的可能。</span></div>${Object.entries(CHAINS).map(([c,chain])=>`<div class="collection-family"><h3>${chain.name} <small style="color:#a0a18c;font:10px var(--sans)">${GENERATORS.find(g=>g.chains.includes(c)).name}</small></h3><div class="chain-row">${chain.names.map((name,i)=>`<button class="collection-item ${state.discovered.includes(`${c}:${i+1}`)?'':'undiscovered'}" style="background:none;padding:0" data-action="item" data-chain="${c}" data-level="${i+1}" aria-label="查看${name}合成路线">${itemArt(c,i+1)}<small>${name}</small><span class="level-label">LV.${i+1}</span></button>`).join('')}</div></div>`).join('')}`;
  else if(currentView==='workshop')html=`<p>所有普通生产都没有冷却。回收闲置物品积累零件，升级后更容易直接得到高一级材料。</p>${GENERATORS.map(g=>{const available=E.unlocked(state,g),level=state.gens[g.id],cost=E.upgradeCost(state,g.id);return `<div class="generator-card ${available?'':'locked'}">${generatorArt(g.id)}<div class="detail"><h3>${g.name} · Lv.${level}</h3><p>${CHAINS[g.chains[0]].name} 74% / ${CHAINS[g.chains[1]].name} 26%</p><p>${available?`2 级产出 ${Math.round((.04+(level-1)*.14-(level===4?.07:0))*100)}%${level===4?' · 3 级产出 7%':''}`:`抵达${CHAPTERS[g.chapter].name}解锁`}</p></div><button class="secondary-button" data-action="upgrade" data-id="${g.id}" ${!available||level>=4||state.coins<cost.coins||state.parts<cost.parts?'disabled':''}>${level>=4?'已满级':`${cost.coins} 邮票<br>${cost.parts} 零件`}</button></div>`;}).join('')}<p class="muted-note">基础生成器也能合出所有高阶物品，升级只是让制作更轻松。</p>`;
  else if(currentView==='routes')html=`<p class="lead">沿着来信的方向，重新认识云海。</p><div class="route-list">${CHAPTERS.map((c,i)=>`<button class="route-stop ${i===E.chapterOf(state)?'current':''} ${i>E.chapterOf(state)?'locked':''}" data-action="letter" data-index="${i}" ${i>E.chapterOf(state)?'disabled':''}>${avatar(c.avatar)}<div class="detail"><h3>0${i+1} · ${c.name}</h3><p>${c.subtitle}</p></div><span>${state.built>=(i+1)*3?'已连通':i===E.chapterOf(state)?'正在修复':icon('lock')}</span></button>`).join('')}</div><p class="muted-note">点击已抵达的岛屿，重读居民的来信。</p>`;
  else if(currentView==='journal')html=`<div class="modal-tabs"><button class="active" data-action="journal">居民来信</button><button data-action="achievements">小小成就${claimable()?` · ${claimable()}`:''}</button></div><p class="lead">留下来的信，都是相遇的证明。</p><div class="letters-list">${CHAPTERS.slice(0,E.chapterOf(state)+1).map((c,i)=>`<button class="letter-button" data-action="letter" data-index="${i}">${avatar(c.avatar)}<span><strong>${c.resident}的来信</strong><small>${c.name} · ${c.role}</small></span>${icon('arrow')}</button>`).join('')}</div><hr><p>累计寄出 ${state.stats.orders} 份包裹 · 完成 ${state.stats.merges} 次合成<br>修复 ${state.built} / 18 处设施</p>${state.built===18?'<button class="secondary-button full-width" data-action="ending">重读云海的回信</button>':''}`;
  else if(currentView==='achievements')html=`<div class="modal-tabs"><button data-action="journal">居民来信</button><button class="active" data-action="achievements">小小成就</button></div>${ACHIEVEMENTS.map(a=>{const progress=Math.min(a.goal,E.achievementProgress(state,a)),claimed=state.claimed.includes(a.id);return `<div class="achievement ${claimed?'claimed':''}"><span class="achievement-icon">${icon(claimed?'check':'star')}</span><div class="detail"><h3>${a.name}</h3><p>${a.desc} · ${progress}/${a.goal}</p></div><button class="${progress>=a.goal&&!claimed?'primary-button':'secondary-button'}" data-action="claim" data-id="${a.id}" ${claimed||progress<a.goal?'disabled':''}>${claimed?'已领取':`${a.reward} 邮票`}</button></div>`;}).join('')}`;
  else if(currentView==='letter') {const c=CHAPTERS[modalData??E.chapterOf(state)];html=`<div class="order-person" style="margin-bottom:18px">${avatar(c.avatar)}<div><strong>${c.resident}</strong><small>${c.name} · ${c.role}</small></div></div><p class="letter-text">${c.letter}</p><button class="secondary-button full-width" data-action="journal">收进我的手帐 ${icon('book')}</button>`;}
  else if(currentView==='item') {
    const {c,l}=modalData,g=GENERATORS.find(g=>g.chains.includes(c));
    html=`<div class="item-detail-hero">${itemArt(c,l)}<div><h3>${itemName({c,l})}</h3><p>${CHAINS[c].name}系列 · ${l} 级<br>${state.discovered.includes(`${c}:${l}`)?'已经发现':'还未发现'} · 库存 ${count(c,l)} 件</p></div></div><p>来源：${g.name}。${E.unlocked(state,g)?'生成器可以随时生产。':`抵达${CHAPTERS[g.chapter].name}后解锁。`}</p>${l>1?`<div class="recipe">${itemArt(c,l-1)}<span>＋</span>${itemArt(c,l-1)}${icon('arrow')}${itemArt(c,l)}</div><p class="muted-note" style="text-align:center">2 件${itemName({c,l:l-1})} → 1 件${itemName({c,l})}</p>`:''}<div class="collection-family"><h3>完整合成路线</h3><div class="chain-row">${CHAINS[c].names.map((name,i)=>`<button class="collection-item" data-action="item" data-chain="${c}" data-level="${i+1}" style="background:none;padding:0">${itemArt(c,i+1)}<small>${name}</small><span class="level-label">LV.${i+1}</span></button>`).join('')}</div></div><p class="tip">订单需要恰好的等级。合过头时，可以用工作台上方的撤销按钮回退。</p>`;
  }
  else if(currentView==='story') {const r=modalData;html=`<div class="intro-art">${scene(E.chapterOf(state),state.built)}</div><p class="lead">${r.project.name}</p><p class="letter-text">${r.project.text}</p>${r.newChapter?`<p class="tip">已抵达 ${ch.name} · 收到 60 邮票和 4 零件。<br>${GENERATORS.filter(g=>g.chapter===E.chapterOf(state)).map(g=>`新生成器「${g.name}」已经准备好了。`).join('')}</p>`:''}<button class="primary-button full-width" data-action="${r.ending?'ending':r.newChapter?'new-letter':'close'}">${r.ending?'读一读最后的回信':r.newChapter?'打开新岛屿的来信':'继续慢慢生活'} ${icon('arrow')}</button>`;}
  else if(currentView==='ending')html=`<div class="intro-art">${scene(5,18)}</div><div class="ending-stamp">远方有回音</div><p class="letter-text">${CHAPTERS[5].projects[2].text}</p><p class="tip">全部 6 条航线、18 项建设已经完成。居民委托会一直继续，你也可以收藏全部 84 种物品，完成剩余的小成就。</p><button class="primary-button full-width" data-action="close">邮局明天，也照常营业</button>`;
  else if(currentView==='recycle') {const item=state.board[modalData];html=`<div class="item-detail-hero">${itemArt(item.c,item.l)}<div><h3>${itemName(item)}</h3><p>回收后获得 ${Math.max(1,Math.floor(E.valueOf(item)/2))} 零件</p></div></div><p>零件可用于升级生成器。回收后可以通过撤销按钮恢复物品。</p><div class="actions"><button class="primary-button" data-action="confirm-recycle" data-index="${modalData}">回收物品</button><button class="secondary-button" data-action="close">再留一会儿</button></div>`;}
  else if(currentView==='reroll')html=`<p class="lead">这份委托可以留给下一位信使。</p><p>免费换一份新的委托，已有的物品都会保留。更换不会获得奖励，也不会扣除资源。</p><div class="actions"><button class="primary-button" data-action="confirm-reroll" data-slot="${modalData}">换一份委托</button><button class="secondary-button" data-action="close">保留这份</button></div>`;
  else if(currentView==='settings')html=`<div class="setting-row"><div><strong>轻轻的合成音效</strong><p>由设备生成，无需下载音频</p></div><input class="toggle" type="checkbox" data-setting="sound" aria-label="合成音效" ${state.settings.sound?'checked':''}></div><div class="setting-row"><div><strong>减少动态效果</strong><p>让合成与界面切换更安静</p></div><input class="toggle" type="checkbox" data-setting="reducedMotion" aria-label="减少动态效果" ${state.settings.reducedMotion?'checked':''}></div><section class="settings-section"><h3>把回忆，好好留住</h3><p>进度自动保存在当前浏览器。换设备、换浏览器或清理网站数据前，记得导出存档。</p><div class="actions"><button class="primary-button" data-action="export">${icon('download')} 导出存档</button><button class="secondary-button" data-action="import">导入存档</button><button class="secondary-button" data-action="backup">恢复上次备份</button></div><p class="storage-info">${saveAvailable?'本机自动保存已启用':'自动保存暂不可用，请导出存档'} · 存档版本 1<br>最近保存：${new Date(state.savedAt).toLocaleString('zh-CN')}</p></section><hr><h3>把邮局放进口袋</h3><p id="offline-detail">${offlineReady?'离线资源已准备好。断开网络后仍可生产、合成、建设和保存。':'正在准备离线资源，请在联网状态下稍等片刻。'}</p><div class="actions"><button class="secondary-button" data-action="install">${icon('download')} 安装到设备</button><button class="secondary-button" data-action="help">玩法指南</button></div><p class="muted-note">iPhone / iPad：用 Safari 打开，点“分享 → 添加到主屏幕”。其他设备可使用浏览器菜单里的安装选项。首次访问需加载完整资源。</p><hr><button class="secondary-button danger-button" data-action="reset">重新开始旅程</button><p class="muted-note">云海邮局 v1.0 · 一封信，一个温柔的小世界。</p>`;
  else if(currentView==='import')html=`<p class="lead">找到了一段云海旅程。</p><p>修复 ${pendingImport.built} / 18 项建设，完成 ${pendingImport.stats.orders} 份委托，收藏 ${pendingImport.discovered.length} 种物品。</p><p class="tip">载入后会替换当前进度，现有有效存档会保留为上次备份。也可以先导出当前进度。</p><div class="actions"><button class="primary-button" data-action="confirm-import">载入这份存档</button><button class="secondary-button" data-action="export">先导出当前进度</button><button class="secondary-button" data-action="close">取消</button></div>`;
  else if(currentView==='reset')html=`<p class="lead">每一次出发，都值得认真告别。</p><p>这会清空当前旅程。建议先导出存档，之后还可以回来。</p><input class="safety-confirm" id="reset-confirm" placeholder="输入“重新开始”确认" aria-label="输入重新开始确认"><div class="actions"><button class="secondary-button" data-action="export">导出存档</button><button class="secondary-button danger-button" data-action="confirm-reset">开始新的旅程</button></div>`;
  else if(currentView==='conflict')html=`<p class="lead">另一窗口保存了新的进度。</p><p>为避免相互覆盖，这个窗口暂时停止保存。请载入最新进度继续；也可以先导出这个窗口中的进度。</p><div class="actions"><button class="primary-button" data-action="reload">载入最新进度</button><button class="secondary-button" data-action="export">导出此窗口进度</button></div>`;
  else if(currentView==='corrupt')html=`<p>当前存档及备份无法校验。原始内容没有被覆盖，你可以导入之前导出的存档，或重新开始。</p><div class="actions"><button class="primary-button" data-action="import">导入存档</button><button class="secondary-button" data-action="raw-export">保存原始数据</button><button class="secondary-button danger-button" data-action="reset">重新开始</button></div>`;
  $('#modal-body').innerHTML=html;
}
function download(text,name) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function exportSave() {download(E.encodeSave(state),`云海邮局-${new Date().toISOString().slice(0,10)}.json`);toast('存档已导出，请保管好这封回忆');}
function showMobileTab(tab) {
  mobileTab=tab;$('#desk-panel').classList.toggle('mobile-hidden',tab!=='desk');$('#island-panel').classList.toggle('mobile-visible',tab==='island');
  document.querySelectorAll('.mobile-nav [data-action="tab"]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  window.scrollTo({top:0,behavior:state.settings.reducedMotion?'instant':'smooth'});
}
document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='close'){closeModal();return;}
  if(['storage','collection','workshop','routes','journal','achievements','settings','help','reset','ending'].includes(action)){openModal(action);return;}
  if(action==='item'){openModal('item',{c:button.dataset.chain,l:Number(button.dataset.level)});return;}
  if(action==='letter'){openModal('letter',Number(button.dataset.index));return;}
  if(action==='new-letter'){openModal('letter',E.chapterOf(state));return;}
  if(action==='tab'){showMobileTab(button.dataset.tab);return;}
  if(action==='welcome'){state.welcomed=true;scheduleSave();closeModal();toast('试试把中间的两张信纸合在一起吧');return;}
  if(action==='undo'){undo();return;}
  if(action==='tidy'){const r=act(E.tidy);if(r.ok)toast('已按系列整理，合成进度都保留着');return;}
  if(action==='produce'){act(s=>E.spawn(s,button.dataset.id),{keepSelection:true});return;}
  if(action==='store'&&selected!==null){const r=act(s=>E.storeItem(s,selected));if(r.ok)toast('已收进仓库，交单时可以直接取用');return;}
  if(action==='retrieve'){act(s=>E.retrieve(s,Number(button.dataset.index)));return;}
  if(action==='expand'){const r=act(E.expand);if(r.ok)toast('仓库又宽敞了一点，新增 4 个位置');return;}
  if(action==='upgrade'){const r=act(s=>E.upgrade(s,button.dataset.id));if(r.ok)toast('生成器升级了，更容易产出高阶材料');return;}
  if(action==='recycle'&&selected!==null&&state.board[selected]?.c){
    if(state.board[selected].l>=3)openModal('recycle',selected);
    else {const r=act(s=>E.recycle(s,selected));if(r.ok)toast(`回收获得 ${r.amount} 零件 · 可撤销`);}return;
  }
  if(action==='confirm-recycle'){const r=act(s=>E.recycle(s,Number(button.dataset.index)));if(r.ok){closeModal();toast(`回收获得 ${r.amount} 零件 · 可撤销`);}return;}
  if(action==='fulfill'){const r=act(s=>E.fulfill(s,Number(button.dataset.slot)));if(r.ok)toast(r.bonus?`包裹已寄出！+${r.reward} 邮票，街坊另送 ${r.bonus} 邮票与 3 零件`:`包裹已寄出，收到 ${r.reward} 邮票。${r.customer[0]}向你道谢！`);return;}
  if(action==='build'){const r=act(E.build);if(r.ok)openModal('story',r);return;}
  if(action==='reroll'){openModal('reroll',Number(button.dataset.slot));return;}
  if(action==='confirm-reroll'){const r=act(s=>E.reroll(s,Number(button.dataset.slot)));if(r.ok){closeModal();toast('新委托到了，原来的材料全部保留');}return;}
  if(action==='claim'){const r=act(s=>E.claim(s,button.dataset.id));if(r.ok)toast(`小小成就达成，收到 ${r.reward} 邮票`);return;}
  if(action==='export'){exportSave();return;}
  if(action==='raw-export'){download(lastStored||'{}','云海邮局-待恢复原始数据.json');return;}
  if(action==='import'){$('#import-file').click();return;}
  if(action==='confirm-import'){
    if(!pendingImport)return;
    state=E.clone(pendingImport);pendingImport=null;history=[];selected=null;readOnly=false;corruption=false;islandSignature=orderSignature='';
    persist(true);render();closeModal();toast(saveAvailable?'旅程已接续，欢迎回来':'进度已载入，但自动保存失败，请保留导出文件');return;
  }
  if(action==='backup'){
    try{pendingImport=E.decodeSave(localStorage.getItem(BACKUP));openModal('import');}catch{toast('还没有可用的备份，或备份无法读取');}return;
  }
  if(action==='confirm-reset') {
    if($('#reset-confirm').value.trim()!=='重新开始'){toast('请输入“重新开始”再确认');return;}
    state=E.newGame();readOnly=false;corruption=false;history=[];selected=null;islandSignature=orderSignature='';persist(true);render();openModal('welcome');return;
  }
  if(action==='reload'){location.reload();return;}
  if(action==='install'){
    if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}
    else toast(window.matchMedia('(display-mode: standalone)').matches?'邮局已经安装到设备上了':'使用浏览器菜单中的“安装应用”或“添加到主屏幕”');return;
  }
});
document.addEventListener('change',event=>{
  const key=event.target.dataset.setting;
  if(key){if(readOnly){event.target.checked=state.settings[key];return;}
    state.settings[key]=event.target.checked;document.body.classList.toggle('reduce-motion',state.settings.reducedMotion);scheduleSave();if(key==='sound'&&event.target.checked)sound('merge');}
});
$('#import-file').addEventListener('change',async event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(file.size>250000){toast('存档文件不能超过 250 KB');return;}
  try{pendingImport=E.decodeSave(await file.text());openModal('import');}catch(error){toast(error.message);}
});
$('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
$('#modal').addEventListener('cancel',event=>{if(corruption)event.preventDefault();else{currentView='';modalData=null;}});

let drag=null,ghost=null,dragFrame=null,lastDrop=null,suppressClickUntil=0;
board.addEventListener('pointerdown',event=>{
  if(event.button!==0||readOnly||!event.isPrimary)return;
  const cell=event.target.closest('[data-cell]');if(!cell)return;
  const index=Number(cell.dataset.cell),item=state.board[index];
  if(!item?.c)return;
  drag={index,pointer:event.pointerId,x:event.clientX,y:event.clientY,latestX:event.clientX,latestY:event.clientY,started:false};
  board.setPointerCapture(event.pointerId);
});
board.addEventListener('pointermove',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  drag.latestX=event.clientX;drag.latestY=event.clientY;
  if(!drag.started&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>7){
    drag.started=true;ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=itemArt(state.board[drag.index].c,state.board[drag.index].l);document.body.append(ghost);cells[drag.index].classList.add('drag-origin');
  }
  if(drag.started&&!dragFrame)dragFrame=requestAnimationFrame(()=>{
    dragFrame=null;if(!drag||!ghost)return;
    ghost.style.transform=`translate3d(${drag.latestX-34}px,${drag.latestY-34}px,0)`;
    const target=document.elementFromPoint(drag.latestX,drag.latestY)?.closest('#board [data-cell]');
    if(lastDrop!==target){lastDrop?.classList.remove('drop-target');target?.classList.add('drop-target');lastDrop=target;}
  });
});
function cleanupDrag(){if(dragFrame)cancelAnimationFrame(dragFrame);dragFrame=null;ghost?.remove();ghost=null;lastDrop?.classList.remove('drop-target');lastDrop=null;if(drag)cells[drag.index].classList.remove('drag-origin');drag=null;}
board.addEventListener('pointerup',event=>{
  if(!drag||drag.pointer!==event.pointerId)return;
  const {index,started}=drag;
  if(started){suppressClickUntil=performance.now()+450;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('#board [data-cell]');
    cleanupDrag();if(target){const to=Number(target.dataset.cell),r=act(s=>E.move(s,index,to));if(r.ok){selected=to;renderBoard();renderSelection();}}}
  else {cleanupDrag();suppressClickUntil=performance.now()+350;choose(index);}
});
board.addEventListener('pointercancel',cleanupDrag);
board.addEventListener('lostpointercapture',()=>{if(drag)cleanupDrag();});
board.addEventListener('click',event=>{if(performance.now()<suppressClickUntil&&event.detail!==0){suppressClickUntil=0;return;}const cell=event.target.closest('[data-cell]');if(cell)choose(Number(cell.dataset.cell));});
board.addEventListener('contextmenu',event=>event.preventDefault());
board.addEventListener('keydown',event=>{
  const index=Number(event.target.closest('[data-cell]')?.dataset.cell);if(!Number.isInteger(index))return;
  const offsets={ArrowRight:1,ArrowLeft:-1,ArrowDown:7,ArrowUp:-7};
  if(offsets[event.key]){event.preventDefault();cells[Math.max(0,Math.min(SIZE-1,index+offsets[event.key]))].focus();}
  if(event.key==='Escape'){selected=null;renderBoard();renderSelection();}
});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
function offlineStatus() {
  $('#offline-status').textContent=offlineReady?`${navigator.onLine?'离线已就绪':'正在离线游玩'} · ${saveAvailable?'本机自动存档':'请手动导出存档'}`:'本机存档 · 离线资源尚未就绪';
  if(currentView==='settings')renderModal();
}
if('serviceWorker' in navigator && (location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))) {
  navigator.serviceWorker.register('./sw.js').then(async()=>{
    await navigator.serviceWorker.ready;
    const cached=await caches.match(new URL('./index.html',location.href).href);
    offlineReady=!!cached;offlineStatus();
  }).catch(()=>{offlineStatus();toast('离线资源暂未准备好，请联网后重新打开邮局');});
} else {$('#offline-status').textContent='请通过 localhost 或 HTTPS 打开，以启用离线安装';}
window.addEventListener('online',offlineStatus);window.addEventListener('offline',offlineStatus);
render();
if(corruption){saveStatus('存档需要恢复，原始数据未被覆盖',true);openModal('corrupt');}
else if(!state.welcomed)openModal('welcome');
else saveStatus(saveAvailable?'进度已保存在本机':'请导出存档，自动保存不可用',!saveAvailable);
if(loadMessage)setTimeout(()=>toast(loadMessage),700);
if(!readOnly)scheduleSave();
