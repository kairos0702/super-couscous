const photo = document.querySelector('#photo');
const welcome = document.querySelector('#welcome');
const file = document.querySelector('#file');
const status = document.querySelector('#status');
let activeURL;
const database = new Promise((resolve, reject) => {
  const request = indexedDB.open('one-picture', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('settings');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
// Attach a handler immediately even if the first interaction occurs much later.
database.catch(() => {});
async function readImage() {
  const db = await database;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const request = tx.objectStore('settings').get('image');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveImage(blob) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put(blob, 'image');
    tx.oncomplete = resolve;
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}
function matchTopColor() {
  if (!photo.naturalWidth) return;
  try {
    const scale = Math.max(innerWidth / photo.naturalWidth, innerHeight / photo.naturalHeight);
    const sourceWidth = innerWidth / scale;
    const sourceHeight = innerHeight / scale;
    const canvas = document.createElement('canvas');
    canvas.width = 24; canvas.height = 1;
    const context = canvas.getContext('2d', {willReadFrequently:true});
    context.drawImage(photo, (photo.naturalWidth-sourceWidth)/2, (photo.naturalHeight-sourceHeight)/2, sourceWidth, Math.min(8/scale,sourceHeight), 0, 0, 24, 1);
    const pixels = context.getImageData(0,0,24,1).data;
    const sum = [0,0,0];
    for (let i=0; i<pixels.length; i+=4) for(let c=0;c<3;c++) sum[c] += pixels[i+c];
    const rgb = sum.map(value => Math.round(value/24));
    const color = `rgb(${rgb.join(',')})`;
    document.querySelector('meta[name="theme-color"]').content = color;
    document.body.style.backgroundColor = color;
  } catch { /* The picture remains visible if color sampling is unsupported. */ }
}
async function showImage(blob) {
  const url = URL.createObjectURL(blob);
  const check = new Image();
  check.src = url;
  try { await check.decode(); } catch (error) { URL.revokeObjectURL(url); throw error; }
  const previousURL = activeURL;
  photo.src = url;
  await photo.decode();
  activeURL = url;
  if (previousURL) URL.revokeObjectURL(previousURL);
  photo.hidden = false;
  welcome.hidden = true;
  matchTopColor();
}
document.querySelector('#choose').onclick = () => file.click();
photo.addEventListener('dblclick', () => file.click());
photo.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('resize', matchTopColor);
file.addEventListener('change', async () => {
  const selected = file.files[0];
  if (!selected) return;
  file.value = '';
  try { await showImage(selected); }
  catch { alert('这张图片暂时无法读取，请换一张 JPG、PNG 或 WebP 图片。'); return; }
  try {
    await saveImage(selected);
    navigator.storage?.persist?.().catch(() => {});
  } catch { alert('图片已经显示，但本机保存失败。下次打开需要重新选图。'); }
});
readImage().then(blob => blob && showImage(blob)).catch(() => {
  status.textContent = '无法读取已保存的图片，请重新选择。';
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
