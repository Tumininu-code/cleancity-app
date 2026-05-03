// CleanCity — Supabase Configuration
// Student: Olumutimi Jesutumininu | MIVA Open University 2026

const SUPABASE_URL = 'https://cocluklurjizznsazjsw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvY2x1a2x1cmppenpuc2F6anN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzAyMjksImV4cCI6MjA5MzM0NjIyOX0.amhwLtxwhNOgUIKuzUawqE34ug9GvEmitdrR-c27VUY';

// Supabase REST API helper
const supabase = {
  // Auth: Sign up
  async signUp(email, password, fullName) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.user) {
      // Create profile
      await supabase.createProfile(data.user.id, email, fullName, 'citizen', data.access_token);
    }
    return data;
  },

  // Auth: Sign in
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  // Create profile after signup
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

  // Get profile by user ID
  async getProfile(userId, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return data[0] || null;
  },

  // Insert report
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
    return data[0] || null;
  },

  // Get all reports
  async getReports(token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },

  // Get reports by user
  async getMyReports(userId, token) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reports?user_id=eq.${userId}&select=*&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },

  // Update report status
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
  },

  // Upload image to storage
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
