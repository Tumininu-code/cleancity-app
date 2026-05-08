// CleanCity — Supabase Configuration with offline caching
// Student: Olumutimi Jesutumininu | MIVA Open University 2026

const SUPABASE_URL = 'https://cocluklurjizznsazjsw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvY2x1a2x1cmppenpuc2F6anN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzAyMjksImV4cCI6MjA5MzM0NjIyOX0.amhwLtxwhNOgUIKuzUawqE34ug9GvEmitdrR-c27VUY';

const supabase = {
  async signUp(email, password, fullName) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.user) {
      await supabase.createProfile(data.user.id, email, fullName, 'citizen', data.access_token);
    }
    return data;
  },

  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async createProfile(userId, email, fullName, role, token) {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ id: userId, email, full_name: fullName, role })
    });
  },

  async getProfile(userId, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data[0] || null;
  },

  async insertReport(report, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(report)
    });
    const data = await res.json();
    const saved = data[0] || null;
    // Update cache after successful insert
    if (saved) {
      const cached = JSON.parse(localStorage.getItem('cc_cached_reports') || '[]');
      cached.unshift(saved);
      localStorage.setItem('cc_cached_reports', JSON.stringify(cached.slice(0, 50)));
    }
    return saved;
  },

  // Get all reports with offline cache fallback
  async getReports(token) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*&order=created_at.desc`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      // Cache fresh data
      localStorage.setItem('cc_cached_reports', JSON.stringify(data));
      localStorage.setItem('cc_cached_at', Date.now().toString());
      return data;
    } catch(e) {
      // Return cached data if offline
      const cached = localStorage.getItem('cc_cached_reports');
      if (cached) {
        console.log('Using cached reports (offline)');
        return JSON.parse(cached);
      }
      throw e;
    }
  },

  // Get user reports with offline cache
  async getMyReports(userId, token) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/reports?user_id=eq.${userId}&select=*&order=created_at.desc`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      localStorage.setItem('cc_cached_my_reports', JSON.stringify(data));
      return data;
    } catch(e) {
      const cached = localStorage.getItem('cc_cached_my_reports');
      if (cached) return JSON.parse(cached);
      throw e;
    }
  },

  async updateReportStatus(reportId, status, token) {
    await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ status })
    });
    // Update cache
    const cached = JSON.parse(localStorage.getItem('cc_cached_reports') || '[]');
    const updated = cached.map(r => r.id === reportId ? { ...r, status } : r);
    localStorage.setItem('cc_cached_reports', JSON.stringify(updated));
  },

  async uploadImage(file, token) {
    const fileName = `report_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/reports/${fileName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: file
    });
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/reports/${fileName}`;
    }
    return null;
  }
};
