//  API Base URLs 
const AUTH_API_BASE    = 'http://localhost:5000/api/auth';
const FOOTBALL_API_BASE = 'http://localhost:5000/api/football';

//  DOM Elements 
const eplContainer        = document.getElementById('epl-standings');
const laligaContainer     = document.getElementById('laliga-standings');
const uclContainer        = document.getElementById('ucl-standings');
const weeklyMatchesCont   = document.getElementById('weekly-matches');
const pastWeekEPLCont     = document.getElementById('past-week-epl');
const pastWeekLaLigaCont  = document.getElementById('past-week-laliga');
const liveScoreCont       = document.getElementById('live-score');

const loginForm           = document.getElementById('loginForm');
const registerForm        = document.getElementById('registerForm');
const resetForm           = document.getElementById('resetPasswordForm');
const logoutBtn           = document.getElementById('logoutBtn');
const themeToggleBtn      = document.getElementById('themeToggle');

//  Auth Helpers 
function storeToken(token)     { localStorage.setItem('token', token); }
function getToken()            { return localStorage.getItem('token'); }
function removeToken()         { localStorage.removeItem('token'); }
function redirectTo(page)      { window.location.href = page; }

//  Initialization 
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
  }
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Load football data on dashboard
  if (eplContainer)        fetchStandings('epl', eplContainer);
  if (laligaContainer)     fetchStandings('laliga', laligaContainer);
  if (uclContainer)        fetchStandings('ucl', uclContainer);
  if (weeklyMatchesCont)   fetchWeeklyMatches();
  if (pastWeekEPLCont)     fetchPastWeekScores('epl', pastWeekEPLCont);
  if (pastWeekLaLigaCont)  fetchPastWeekScores('laliga', pastWeekLaLigaCont);
  if (liveScoreCont)       fetchLiveScores();

  // Setup auth flows
  const path = window.location.pathname;
  if (path.includes('dashboard.html')) {
    protectDashboard();
  } else if (path.includes('login.html')) {
    setupLoginForm();
  } else if (path.includes('register.html')) {
    setupRegisterForm();
  } else if (path.includes('resetPassword.html')) {
    setupResetForm();
  }
});

// Football Proxy Functions 
async function fetchStandings(league, container) {
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/standings/${league}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    displayStandings(json.response[0].league.standings[0], container);
  } catch (err) {
    console.error('Standings Error:', err);
    if (err.message === 'Unauthorized') {
      removeToken();
      return redirectTo('login.html');
    }
    if (container) container.innerHTML = '<p>Error loading standings.</p>';
  }
}

function displayStandings(data, container) {
  if (!container) return;
  container.innerHTML = '';
  data.forEach(team => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
      <div>
        <img src="${team.team.logo}" alt="${team.team.name}" class="team-logo" />
        <span>${team.team.name}</span>
      </div>
      <p>Points: ${team.points}</p>
      <p>Position: ${team.rank}</p>
    `;
    container.appendChild(card);
  });
}

async function fetchWeeklyMatches() {
  if (!weeklyMatchesCont) return;
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/fixtures/weekly`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    displayMatches(json.response.slice(0, 10));
  } catch (err) {
    console.error('Weekly Matches Error:', err);
    if (err.message === 'Unauthorized') {
      removeToken();
      return redirectTo('login.html');
    }
    weeklyMatchesCont.innerHTML = '<p>Error loading matches.</p>';
  }
}

function displayMatches(matches) {
  if (!weeklyMatchesCont) return;
  weeklyMatchesCont.innerHTML = '';
  matches.forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
      <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <p>Date: ${new Date(match.fixture.date).toLocaleString()}</p>
      <p>Score: ${match.goals.home ?? 'N/A'} - ${match.goals.away ?? 'N/A'}</p>
    `;
    weeklyMatchesCont.appendChild(card);
  });
}

async function fetchPastWeekScores(league, container) {
  if (!container) return;
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/fixtures/past/${league}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    displayPastWeekScores(json.response, container);
  } catch (err) {
    console.error('Past Week Error:', err);
    if (err.message === 'Unauthorized') {
      removeToken();
      return redirectTo('login.html');
    }
    container.innerHTML = '<p>Error loading past week scores.</p>';
  }
}

function displayPastWeekScores(matches, container) {
  if (!container) return;
  container.innerHTML = '';
  if (!matches.length) {
    container.innerHTML = '<p>No past week matches.</p>';
    return;
  }
  matches.forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
      <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <p>Score: ${match.goals.home ?? '-'} - ${match.goals.away ?? '-'}</p>
      <p>Date: ${new Date(match.fixture.date).toLocaleString()}</p>
    `;
    container.appendChild(card);
  });
}

async function fetchLiveScores() {
  if (!liveScoreCont) return;
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/fixtures/live`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    displayLiveScores(json.response);
  } catch (err) {
    console.error('Live Scores Error:', err);
    if (err.message === 'Unauthorized') {
      removeToken();
      return redirectTo('login.html');
    }
    liveScoreCont.innerHTML = '<p>Error loading live scores.</p>';
  }
}

function displayLiveScores(matches) {
  if (!liveScoreCont) return;
  liveScoreCont.innerHTML = '';
  if (!matches.length) {
    liveScoreCont.innerHTML = '<p>No live matches.</p>';
    return;
  }
  matches.forEach(match => {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
      <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <p>Score: ${match.goals.home ?? '-'} - ${match.goals.away ?? '-'}</p>
      <p>Time: ${match.fixture.status.elapsed ?? 'Ongoing'}</p>
    `;
    liveScoreCont.appendChild(card);
  });
}

//  Authentication Functions 
async function handleAuthResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || data.message || 'Auth error');
    return null;
  }
  return data;
}

function setupLoginForm() {
  if (!loginForm) return;
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const identifier = document.getElementById('identifier').value;
    const password   = document.getElementById('password').value;
    const res = await fetch(`${AUTH_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await handleAuthResponse(res);
    if (data) {
      storeToken(data.token);
      localStorage.setItem('userInfo', JSON.stringify({ username: data.username, email: data.email }));
      redirectTo('dashboard.html');
    }
  });
}

function setupRegisterForm() {
  if (!registerForm) return;
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${AUTH_API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await handleAuthResponse(res);
    if (data) redirectTo('login.html');
  });
}

function setupResetForm() {
  if (!resetForm) return;
  resetForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email       = document.getElementById('email').value;
    const newPassword = document.getElementById('newPassword').value;
    const res = await fetch(`${AUTH_API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await handleAuthResponse(res);
    if (data) redirectTo('login.html');
  });
}

function protectDashboard() {
  if (logoutBtn) {
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => {
      removeToken();
      redirectTo('login.html');
    });
  }
  const token = getToken();
  if (!token) return redirectTo('login.html');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (!userInfo.username) {
    removeToken();
    return redirectTo('login.html');
  }
}

// Profile dropdown logic
(async function setupProfileNav() {
  const usernameEl = document.getElementById('usernameDisplay');
  const favSelect  = document.getElementById('favoriteTeam');
  const logoEl     = document.getElementById('favoriteLogo');
  const token      = getToken();

  // show username
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  usernameEl.textContent = `👤 ${userInfo.username || 'Guest'}`;

  // fetch existing favorite from server
  try {
    const res = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const fav = await res.json();
    if (fav.team) {
      favSelect.value = fav.team;
      logoEl.src = teamLogos[fav.team];
      logoEl.style.display = 'inline-block';
    }
  } catch (err) {
    console.error('Fav load error', err);
  }

  // on change, persist to server
  favSelect.addEventListener('change', async e => {
    const team = e.target.value;
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ team })
      });
      // then show logo
      logoEl.src = teamLogos[team];
      logoEl.style.display = 'inline-block';
    } catch (err) {
      console.error('Fav save error', err);
    }
  });
})();



(function setupProfileNav() {
  const usernameEl = document.getElementById('usernameDisplay');
  const favSelect  = document.getElementById('favoriteTeam');
  const logoEl     = document.getElementById('favoriteLogo');

  // map team names to your logo file paths
  const teamLogos = {
    'Liverpool':       'assets/liverpool.png',
    'Manchester City': 'assets/manchester.png',
    'Real Madrid':     'assets/madrid.png',
    'Barcelona':       'assets/barcelona.png',
    'PSG':             'assets/paris.png'
  };

  // show username
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (userInfo.username) {
    usernameEl.textContent = `👤 ${userInfo.username}`;
  }

  // load & display saved favorite
  const saved = localStorage.getItem('favoriteTeam');
  if (saved) {
    favSelect.value = saved;
    if (teamLogos[saved]) {
      logoEl.src = teamLogos[saved];
      logoEl.style.display = 'inline-block';
    }
  }

  // when they pick a team, save & show its logo
  favSelect.addEventListener('change', e => {
    const team = e.target.value;
    localStorage.setItem('favoriteTeam', team);
    if (teamLogos[team]) {
      logoEl.src = teamLogos[team];
      logoEl.style.display = 'inline-block';
    } else {
      logoEl.style.display = 'none';
    }
  });
})();
