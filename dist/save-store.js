import {encodeSave,decodeSave,validateState} from './engine.js';
export const SAVE_KEY='cloudpost.save.v1';
export const BACKUP_KEY='cloudpost.backup.v1';
const progressOf=state=>{const {savedAt,...progress}=state;return JSON.stringify(progress);};

// A visibility change is a flush, not a new save point. Keep the previous
// distinct state available even after reloads, closing tabs and app updates.
export function persistState(storage,state,{expected=null,force=false,now=Date.now()}={}) {
  const actual=storage.getItem(SAVE_KEY);
  if(!force&&actual!==expected)return {ok:false,conflict:true};
  validateState(state);
  let previous=null;
  if(actual)try{previous=decodeSave(actual);}catch{}
  if(previous&&progressOf(previous)===progressOf(state)) {
    state.savedAt=previous.savedAt;
    return {ok:true,raw:actual,changed:false};
  }
  const next=encodeSave({...state,savedAt:now});
  let backupFailed=false;
  if(previous)try{storage.setItem(BACKUP_KEY,actual);}catch{backupFailed=true;}
  // Do not replace a known-good backup with a damaged main save.
  storage.setItem(SAVE_KEY,next);
  state.savedAt=now;
  return {ok:true,raw:next,changed:true,backupFailed};
}
