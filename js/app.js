// CleanCity — Core App Logic
// Student: Olumutimi Jesutumininu | MIVA Open University 2026

const BACKEND_URL = 'https://cleancity-server.onrender.com';

function generateReportId() {
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `CC-2026-${num}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaType(file) {
  const types = { 'image/jpeg': 'image/jpeg', 'image/png': 'image/png', 'image/gif': 'image/gif', 'image/webp': 'image/webp' };
  return types[file.type] || 'image/jpeg';
}

// AI: Analyze image via secure backend server
async function analyzeImageWithAI(file) {
  const base64 = await fileToBase64(file);
  const mediaType = getMediaType(file);
  const locationText = localStorage.getItem('cc_last_location') || 'Lagos, Nigeria';

  const response = await fetch(`${BACKEND_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mimeType: mediaType, location: locationText })
  });

  const data = await response.json();

  // Handle image rejection (irrelevant content)
  if (response.status === 422 && data.rejected) {
    const err = new Error(data.reason || 'Image not relevant to environmental issues');
    err.rejected = true;
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return data;
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 6.5244, lng: 3.3792, text: 'Lagos, Nigeria' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        text: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
      }),
      () => resolve({ lat: 6.5244, lng: 3.3792, text: 'Lagos, Nigeria' }),
      { timeout: 8000 }
    );
  });
}

function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function statusBadge(status) {
  const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved' };
  return map[status] || 'badge-pending';
}

function sevBadge(sev) {
  const map = { 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };
  return map[sev] || 'badge-medium';
}

function nextStatus(current) {
  const map = { 'Pending': 'In Progress', 'In Progress': 'Resolved', 'Resolved': 'Resolved' };
  return map[current] || 'Resolved';
}

function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// Cache helpers - basic offline caching
function cacheReports(reports) {
  try {
    localStorage.setItem('cc_cached_reports', JSON.stringify(reports));
    localStorage.setItem('cc_cached_at', Date.now().toString());
  } catch(e) {}
}

function getCachedReports() {
  try {
    const cached = localStorage.getItem('cc_cached_reports');
    return cached ? JSON.parse(cached) : null;
  } catch(e) { return null; }
}

function isOnline() {
  return navigator.onLine;
}

function getToken() { return localStorage.getItem('cc_token'); }
function getUserId() { return localStorage.getItem('cc_user_id'); }
function getUserName() { return localStorage.getItem('cc_name') || 'User'; }
function getUserRole() { return localStorage.getItem('cc_role') || 'citizen'; }
