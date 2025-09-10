document.addEventListener('DOMContentLoaded', () => {
  // Estado inicial
  safeInitLocalData();
  removeLoading();

  // Inicializações
  initCountdown();
  initVoting();
  initRSVP();
  initGallery();
  initMessages();
  initAnimations();
  initParticles();

  // Firebase opcional: iniciar e sincronizar
  if (window.FirebaseSync && typeof window.FirebaseSync.init === 'function') {
    window.FirebaseSync.init()
      .then(() => window.FirebaseSync.syncExistingData && window.FirebaseSync.syncExistingData())
      .finally(() => updateFirebaseStatus());
  } else {
    setTimeout(() => updateFirebaseStatus(), 1500);
  }
});

// ========== Indicador de Status Firebase (opcional) ==========
function updateFirebaseStatus() {
  const statusDiv = document.getElementById('firebaseStatus');
  const statusIcon = document.getElementById('firebaseStatusIcon');
  const statusText = document.getElementById('firebaseStatusText');
  if (!statusDiv || !statusIcon || !statusText) return;

  statusDiv.style.display = 'flex';
  const online = Boolean(window.FirebaseSync && typeof window.FirebaseSync.isEnabled === 'function' && window.FirebaseSync.isEnabled());

  if (online) {
    statusDiv.style.background = '#e8ffe8';
    statusDiv.style.color = '#228B22';
    statusIcon.textContent = '☁️';
    statusText.textContent = 'Sincronização ativa (Firebase)';
  } else {
    statusDiv.style.background = '#fffbe8';
    statusDiv.style.color = '#B8860B';
    statusIcon.textContent = '⏳';
    statusText.textContent = 'Modo offline (salvando no dispositivo)';
  }

  setTimeout(() => { statusDiv.style.display = 'none'; }, 4000);
}

// ========== Local data bootstrap ==========
function safeInitLocalData() {
  try {
    if (!localStorage.getItem('babyVotes')) {
      localStorage.setItem('babyVotes', JSON.stringify({ menino: 0, menina: 0 }));
    }
    if (!localStorage.getItem('rsvpConfirmations')) {
      localStorage.setItem('rsvpConfirmations', JSON.stringify([]));
    }
    if (!localStorage.getItem('babyMessages')) {
      localStorage.setItem('babyMessages', JSON.stringify([]));
    }
  } catch (e) {
    console.warn('LocalStorage não disponível:', e);
  }
}

function removeLoading() {
  const loading = document.getElementById('loadingScreen');
  if (!loading) return;
  setTimeout(() => {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 600);
  }, 800);
}

// ========== Contagem regressiva ==========
function initCountdown() {
  // 05/10/2025 15:00:00 (mês 0-indexado em JS)
  const EVENT_DATE = new Date(2025, 9, 5, 15, 0, 0).getTime();
  const els = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds')
  };

  function update() {
    const now = Date.now();
    const diff = EVENT_DATE - now;
    const timer = document.querySelector('.countdown-timer');

    if (diff <= 0) {
      if (timer) timer.innerHTML = '<h2 style="color:#ff6b9d;">O evento começou!</h2>';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (els.days) els.days.textContent = String(d).padStart(2, '0');
    if (els.hours) els.hours.textContent = String(h).padStart(2, '0');
    if (els.minutes) els.minutes.textContent = String(m).padStart(2, '0');
    if (els.seconds) els.seconds.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ========== Votação ==========
function initVoting() {
  const voteButtons = document.querySelectorAll('.vote-btn');
  let votes = JSON.parse(localStorage.getItem('babyVotes') || '{"menino":0,"menina":0}');

  function render() {
    const total = votes.menino + votes.menina;
    const boyPct = total > 0 ? Math.round((votes.menino / total) * 100) : 50;
    const girlPct = 100 - boyPct;

    const boyBar = document.querySelector('.boy-bar');
    const girlBar = document.querySelector('.girl-bar');
    const boyEl = document.getElementById('boyPercentage');
    const girlEl = document.getElementById('girlPercentage');
    const totalEl = document.getElementById('totalVotes');

    if (boyBar) boyBar.style.width = boyPct + '%';
    if (girlBar) girlBar.style.width = girlPct + '%';
    if (boyEl) boyEl.textContent = boyPct + '%';
    if (girlEl) girlEl.textContent = girlPct + '%';
    if (totalEl) totalEl.textContent = String(total);
  }

  voteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const type = btn.dataset.vote;
      if (!type || !votes.hasOwnProperty(type)) return;

      // feedback
      btn.classList.add('vote-btn--clicked');
      setTimeout(() => btn.classList.remove('vote-btn--clicked'), 350);

      votes[type] += 1;
      localStorage.setItem('babyVotes', JSON.stringify(votes));
      render();
      if (window.FirebaseSync && typeof window.FirebaseSync.registerVote === 'function') {
        window.FirebaseSync.registerVote(type)
          .then(ok => { if (!ok) showNotification('Falha ao sincronizar voto com a nuvem.', 'error'); })
          .catch(() => showNotification('Falha ao sincronizar voto com a nuvem.', 'error'));
      }
      const label = type === 'menino' ? 'Menino' : 'Menina';
      showNotification(`Voto registrado: ${label}!`, 'success');
    });
  });

  render();

  // Atualização em tempo real (quando Firebase atualizar localStorage)
  window.addEventListener('babyVotesUpdated', render);
}

// ========== RSVP ==========
function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const attendance = document.getElementById('guestAttendance');
  const group = document.getElementById('guestCountGroup');

  if (attendance && group) {
    attendance.addEventListener('change', () => {
      group.style.display = attendance.value === 'sim' ? 'block' : 'none';
    });
  }

  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('guestName');
    const phoneEl = document.getElementById('guestPhone');
    const attEl = document.getElementById('guestAttendance');
    const countEl = document.getElementById('guestCount');

    if (!nameEl || !phoneEl || !attEl) {
      showNotification('Erro no formulário. Tente novamente.', 'error');
      return;
    }

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const att = attEl.value;
    const count = parseInt((countEl && countEl.value) || '1', 10) || 1;

    if (name.length < 2) return showNotification('Informe um nome válido.', 'error');
    if (phone.length < 8) return showNotification('Informe um telefone válido.', 'error');
    if (!att) return showNotification('Selecione se virá ao evento.', 'error');

    const data = {
      name: name.replace(/[<>\"'&]/g, ''),
      phone: phone.replace(/[<>\"'&]/g, ''),
      attendance: att,
      count,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('pt-BR')
    };

    try {
      const list = JSON.parse(localStorage.getItem('rsvpConfirmations') || '[]');
      list.push(data);
      localStorage.setItem('rsvpConfirmations', JSON.stringify(list));
      if (window.FirebaseSync && typeof window.FirebaseSync.saveRSVP === 'function') {
        window.FirebaseSync.saveRSVP(data)
          .then(ok => { if (!ok) showNotification('Falha ao sincronizar confirmação com a nuvem.', 'error'); })
          .catch(() => showNotification('Falha ao sincronizar confirmação com a nuvem.', 'error'));
      }
      form.reset();
      if (attendance) attendance.dispatchEvent(new Event('change'));
      showNotification('Confirmação registrada. Obrigado!', 'success');
    } catch (err) {
      showNotification('Falha ao salvar confirmação.', 'error');
    }
  });
}

// ========== Galeria ==========
function initGallery() {
  const items = document.querySelectorAll('.photo-item');
  const modal = document.getElementById('photoModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.close-modal');

  if (items && items.length) {
    items.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img && modal && modalImg) {
          if (!img.src) return; // ignora placeholder
          modalImg.src = img.src;
          modal.style.display = 'flex';
        }
      });
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }
}

// ========== Mural de Recados ==========
function initMessages() {
  const form = document.querySelector('.message-form');
  const list = document.getElementById('messagesList');

  function render() {
    if (!list) return;
    const messages = JSON.parse(localStorage.getItem('babyMessages') || '[]')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (!messages.length) {
      list.innerHTML = '<p class="no-messages">Ainda não há recados ✨</p>';
      return;
    }

    list.innerHTML = messages.map(m => `
      <div class="message-item">
        <div class="message-header">
          <strong>${m.name}</strong>
          <span class="message-date">${m.date}</span>
        </div>
        <div class="message-text">${m.text}</div>
      </div>
    `).join('');
  }

  render();

  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('messageName')?.value || '').trim();
    const text = (document.getElementById('messageText')?.value || '').trim();

    if (name.length < 2 || text.length < 5) {
      return showNotification('Preencha nome e mensagem (mín. 5 caracteres).', 'error');
    }

    const msg = {
      name: name.replace(/[<>\"'&]/g, ''),
      text: text.replace(/[<>\"'&]/g, ''),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('pt-BR')
    };

    try {
      const arr = JSON.parse(localStorage.getItem('babyMessages') || '[]');
      arr.push(msg);
      localStorage.setItem('babyMessages', JSON.stringify(arr));
      if (window.FirebaseSync && typeof window.FirebaseSync.saveMessage === 'function') {
        window.FirebaseSync.saveMessage(msg)
          .then(ok => { if (!ok) showNotification('Falha ao sincronizar recado com a nuvem.', 'error'); })
          .catch(() => showNotification('Falha ao sincronizar recado com a nuvem.', 'error'));
      }
      form.reset();
      showNotification('Recado enviado! 💛', 'success');
      render();
    } catch (err) {
      showNotification('Erro ao enviar recado.', 'error');
    }
  });

  // Re-render quando mensagens forem atualizadas pelo Firebase
  window.addEventListener('babyMessagesUpdated', render);
}

// ========== Notificações ==========
function showNotification(message, type = 'info') {
  const existing = document.querySelectorAll('.notification');
  existing.forEach(n => n.remove());

  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.textContent = message;
  el.style.cssText = `position:fixed;top:20px;right:20px;padding:14px 18px;border-radius:8px;color:white;font-weight:600;z-index:10000;transform:translateX(120%);transition:transform .3s ease;box-shadow:0 4px 12px rgba(0,0,0,.25);max-width:320px;background:${
    type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'
  };`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.style.transform = 'translateX(0)');
  setTimeout(() => {
    el.style.transform = 'translateX(120%)';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ========== Animações (reveal on scroll) ==========
function initAnimations() {
  const sections = document.querySelectorAll('section');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(s => {
    s.classList.add('fade-in-section');
    io.observe(s);
  });
}

// ========== Partículas decorativas ==========
function initParticles() {
  const container = document.getElementById('particlesContainer');
  if (!container) return;
  const glyphs = ['✨', '💛', '🎀', '🍼', '🌟'];

  function spawn() {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    p.style.position = 'fixed';
    p.style.bottom = Math.round(Math.random() * 40 + 10) + '%';
    p.style.left = Math.random() < 0.5 ? '-50px' : 'calc(100% + 50px)';
    p.style.fontSize = (Math.random() * 12 + 16) + 'px';
    p.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
    p.style.transition = 'transform 18s linear, opacity 2s ease';
    container.appendChild(p);
    requestAnimationFrame(() => {
      const dir = p.style.left.startsWith('-') ? 1 : -1;
      p.style.transform = `translateX(${dir * (window.innerWidth + 140)}px)`;
    });
    setTimeout(() => p.remove(), 20000);
  }

  setInterval(spawn, 5000);
}

// ========== Ações auxiliares ==========
window.openMap = function openMap() {
  window.open('https://maps.google.com/?q=Tv.+Green+Village,+40+-+Capela+Velha,+Arauc%C3%A1ria+-+PR', '_blank');
};

window.addToCalendar = function addToCalendar() {
  const startDate = '20251005T150000Z';
  const endDate = '20251005T210000Z';
  const title = 'Chá Revelação - Aline & Matheus';
  const location = 'Tv. Green Village, 40 - Capela Velha, Araucária - PR';
  const details = 'Venha descobrir conosco se nosso bebê será um menino ou uma menina!';
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;
  window.open(url, '_blank');
};
