// app.js – client logic for UV Safari PWA
import { BareMuxConnection } from 'https://esm.sh/@mercuryworkshop/bare-mux@latest';
import { epoxyDecode, epoxyEncode } from 'https://esm.sh/@mercuryworkshop/epoxy-transport@latest';

// Adjust these to your deployment
const BARE_SERVER = 'https://your-bare-server.example.com/'; // ← REQUIRED: public bare or epoxy endpoint
const UV_PREFIX = '/uv/service/'; // must match sw.js prefix

let connection;

// Initialize bare-mux + Epoxy (modern encrypted transport)
async function initBareMux() {
  connection = new BareMuxConnection('/bare-mux-worker.js'); // we'll create a tiny worker file or inline if needed
  await connection.setTransport('EpxoyTransport', [epoxyEncode, epoxyDecode]);
  console.log('BareMux + Epoxy ready');
}

// Simple URL normalizer
function normalizeUrl(input) {
  input = input.trim();
  if (!input) return '';
  if (input.includes(' ')) input = 'https://www.google.com/search?q=' + encodeURIComponent(input);
  if (!/^https?:\/\//i.test(input)) input = 'https://' + input;
  return input;
}

// Encode URL for UV prefix
function toProxiedUrl(url) {
  if (!url) return '';
  const encoded = encodeURIComponent(url);
  return UV_PREFIX + encoded; // simple xor/base64 handled by UV internally
}

const frame = document.getElementById('proxy-frame');
const urlbar = document.getElementById('urlbar');
const goBtn = document.getElementById('go');
const backBtn = document.getElementById('back');
const forwardBtn = document.getElementById('forward');
const refreshBtn = document.getElementById('refresh');
const errorEl = document.getElementById('error-message');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.classList.remove('hidden');
  setTimeout(() => errorEl.classList.add('hidden'), 5000);
}

function loadPage(url) {
  try {
    const safeUrl = normalizeUrl(url);
    if (!safeUrl) return;
    urlbar.value = safeUrl;
    frame.src = toProxiedUrl(safeUrl);
  } catch (err) {
    showError('Invalid URL or proxy error');
  }
}

goBtn.onclick = () => loadPage(urlbar.value);

urlbar.addEventListener('keydown', e => {
  if (e.key === 'Enter') loadPage(urlbar.value);
});

backBtn.onclick = () => frame.contentWindow.history.back();
forwardBtn.onclick = () => frame.contentWindow.history.forward();
refreshBtn.onclick = () => frame.contentWindow.location.reload();

// Update nav buttons state
frame.addEventListener('load', () => {
  try {
    backBtn.disabled = !frame.contentWindow.history.length || frame.contentWindow.history.current === 0;
    forwardBtn.disabled = frame.contentWindow.history.current >= frame.contentWindow.history.length - 1;
  } catch {}
});

frame.addEventListener('error', () => showError('Failed to load page – check connection or URL'));

// Start bare mux
initBareMux().catch(console.error);

// Optional: initial page (Google or blank)
loadPage('https://google.com');
