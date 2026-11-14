import {GENERATORS} from './data.js';
import {ITEM_ILLUSTRATIONS} from './item-illustrations.js';
const wrap=(body,cls='',view='0 0 64 64')=>`<svg class="${cls}" viewBox="${view}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
const line='stroke="#665c4d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
export function icon(name,cls='ui-icon') {
  const paths={
    leaf:'<path d="M19 4C8 3 3 8 5 15c7 5 15-2 14-11ZM5 20 15 9"/>',
    stamp:'<path d="M5 3h14v18H5z" stroke-dasharray="2 2"/><path d="m8 13 4-6 4 6-4 4z"/>',
    parts:'<path d="m9 3-1 3-3 1-2 4 2 4 3 1 1 3h6l1-3 3-1 2-4-2-4-3-1-1-3z"/><circle cx="12" cy="11" r="3"/>',
    book:'<path d="M3 5c4-2 6-1 9 1 3-2 5-3 9-1v14c-4-2-6-1-9 1-3-2-5-3-9-1zM12 6v14"/>',
    bag:'<path d="M5 8h14l1 12H4zM9 8V5a3 3 0 0 1 6 0v3M8 13h8"/>',
    settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/>',
    undo:'<path d="m8 4-5 5 5 5M3 9h10a6 6 0 0 1 0 12"/>',
    tidy:'<path d="m8 3 1 4 4 1-4 1-1 4-1-4-4-1 4-1zM17 12l1 3 3 1-3 1-1 4-1-4-3-1 3-1z"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    refresh:'<path d="M20 10a8 8 0 0 0-14-5L3 8m0-5v5h5M4 14a8 8 0 0 0 14 5l3-3m0 5v-5h-5"/>',
    map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/>',
    heart:'<path d="M12 20C-4 10 6 0 12 7c6-7 16 3 0 13Z"/>',
    sound:'<path d="m4 9 5 0 5-5v16l-5-5H4zM18 8c3 2 3 6 0 8"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    cloud:'<path d="M6 18a5 5 0 1 1 0-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1-1 11H6Z"/>',
    recycle:'<path d="m8 7 4-5 4 5m-4-5v7M19 10l3 6-6 1m6-1-7-4M7 20l-6-1 2-6m-2 6 7-4"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/>',
    star:'<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z"/>',
    home:'<path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7"/>'
  };
  return wrap(`<g stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.leaf}</g>`,cls,'0 0 24 24');
}
export function itemArt(c,l=1,cls='item-art') {
  const body=ITEM_ILLUSTRATIONS[c]?.[l-1]||'';
  return wrap(`<ellipse cx="32" cy="57" rx="20" ry="3" fill="#69563d" opacity=".08"/><g ${line}>${body}</g>${l===7?'<path d="m51 2 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z" fill="#cda75b"/>':''}`,cls);
}
export function generatorArt(id,cls='generator-art') {
  const g=GENERATORS.find(g=>g.id===id);let body='';
  if(id==='post')body='<path d="M17 21c-7-18 32-22 29-1" stroke-width="4"/><path d="m12 18 40 0 4 36-47 1z" fill="#7f9d91"/><path d="M11 18h43l-5 21-17 6-19-6z" fill="#abc0a6"/><path d="M26 34h12v13H26z" fill="#c9ab70"/><path d="m23 18 2-11 20 3-1 8" fill="#f4e6c8"/><path d="m27 10 6 7 9-4"/>';
  else if(id==='bench')body='<path d="M25 20V9h15v11" stroke-width="4"/><path d="m12 24-2 30h44l-3-30z" fill="#bc9262"/><path d="M9 22h46v13H9z" fill="#d7b17b"/><path d="M28 28h9v13h-9z" fill="#87968a"/><path d="m16 22 2-13 6 1-1 12M43 22l-3-14 6-2 4 16" fill="#8c9c97"/>';
  else if(id==='garden')body='<path d="M13 35h39l-6 22H18z" fill="#bb8b71"/><path d="M10 31h45v9H10z" fill="#d4aa87"/><path d="M31 32V17M30 28 20 15M33 29l12-12"/><path d="M29 24C12 23 9 12 16 9c13 0 15 8 13 15Z" fill="#9fb47f"/><path d="M33 26C33 9 49 6 52 12c2 13-11 17-19 14Z" fill="#77956a"/><path d="M30 17c-9-15 5-20 9-12 4 9-3 14-9 12Z" fill="#b5c58e"/>';
  else if(id==='kitchen')body='<path d="M12 18h41v38H12z" fill="#c99f7e"/><path d="M10 13h45v12H10z" fill="#e0bb8b"/><rect x="19" y="31" width="27" height="19" rx="7" fill="#756f62"/><path d="M23 45c1-15 19-15 19 0z" fill="#e4b571"/><circle cx="19" cy="20" r="2" fill="#5b796f"/><circle cx="45" cy="20" r="2" fill="#5b796f"/><path d="M25 9c-5-5 3-5 0-9M38 9c-5-5 3-5 0-9"/>';
  else if(id==='scope')body='<path d="m14 41 1 15h37l1-15z" fill="#8699aa"/><path d="M23 41 35 21l13 20M35 22v20"/><path d="m11 18 31-12 7 15-32 11z" fill="#cbb581"/><ellipse cx="45" cy="13" rx="6" ry="9" transform="rotate(-25 45 13)" fill="#a8c7ce"/><path d="M29 46h10v6H29z" fill="#d8c18c"/>';
  else body='<path d="M12 8h7v48h-7zM45 8h7v48h-7zM12 12h40M12 45h40" fill="#baa078"/><path d="M20 18h24v26H20z" fill="#bba2b2"/><path d="M25 17v27M32 17v27M39 17v27M20 24h24M20 32h24M20 39h24" stroke="#e4c6c6"/><path d="m7 23 47 12 3-5L9 18z" fill="#d7b88a"/>';
  return wrap(`<ellipse cx="32" cy="57" rx="23" ry="3" fill="#69563d" opacity=".1"/><g ${line}>${body}</g>`,cls);
}
export function avatar(type='bird',cls='avatar') {
  const colors={bird:'#b6c8b1',bunny:'#d9c5b3',bear:'#c6a883',fox:'#d3a078',cat:'#b7b0bc',owl:'#bdba9e'};
  const ears=type==='bunny'?'<ellipse cx="24" cy="17" rx="6" ry="15"/><ellipse cx="41" cy="17" rx="6" ry="15"/>':type==='cat'||type==='fox'?'<path d="m13 29 2-19 16 12M35 21 51 10l1 22"/>':type==='bear'?'<circle cx="17" cy="22" r="9"/><circle cx="47" cy="22" r="9"/>':'';
  return wrap(`<circle cx="32" cy="32" r="31" fill="#eee5d3"/><g ${line} fill="${colors[type]||colors.bird}">${ears}<ellipse cx="32" cy="37" rx="22" ry="23"/></g><ellipse cx="32" cy="44" rx="14" ry="12" fill="#f2e5cd"/><circle cx="24" cy="34" r="2" fill="#665c4d"/><circle cx="41" cy="34" r="2" fill="#665c4d"/><path d="m29 41 4 4 4-4" stroke="#665c4d" stroke-linecap="round"/><path d="m32 39 3-2 3 2-3 3z" fill="#aa7a5e"/><path d="m18 53 14 8 16-10" fill="#789891"/>`,cls);
}
export function scene(chapter=0,built=0,cls='island-scene') {
  const palettes=[['#c4d8ce','#a7bc8e','#b7755d'],['#ccd9b9','#8fa87b','#aa8e66'],['#e4d5b0','#b1b480','#c29265'],['#c6cedb','#a7b4c1','#808eaa'],['#dbced6','#a5b3a1','#ab8c9c'],['#c3d8dc','#9bbaae','#7e9fa9']];
  const [sky,ground,roof]=palettes[chapter];
  return wrap(`<defs><linearGradient id="sky${chapter}" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="#f3eedf"/></linearGradient></defs>
  <rect width="360" height="320" rx="100" fill="url(#sky${chapter})"/>
  <circle cx="278" cy="65" r="28" fill="#f9e5b9" opacity=".85"/>
  <g fill="#fff9eb" opacity=".75"><path d="M14 82c2-13 18-16 25-7 8-21 39-18 42 2 19-2 25 14 17 19H11Z"/><path d="M235 118c4-14 21-16 27-7 12-23 37-18 41 2 16-1 22 10 20 16h-91Z"/></g>
  <path d="m37 244 59 51 138 17 85-68" fill="#b8ad91"/><path d="m73 251 40 42 100 6 44-42" fill="#c8bc9a"/><path d="m117 282 14 28M224 278l-15 37" stroke="#9a997e" stroke-width="2"/>
  <ellipse cx="178" cy="241" rx="145" ry="29" fill="${ground}"/><path d="M75 243c53-17 105-2 171-6" stroke="#e1d3af" stroke-width="19" stroke-linecap="round"/>
  <g stroke="#6d7061" stroke-width="2" stroke-linejoin="round">
  <path d="M94 128h150v112H94z" fill="#f3e5c6"/><path d="M106 136h125v10H106" fill="#dcc6a0"/>
  <path d="m74 132 91-79 96 79z" fill="${roof}"/><path d="m91 126 75-62 77 62" stroke="#efc7a6"/><path d="M205 54h21v47h-21z" fill="#d5ba93"/><path d="M201 53h29v10h-29z" fill="#ead6b2"/>
  <path d="M151 174c0-29 39-29 39 0v66h-39z" fill="#73958b"/><path d="M158 176h24v30h-24z" fill="${built>0?'#ecd49a':'#bdc9ae'}"/><circle cx="181" cy="215" r="2" fill="#ead6ac"/>
  <path d="M106 158h31v39h-31zM202 158h29v39h-29z" fill="${built>1?'#edd59a':'#b9cfc5'}"/><path d="M122 158v39m-16-20h31M216 158v39m-14-20h29"/><path d="M102 200h39v7h-39zM198 200h37v7h-37z" fill="#b79168"/>
  <path d="M119 142h99v16h-99z" fill="#efe2be"/><path d="M167 102v20m-10-10h20" stroke="#edd8b5"/>
  <path d="M61 210v40M49 199h28v23H49z" fill="#a67059"/><path d="M47 199c0-18 32-18 32 0z" fill="#c38d71"/><path d="M55 205h16"/>
  <path d="M267 143v105" stroke="#9b805c" stroke-width="4"/><path d="m267 145 43 10-43 16z" fill="${built>2?'#769d98':'#e0cda8'}"/>
  </g><text x="168" y="154" text-anchor="middle" font-family="serif" font-size="10" letter-spacing="4" fill="#687d70">CLOUD POST</text>
  <g fill="#78936a"><ellipse cx="82" cy="228" rx="17" ry="14"/><ellipse cx="245" cy="235" rx="18" ry="12"/><ellipse cx="285" cy="235" rx="13" ry="10"/></g><g fill="#e5c58d"><circle cx="76" cy="222" r="3"/><circle cx="87" cy="230" r="3"/><circle cx="242" cy="229" r="3"/><circle cx="251" cy="235" r="3"/></g>
  ${chapter===3?'<g fill="#f5e5b1"><path d="m50 45 3 8 8 2-8 3-3 8-3-8-8-3 8-2zM240 30l2 5 5 1-5 2-2 5-1-5-5-2 5-1z"/></g>':''}
  ${chapter===5?'<path d="M68 140c-25-30-44-9-39 9 4 16 34 17 48 2l12-5-9-6-1-12z" fill="#8daeb6"/><circle cx="39" cy="143" r="2" fill="#566f77"/>':''}
  <g fill="#fff9eb" opacity=".8"><path d="M0 274c14-19 36-9 41 0 12-12 33-6 34 9 19-8 44 6 39 20H0Z"/><path d="M258 285c1-18 26-25 37-9 14-21 37-12 40 2 14-5 29 3 32 14v28H253Z"/></g>`,cls,'0 0 360 320');
}
