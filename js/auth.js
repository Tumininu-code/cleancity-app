// CleanCity — Authentication Logic

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  const btnText = document.getElementById('loginBtnText');

  if (!email || !password) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.style.display = 'block';
    return;
  }

  btnText.innerHTML = '<span class="spinner"></span> Signing in...';
  errEl.style.display = 'none';

  try {
    const data = await supabase.signIn(email, password);
    if (data.access_token) {
      // Store session
      localStorage.setItem('cc_token', data.access_token);
      localStorage.setItem('cc_user_id', data.user.id);
      localStorage.setItem('cc_email', data.user.email);

      // Get profile to check role
      const profile = await supabase.getProfile(data.user.id, data.access_token);
      const role = profile ? profile.role : 'citizen';
      const name = profile ? profile.full_name : email.split('@')[0];

      localStorage.setItem('cc_role', role);
      localStorage.setItem('cc_name', name);

      if (role === 'admin') {
        window.location.href = 'pages/admin.html';
      } else {
        window.location.href = 'pages/home.html';
      }
    } else {
      errEl.textContent = data.error_description || 'Invalid email or password.';
      errEl.style.display = 'block';
      btnText.textContent = 'Sign In';
    }
  } catch (err) {
    errEl.textContent = 'Connection error. Please try again.';
    errEl.style.display = 'block';
    btnText.textContent = 'Sign In';
  }
}

async function handleAdminLogin() {
  document.getElementById('loginEmail').value = 'admin@cleancity.ng';
  document.getElementById('loginPassword').value = 'CleanCity@2026';
  await handleLogin();
}

async function handleRegister() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errEl = document.getElementById('registerError');
  const btnText = document.getElementById('registerBtnText');

  if (!name || !email || !password) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.style.display = 'block';
    return;
  }

  btnText.innerHTML = '<span class="spinner"></span> Creating account...';
  errEl.style.display = 'none';

  try {
    const data = await supabase.signUp(email, password, name);
    if (data.user) {
      localStorage.setItem('cc_token', data.access_token);
      localStorage.setItem('cc_user_id', data.user.id);
      localStorage.setItem('cc_email', email);
      localStorage.setItem('cc_role', 'citizen');
      localStorage.setItem('cc_name', name);
      window.location.href = 'pages/home.html';
    } else {
      errEl.textContent = data.msg || data.error_description || 'Registration failed. Try again.';
      errEl.style.display = 'block';
      btnText.textContent = 'Create Account';
    }
  } catch (err) {
    errEl.textContent = 'Connection error. Please try again.';
    errEl.style.display = 'block';
    btnText.textContent = 'Create Account';
  }
}

// Guard: redirect to login if not authenticated
function requireAuth() {
  const token = localStorage.getItem('cc_token');
  if (!token) { window.location.href = '../index.html'; return false; }
  return true;
}

function requireAdmin() {
  const token = localStorage.getItem('cc_token');
  const role = localStorage.getItem('cc_role');
  if (!token || role !== 'admin') { window.location.href = '../index.html'; return false; }
  return true;
}

function signOut() {
  localStorage.clear();
  window.location.href = '../index.html';
}
