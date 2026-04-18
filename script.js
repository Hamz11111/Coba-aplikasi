/* ===========================
   LOMBA KEMERDEKAAN DIGITAL
   JavaScript — Karang Taruna
   =========================== */

'use strict';

// ============================================================
// STATE
// ============================================================

const data = {
  futsal: [],
  basket: []
};

let scores = { A: 0, B: 0 };
let activeTab = 'futsal';

// ============================================================
// TAB NAVIGATION
// ============================================================

function switchTab(sport) {
  // Deactivate all sections & tabs
  document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  // Activate selected
  document.getElementById(sport).classList.add('active');
  document.getElementById('tab-' + sport).classList.add('active');

  activeTab = sport;
}

// ============================================================
// ADD TEAM
// ============================================================

function addTeam(sport) {
  const nameInput    = document.getElementById(sport + '-team-name');
  const playersInput = document.getElementById(sport + '-players');

  const teamName = nameInput.value.trim();
  const players  = playersInput.value.trim();

  // Validasi input
  if (!teamName) {
    showToast('⚠️ Nama tim tidak boleh kosong!');
    nameInput.focus();
    return;
  }

  // Cek duplikat (case-insensitive)
  const isDuplicate = data[sport].some(
    t => t.name.toLowerCase() === teamName.toLowerCase()
  );
  if (isDuplicate) {
    showToast('⚠️ Nama tim sudah terdaftar!');
    nameInput.focus();
    return;
  }

  // Push data
  data[sport].push({
    name: teamName,
    players: players || 'Belum ada pemain'
  });

  // Reset input
  nameInput.value    = '';
  playersInput.value = '';
  nameInput.focus();

  // Re-render
  renderTeams(sport);
  showToast('✅ ' + teamName + ' berhasil didaftarkan!');
}

// ============================================================
// DELETE TEAM
// ============================================================

function deleteTeam(sport, index) {
  const removed = data[sport].splice(index, 1);
  renderTeams(sport);
  // Hapus bracket lama
  document.getElementById(sport + '-bracket').innerHTML =
    '<p class="empty-msg">Tambahkan tim lalu klik "Buat Bagan Acak"</p>';
  showToast('🗑️ ' + removed[0].name + ' dihapus');
}

// ============================================================
// RENDER TEAMS
// ============================================================

function renderTeams(sport) {
  const list  = document.getElementById(sport + '-team-list');
  const count = document.getElementById(sport + '-count');
  const teams = data[sport];

  count.textContent = teams.length + ' Tim';

  if (teams.length === 0) {
    list.innerHTML = '';
    return;
  }

  list.innerHTML = teams.map((team, i) => `
    <div class="team-card">
      <div class="team-number">${i + 1}</div>
      <div class="team-info">
        <strong>${escapeHtml(team.name)}</strong>
        <span>👤 ${escapeHtml(team.players)}</span>
      </div>
      <button class="btn-delete" onclick="deleteTeam('${sport}', ${i})" title="Hapus Tim">✕</button>
    </div>
  `).join('');
}

// ============================================================
// GENERATE BRACKET
// ============================================================

function generateBracket(sport) {
  const teams = data[sport];
  const bracketEl = document.getElementById(sport + '-bracket');

  if (teams.length < 2) {
    showToast('⚠️ Minimal 2 tim diperlukan untuk membuat bagan!');
    return;
  }

  // Shuffle (Fisher-Yates)
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pairing
  const matchups = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    const teamA = shuffled[i];
    const teamB = shuffled[i + 1] || null; // null = bye
    matchups.push({ teamA, teamB });
  }

  // Render
  bracketEl.innerHTML = matchups.map((m, idx) => `
    <div class="matchup">
      <div class="matchup-team home">
        ${escapeHtml(m.teamA.name)}
      </div>
      <div class="matchup-vs">
        <span class="matchup-num">Match ${idx + 1}</span>
        ${m.teamB ? 'VS' : 'BYE'}
      </div>
      <div class="matchup-team away ${!m.teamB ? 'bye' : ''}">
        ${m.teamB ? escapeHtml(m.teamB.name) : '— Istirahat —'}
      </div>
    </div>
  `).join('');

  showToast('🎲 Bagan berhasil dibuat! ' + matchups.length + ' pertandingan');
}

// ============================================================
// SCOREBOARD
// ============================================================

function updateScore(team, amount) {
  const newScore = scores[team] + amount;

  // Prevent negative
  if (newScore < 0) {
    showToast('⚠️ Skor tidak bisa negatif!');
    return;
  }

  scores[team] = newScore;

  // Update DOM
  const el = document.getElementById('score-' + team.toLowerCase());
  el.textContent = scores[team];

  // Bump animation
  el.classList.remove('bump');
  void el.offsetWidth; // reflow trigger
  el.classList.add('bump');

  setTimeout(() => el.classList.remove('bump'), 200);
}

function resetScore() {
  scores.A = 0;
  scores.B = 0;

  document.getElementById('score-a').textContent = '0';
  document.getElementById('score-b').textContent = '0';

  showToast('↺ Skor direset');
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// ============================================================
// UTILITY
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// ENTER KEY SUPPORT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  ['futsal', 'basket'].forEach(sport => {
    const nameInput    = document.getElementById(sport + '-team-name');
    const playersInput = document.getElementById(sport + '-players');

    nameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        playersInput.focus();
      }
    });

    playersInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTeam(sport);
      }
    });
  });
});
