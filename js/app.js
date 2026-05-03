// CleanCity — Core App Logic
// AI Classification via Claude API

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

// Generate unique report ID
function generateReportId() {
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `CC-2026-${num}`;
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Get media type
function getMediaType(file) {
  const types = { 'image/jpeg': 'image/jpeg', 'image/png': 'image/png', 'image/gif': 'image/gif', 'image/webp': 'image/webp' };
  return types[file.type] || 'image/jpeg';
}

// AI: Analyze image and write full report automatically
async function analyzeImageWithAI(file) {
  const base64 = await fileToBase64(file);
  const mediaType = getMediaType(file);

  // Get user location for context
  const locationText = localStorage.getItem('cc_last_location') || 'Lagos, Nigeria';

  const response = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 }
          },
          {
            type: 'text',
            text: `You are CleanCity's AI waste classification system for Nigerian urban areas.

Analyze this image carefully and generate a complete environmental incident report.

Respond ONLY with a valid JSON object, no other text:
{
  "category": "one of: Illegal Dumping, Waste Pileup, Blocked Drainage, Flooding, Environmental Pollution, Other",
  "confidence": number between 60-99,
  "severity": "Low, Medium, or High",
  "title": "short 4-6 word title describing the issue",
  "description": "2-3 sentence professional description of what you see in the image, written as an official environmental incident report",
  "recommended_action": "specific action LAWMA or authorities should take",
  "estimated_cleanup_time": "e.g. 2-4 hours, 1 day, etc",
  "location_context": "brief description of the environment visible in image"
}

Location context: ${locationText}
Be specific, professional, and accurate. This report will be sent to waste management authorities.`
          }
        ]
      }]
    })
  });

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Get user's current GPS coordinates
function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 6.5244, lng: 3.3792, text: 'Lagos, Nigeria' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          text: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        });
      },
      () => resolve({ lat: 6.5244, lng: 3.3792, text: 'Lagos, Nigeria' })
    );
  });
}

// Format time ago
function timeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// Status badge class
function statusBadge(status) {
  const map = { 'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Resolved': 'badge-resolved' };
  return map[status] || 'badge-pending';
}

// Severity badge class
function sevBadge(sev) {
  const map = { 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };
  return map[sev] || 'badge-medium';
}

// Next status
function nextStatus(current) {
  const map = { 'Pending': 'In Progress', 'In Progress': 'Resolved', 'Resolved': 'Resolved' };
  return map[current] || 'Resolved';
}

// Show toast notification
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

// Auth getters
function getToken() { return localStorage.getItem('cc_token'); }
function getUserId() { return localStorage.getItem('cc_user_id'); }
function getUserName() { return localStorage.getItem('cc_name') || 'User'; }
function getUserRole() { return localStorage.getItem('cc_role') || 'citizen'; }
