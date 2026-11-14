import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAINS} from '../dist/data.js';
import {itemArt} from '../dist/art.js';
import {ITEM_ILLUSTRATIONS} from '../dist/item-illustrations.js';

// Ignore colours, transforms, and the level-seven ornament: a palette change,
// rotation or badge alone must not make a reused item pass this regression.
const geometry=svg=>(svg.match(/<(?:path|circle|ellipse|rect)\b[^>]*>/g)||[])
  .map(s=>s.replace(/\s(?:fill|stroke(?:-[\w-]+)?|opacity|transform)="[^"]*"/g,'')).join('');
test('all 84 named items have distinct underlying drawings, including every first/second level',()=>{
  const seen=new Map();
  assert.deepEqual(Object.keys(ITEM_ILLUSTRATIONS),Object.keys(CHAINS));
  for(const [chain,{names}] of Object.entries(CHAINS)){
    assert.equal(ITEM_ILLUSTRATIONS[chain].length,names.length);
    names.forEach((name,index)=>{
      const shape=geometry(ITEM_ILLUSTRATIONS[chain][index]);
      assert.ok(shape,`${name} must have a drawing`);
      assert.ok(!seen.has(shape),`${name} reuses ${seen.get(shape)}`);
      seen.set(shape,name);
    });
  }
  assert.equal(seen.size,84);
});
test('board, orders and collection use the same self-contained artwork at any display size',()=>{
  for(const [chain,{names}] of Object.entries(CHAINS))names.forEach((_,i)=>{
    const svg=itemArt(chain,i+1);
    assert.ok(svg.includes(ITEM_ILLUSTRATIONS[chain][i]));
    assert.match(svg,/viewBox="0 0 64 64"/);
    assert.doesNotMatch(svg,/undefined|NaN|<(?:image|script|foreignObject)\b|(?:href=|url\()/);
    assert.equal(itemArt(chain,i+1,'preview').replace('class="preview"','class="item-art"'),svg);
  });
});
