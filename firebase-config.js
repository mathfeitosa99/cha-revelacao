// Firebase v9 via CDN (modular) – integração em site estático
// Config fornecida pelo usuário
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyAlq7vQlBuLGBH6zunipXv0D6e_scj38Qc",
    authDomain: "cha-revelacao-aline-matheus.firebaseapp.com",
    databaseURL: "https://cha-revelacao-aline-matheus-default-rtdb.firebaseio.com",
    projectId: "cha-revelacao-aline-matheus",
    storageBucket: "cha-revelacao-aline-matheus.firebasestorage.app",
    messagingSenderId: "365293534975",
    appId: "1:365293534975:web:df24c4d65f56c089ca96ca",
    measurementId: "G-JG750GNKR2"
  };

  let app = null;
  let db = null;
  let enabled = false;
  let initError = null;
  let listenersSet = false;

  async function importApp() {
    return await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js');
  }

  async function importDB() {
    return await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js');
  }

  async function init() {
    try {
      const { initializeApp } = await importApp();
      const { getDatabase, ref, get } = await importDB();
      if (!app) app = initializeApp(firebaseConfig);
      db = getDatabase(app);

      // Verificar conectividade básica
      try {
        const snap = await get(ref(db, '.info/connected'));
        enabled = snap.exists() ? Boolean(snap.val()) : true; // alguns ambientes retornam null aqui; assume true
      } catch (e) {
        enabled = true; // fallback otimista – ainda assim tentaremos operações
      }

      if (!listenersSet) {
        setupRealtime();
        listenersSet = true;
      }

      return true;
    } catch (e) {
      enabled = false;
      initError = e?.message || String(e);
      return false;
    }
  }

  // Realtime para manter localStorage sincronizado e a UI re-renderizar
  async function setupRealtime() {
    if (!db) return;
    const { ref, onValue } = await importDB();

    // Mensagens
    onValue(ref(db, 'messages'), (snapshot) => {
      const data = snapshot.val();
      const remote = data ? Object.values(data) : [];
      const local = JSON.parse(localStorage.getItem('babyMessages') || '[]');
      const merged = dedupe([...local, ...remote]);
      localStorage.setItem('babyMessages', JSON.stringify(merged));
      window.dispatchEvent(new Event('babyMessagesUpdated'));
    }, (err) => {
      enabled = false;
      initError = err?.message || 'onValue(messages) error';
      console.warn('[Firebase] messages listener error:', initError);
    });

    // Votos
    onValue(ref(db, 'votes'), (snapshot) => {
      const remote = snapshot.val() || { menino: 0, menina: 0 };
      const local = JSON.parse(localStorage.getItem('babyVotes') || '{"menino":0,"menina":0}');
      const merged = {
        menino: Math.max(remote.menino || 0, local.menino || 0),
        menina: Math.max(remote.menina || 0, local.menina || 0)
      };
      localStorage.setItem('babyVotes', JSON.stringify(merged));
      window.dispatchEvent(new Event('babyVotesUpdated'));
    }, (err) => {
      enabled = false;
      initError = err?.message || 'onValue(votes) error';
      console.warn('[Firebase] votes listener error:', initError);
    });

    // RSVP (caso painel admin use)
    onValue(ref(db, 'rsvp'), (snapshot) => {
      const data = snapshot.val();
      const remote = data ? Object.values(data) : [];
      const local = JSON.parse(localStorage.getItem('rsvpConfirmations') || '[]');
      const merged = dedupe([...local, ...remote], (a, b) => a.timestamp === b.timestamp && a.name === b.name);
      localStorage.setItem('rsvpConfirmations', JSON.stringify(merged));
      window.dispatchEvent(new Event('rsvpUpdated'));
    }, (err) => {
      enabled = false;
      initError = err?.message || 'onValue(rsvp) error';
      console.warn('[Firebase] rsvp listener error:', initError);
    });
  }

  function dedupe(arr, eq) {
    const equals = eq || ((a, b) => a.timestamp === b.timestamp && a.name === b.name && a.text === b.text);
    const out = [];
    arr.forEach(x => {
      if (!out.some(y => equals(x, y))) out.push(x);
    });
    return out;
  }

  // Operações de escrita (sempre mantém localStorage também)
  async function saveMessage(message) {
    try {
      // backup local
      const local = JSON.parse(localStorage.getItem('babyMessages') || '[]');
      local.push(message);
      localStorage.setItem('babyMessages', JSON.stringify(local));

      if (!db) return false;
      const { ref, push } = await importDB();
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await push(ref(db, 'messages'), { ...message, id });
      return true;
    } catch {
      return false;
    }
  }

  async function registerVote(type) {
    if (!db || (type !== 'menino' && type !== 'menina')) return false;
    try {
      const { ref, runTransaction } = await importDB();
      await runTransaction(ref(db, `votes/${type}`), (current) => (current || 0) + 1);
      return true;
    } catch (e) {
      console.error('[Firebase] registerVote failed:', e);
      return false;
    }
  }

  async function saveRSVP(entry) {
    try {
      const local = JSON.parse(localStorage.getItem('rsvpConfirmations') || '[]');
      local.push(entry);
      localStorage.setItem('rsvpConfirmations', JSON.stringify(local));

      if (!db) return false;
      const { ref, push } = await importDB();
      await push(ref(db, 'rsvp'), entry);
      return true;
    } catch (e) {
      console.error('[Firebase] saveRSVP failed:', e);
      return false;
    }
  }

  async function loadMessages(callback) {
    const local = JSON.parse(localStorage.getItem('babyMessages') || '[]');
    if (!db) { if (callback) callback(local); return local; }
    try {
      const { ref, get } = await importDB();
      const snap = await get(ref(db, 'messages'));
      const remote = snap.val() ? Object.values(snap.val()) : [];
      const merged = dedupe([...local, ...remote]);
      if (callback) callback(merged);
      return merged;
    } catch (e) {
      console.error('[Firebase] loadMessages failed:', e);
      if (callback) callback(local);
      return local;
    }
  }

  async function syncExistingData() {
    if (!db) return false;
    try {
      const { ref, get, set, push } = await importDB();

      // Sincronizar votos (set se vazio)
      const localVotes = JSON.parse(localStorage.getItem('babyVotes') || '{"menino":0,"menina":0}');
      const votesRef = ref(db, 'votes');
      const vs = await get(votesRef);
      if (!vs.exists()) await set(votesRef, localVotes);

      // Sincronizar mensagens (apenas se não tiver nada)
      const localMsgs = JSON.parse(localStorage.getItem('babyMessages') || '[]');
      const msgsRef = ref(db, 'messages');
      const ms = await get(msgsRef);
      if (!ms.exists()) {
        for (const m of localMsgs) { await push(msgsRef, m); }
      }

      // Sincronizar RSVP (apenas se não tiver nada)
      const localRSVP = JSON.parse(localStorage.getItem('rsvpConfirmations') || '[]');
      const rsvpRef = ref(db, 'rsvp');
      const rs = await get(rsvpRef);
      if (!rs.exists()) {
        for (const r of localRSVP) { await push(rsvpRef, r); }
      }

      return true;
    } catch {
      return false;
    }
  }

  async function testConnection() {
    if (!db) return false;
    try {
      const { ref, get } = await importDB();
      const snap = await get(ref(db, '.info/connected'));
      return snap.exists() ? Boolean(snap.val()) : true;
    } catch {
      return false;
    }
  }

  window.FirebaseSync = {
    init,
    isEnabled: () => enabled,
    getError: () => initError,
    testConnection,
    // dados
    saveMessage,
    loadMessages,
    registerVote,
    saveRSVP,
    syncExistingData
  };
})();
