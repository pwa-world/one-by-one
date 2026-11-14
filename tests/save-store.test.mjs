import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,move,decodeSave,encodeSave} from '../dist/engine.js';
import {persistState,SAVE_KEY,BACKUP_KEY} from '../dist/save-store.js';
const storage=()=>{const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
test('reload and pagehide flushes keep the last distinct backup, not a duplicate',()=>{
  const disk=storage(),state=newGame(123);
  const initial=persistState(disk,state,{now:1000});
  move(state,16,17);
  const changed=persistState(disk,state,{expected:initial.raw,now:2000});
  assert.equal(decodeSave(disk.getItem(BACKUP_KEY)).stats.merges,0);
  for(let i=0;i<5;i++){
    const restored=decodeSave(changed.raw);
    assert.equal(persistState(disk,restored,{expected:changed.raw,now:3000+i}).changed,false);
    assert.equal(restored.savedAt,2000);
  }
  assert.equal(decodeSave(disk.getItem(BACKUP_KEY)).stats.merges,0);
  assert.equal(decodeSave(disk.getItem(SAVE_KEY)).stats.merges,1);
});
test('restoring the backup recovers the board and preserves a way to return to the newer state',()=>{
  const disk=storage(),state=newGame(1);const a=persistState(disk,state);
  move(state,16,17);const b=persistState(disk,state,{expected:a.raw});
  const previous=decodeSave(disk.getItem(BACKUP_KEY));
  const result=persistState(disk,previous,{force:true,expected:b.raw});
  assert.equal(result.changed,true);assert.equal(decodeSave(disk.getItem(SAVE_KEY)).stats.merges,0);
  assert.equal(decodeSave(disk.getItem(BACKUP_KEY)).stats.merges,1);
});
test('repairing a corrupt main never overwrites a valid backup with corrupt data',()=>{
  const disk=storage(),state=newGame(2),good=encodeSave(state);disk.setItem(SAVE_KEY,'broken');disk.setItem(BACKUP_KEY,good);
  persistState(disk,state,{expected:'broken'});
  assert.equal(disk.getItem(BACKUP_KEY),good);assert.doesNotThrow(()=>decodeSave(disk.getItem(SAVE_KEY)));
});
test('concurrent writes are refused before backup or main save changes',()=>{
  const disk=storage(),state=newGame(3),a=persistState(disk,state);
  const other=structuredClone(state);other.coins+=10;persistState(disk,other,{expected:a.raw});
  const before=[...disk.data];move(state,16,17);
  assert.deepEqual(persistState(disk,state,{expected:a.raw}),{ok:false,conflict:true});assert.deepEqual([...disk.data],before);
});
test('failed writes keep the last saved timestamp and valid on-disk state',()=>{
  const disk=storage(),state=newGame(4),a=persistState(disk,state,{now:123});
  move(state,16,17);const write=disk.setItem;disk.setItem=(k,v)=>{if(k===SAVE_KEY)throw new Error('quota');write(k,v);};
  assert.throws(()=>persistState(disk,state,{expected:a.raw,now:456}));assert.equal(state.savedAt,123);
  assert.equal(decodeSave(disk.getItem(SAVE_KEY)).stats.merges,0);
});
test('a backup quota error does not prevent saving current progress if the main slot is writable',()=>{
  const disk=storage(),state=newGame(5),a=persistState(disk,state);move(state,16,17);
  const write=disk.setItem;disk.setItem=(k,v)=>{if(k===BACKUP_KEY)throw new Error('quota');write(k,v);};
  const result=persistState(disk,state,{expected:a.raw});assert.equal(result.backupFailed,true);
  assert.equal(decodeSave(disk.getItem(SAVE_KEY)).stats.merges,1);
});
test('tap selection changes never swap unrelated items; deliberate dragging still swaps',async()=>{
  const {tapIntent}=await import('../dist/engine.js');const state=newGame(123);move(state,16,17);
  const before=encodeSave(state),intent=tapIntent(state,17,23);
  assert.deepEqual(intent,{kind:'select',index:23});assert.equal(encodeSave(state),before);
  const merge=tapIntent(state,intent.index,24);assert.equal(merge.kind,'move');
  move(state,merge.from,merge.index);assert.deepEqual(state.board[24],{c:'wood',l:2});assert.deepEqual(state.board[17],{c:'paper',l:2});
  assert.equal(move(state,17,24).kind,'swap');assert.deepEqual(state.board[17],{c:'wood',l:2});
});
test('tap empty cell moves selected item and tapping selected cell deselects',async()=>{
  const {tapIntent}=await import('../dist/engine.js');const state=newGame(6);
  assert.deepEqual(tapIntent(state,16,16),{kind:'select',index:null});
  assert.deepEqual(tapIntent(state,16,1),{kind:'move',from:16,index:1});
  assert.equal(tapIntent(state,16,0).kind,'generate');
});
