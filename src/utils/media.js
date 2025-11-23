export function cleanUrl(u) {
  const str = (u || '').toString().trim()
  return str
    .replace(/^`+|`+$/g, '')
    .replace(/\\`/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim()
}

export function isGenerateFailed(u) {
  const s = (u || '').toString().trim()
  if (!s) return false
  return /失败|fail|error/i.test(s)
}

export function shouldRenderImage(u) {
  const url = cleanUrl(u)
  return !!url && !isGenerateFailed(url)
}

const DB_NAME = 'VedioGenFS'
const STORE = 'dirs'
function openDB(){return new Promise((resolve,reject)=>{try{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)}catch(e){reject(e)}})}
async function idbGet(key){try{const db=await openDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const st=tx.objectStore(STORE);const rq=st.get(key);rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>reject(rq.error)})}catch(e){return null}}
async function idbPut(key,val){try{const db=await openDB();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');const st=tx.objectStore(STORE);const rq=st.put(val,key);rq.onsuccess=()=>resolve(true);rq.onerror=()=>reject(rq.error)})}catch(e){return false}}
async function getDir(videoId){if(!window || !window.showDirectoryPicker) return null;let h=await idbGet(String(videoId));try{if(h && h.requestPermission){const p=await h.requestPermission({mode:'readwrite'});if(p!=='granted') h=null}}catch(e){h=null}if(!h){try{const root=await window.showDirectoryPicker();h=await root.getDirectoryHandle(String(videoId),{create:true});await idbPut(String(videoId),h)}catch(e){h=null}}return h}
function sanitizeName(u){try{const s=cleanUrl(u);const m=s.split('?')[0];const arr=m.split('/');let name=arr[arr.length-1]||'file';return name.replace(/[^a-zA-Z0-9_.-]/g,'_')}catch(e){return 'file'}}
export async function getLocalMediaUrl(videoId,url){try{const u=cleanUrl(url);if(!u) return '';const h=await getDir(videoId);if(!h) return u;const name=sanitizeName(u);let fh=null;try{fh=await h.getFileHandle(name,{create:false})}catch(e){fh=null}if(!fh){const res=await fetch(u);const blob=await res.blob();fh=await h.getFileHandle(name,{create:true});const w=await fh.createWritable();await w.write(blob);await w.close()}const f=await fh.getFile();const obj=URL.createObjectURL(f);return obj}catch(e){return cleanUrl(url)}}