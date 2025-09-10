document.addEventListener('DOMContentLoaded', () => {
  // Estado inicial
  safeInitLocalData();
  removeLoading();

  // Inicializações
  initCountdown();
  initRSVP();
  initGallery();
  initAnimations();
  initParticles();

  // Bind de botões (evitar inline handlers por CSP)
  const mapBtn = document.getElementById('btnOpenMap');
  if (mapBtn) mapBtn.addEventListener('click', openMap);
  const calBtn = document.getElementById('btnAddCalendar');
  if (calBtn) calBtn.addEventListener('click', addToCalendar);
});

// Tema removido a pedido


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

// Votação removida

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
      // Enviar também para Netlify Forms (centralizado no dashboard)
      postRSVPToNetlify({
        "form-name": 'rsvp',
        guestName: data.name,
        guestPhone: data.phone,
        guestAttendance: data.attendance,
        guestCount: String(data.count),
        timestamp: data.timestamp,
        date: data.date
      });
      form.reset();
      if (attendance) attendance.dispatchEvent(new Event('change'));
      showNotification('Confirmação registrada. Obrigado!', 'success');
    } catch (err) {
      showNotification('Falha ao salvar confirmação.', 'error');
    }
  });
}

// Envio assíncrono para Netlify Forms
function postRSVPToNetlify(fields) {
  try {
    const body = new URLSearchParams(fields).toString();
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    }).catch(() => {});
  } catch (e) { /* ignora erros de rede */ }
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

// Mural de recados removido

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
function isIOS() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const iOSClassic = /iPad|iPhone|iPod/.test(ua);
  const iOS13Plus = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSClassic || iOS13Plus;
}

window.openMap = function openMap() {
  const address = 'Tv. Green Village, 40 - Capela Velha, Araucária - PR';
  const url = isIOS()
    ? `https://maps.apple.com/?q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = url; // Fallback se popup for bloqueado
};

window.addToCalendar = function addToCalendar() {
  const startDate = '20251005T150000Z';
  const endDate = '20251005T210000Z';
  const title = 'Chá Revelação - Aline & Matheus';
  const location = 'Tv. Green Village, 40 - Capela Velha, Araucária - PR';
  const details = 'Venha descobrir conosco se nosso bebê será um menino ou uma menina!';

  if (isIOS()) {
    // iOS: oferecer .ics (Apple Calendar)
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Convite Cha Revelacao//PT-BR',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${details}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    // Preferir Blob + download; evitar data: por CSP
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cha-revelacao.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return;
  }

  // Android/desktop: Google Calendar
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(details)}`;
  const w = window.open(url, '_blank', 'noopener,noreferrer');
  if (!w) window.location.href = url;
};
