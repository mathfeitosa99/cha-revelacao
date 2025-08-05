document.addEventListener('DOMContentLoaded', function() {
    // Constantes
    const EVENT_DATE = new Date(2025, 8, 28, 15, 0, 0).getTime(); // Mês 8 = setembro (0-indexado)
    const YOUTUBE_START_TIME = 124;
    const YOUTUBE_END_TIME = 240;
    const MAX_VOTES_PER_SESSION = 1;
    const MAX_MESSAGES_PER_SESSION = 3;
    const MAX_RSVP_PER_SESSION = 1;
    
    // Banco de dados de convidados
    const GUEST_LIST = [
        // Adicione aqui os nomes dos convidados
        'João Silva',
        'Maria Santos',
        'Pedro Oliveira',
        'Ana Costa',
        'Carlos Ferreira'
        // Você pode adicionar mais nomes aqui
    ];
    
    // Função para normalizar nomes (remove acentos e converte para minúsculo)
    function normalizeName(name) {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }
    
    // Função para verificar se o nome está na lista
    function isValidGuest(inputName) {
        const normalizedInput = normalizeName(inputName);
        return GUEST_LIST.some(guestName => 
            normalizeName(guestName) === normalizedInput
        );
    }
    
    // Contador regressivo otimizado
    let countdownInterval;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = EVENT_DATE - now;
        
        if (distance < 0) {
            const timer = document.querySelector('.countdown-timer');
            if (timer) timer.innerHTML = '<h2>O evento começou!</h2>';
            clearInterval(countdownInterval);
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    

    
    // Inicializar contagem regressiva com verificação
    function initCountdown() {
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl && hoursEl && minutesEl && secondsEl) {
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
        } else {
            // Tentar novamente em 100ms se elementos não estão prontos
            setTimeout(initCountdown, 100);
        }
    }
    
    initCountdown();
    
    // Controle de música YouTube otimizado
    const musicToggle = document.getElementById('musicToggle');
    let player;
    let isPlaying = false;
    let loopInterval;
    
    function tryAutoplay() {
        if (player && player.playVideo) {
            try {
                player.seekTo(YOUTUBE_START_TIME);
                player.playVideo();
                isPlaying = true;
                updateMusicButton();
            } catch (error) {
                console.log('Autoplay falhou:', error);
            }
        }
    }
    
    function updateMusicButton() {
        if (!musicToggle) return;
        
        if (isPlaying) {
            musicToggle.textContent = '🎵';
            musicToggle.style.background = '#b8a690';
            musicToggle.title = 'Pausar música';
        } else {
            musicToggle.textContent = '🔇';
            musicToggle.style.background = '#999';
            musicToggle.title = 'Tocar música';
        }
    }
    
    // Inicializar player do YouTube com tratamento de erro
    window.onYouTubeIframeAPIReady = function() {
        try {
            player = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: '8Hu6PUt40KQ',
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    start: YOUTUBE_START_TIME
                },
                events: {
                    onReady: function(event) {
                        player.setVolume(30);
                        setTimeout(tryAutoplay, 1000);
                    },
                    onStateChange: function(event) {
                        if (event.data === YT.PlayerState.PLAYING && isPlaying) {
                            loopInterval = setInterval(function() {
                                if (player.getCurrentTime() >= YOUTUBE_END_TIME) {
                                    player.seekTo(YOUTUBE_START_TIME);
                                }
                            }, 1000);
                        } else {
                            clearInterval(loopInterval);
                        }
                    },
                    onError: function(event) {
                        console.log('Erro no player YouTube:', event.data);
                    }
                }
            });
        } catch (error) {
            console.log('Erro ao inicializar player YouTube:', error);
        }
    };
    
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            if (!player) return;
            
            try {
                if (isPlaying) {
                    player.pauseVideo();
                    clearInterval(loopInterval);
                    isPlaying = false;
                } else {
                    player.seekTo(YOUTUBE_START_TIME);
                    player.playVideo();
                    isPlaying = true;
                }
                updateMusicButton();
            } catch (error) {
                console.log('Erro ao controlar música:', error);
            }
        });
    }
    
    // Sistema de votação com autorização
    const voteButtons = document.querySelectorAll('.vote-btn');
    let genderVotes = { menino: 0, menina: 0 };
    let userHasVoted = false;
    let voteCount = 0;
    
    // Carregar dados com tratamento de erro
    try {
        genderVotes = JSON.parse(localStorage.getItem('babyVotes')) || { menino: 0, menina: 0 };
        userHasVoted = localStorage.getItem('userVoted') === 'true';
        voteCount = parseInt(localStorage.getItem('voteCount')) || 0;
    } catch (error) {
        console.log('Erro ao acessar localStorage:', error);
    }
    
    function updateVoteDisplay() {
        const total = genderVotes.menino + genderVotes.menina;
        const boyPercentage = total > 0 ? Math.round((genderVotes.menino / total) * 100) : 50;
        const girlPercentage = total > 0 ? Math.round((genderVotes.menina / total) * 100) : 50;
        
        const boyElement = document.getElementById('boyPercentage');
        const girlElement = document.getElementById('girlPercentage');
        const totalElement = document.getElementById('totalVotes');
        
        if (boyElement) boyElement.textContent = boyPercentage + '%';
        if (girlElement) girlElement.textContent = girlPercentage + '%';
        if (totalElement) totalElement.textContent = total;
        
        if (userHasVoted || voteCount >= MAX_VOTES_PER_SESSION) {
            voteButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.6';
            });
        }
    }
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Verificação de autorização rigorosa
            if (userHasVoted || voteCount >= MAX_VOTES_PER_SESSION || this.disabled) {
                showNotification('Você já votou! Apenas um voto por pessoa.', 'warning');
                return;
            }
            
            const vote = this.dataset.vote;
            if (!vote || (vote !== 'menino' && vote !== 'menina')) {
                showNotification('Voto inválido', 'error');
                return;
            }
            
            // Autorização aprovada - processar voto
            genderVotes[vote]++;
            userHasVoted = true;
            voteCount++;
            
            try {
                localStorage.setItem('babyVotes', JSON.stringify(genderVotes));
                localStorage.setItem('userVoted', 'true');
                localStorage.setItem('voteCount', voteCount.toString());
            } catch (error) {
                console.log('Erro ao salvar no localStorage:', error);
            }
            
            updateVoteDisplay();
            createConfetti();
            showNotification('Voto registrado com sucesso!', 'success');
        });
    });
    
    updateVoteDisplay();
    
    // Sistema de RSVP com validação de convidados
    const form = document.querySelector('.rsvp-form');
    let confirmedGuests = [];
    
    try {
        confirmedGuests = JSON.parse(localStorage.getItem('confirmedGuests')) || [];
    } catch (error) {
        console.log('Erro ao carregar convidados confirmados:', error);
    }
    
    function hasGuestConfirmed(name) {
        return confirmedGuests.some(guest => 
            normalizeName(guest.name) === normalizeName(name)
        );
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = form.querySelector('input[type="text"]')?.value?.trim();
            const email = form.querySelector('input[type="email"]')?.value?.trim();
            const attendance = form.querySelector('select')?.value;
            
            // Validação de entrada
            if (!name || name.length < 2) {
                showNotification('Nome deve ter pelo menos 2 caracteres', 'error');
                return;
            }
            
            // Verificar se o nome está na lista de convidados
            if (!isValidGuest(name)) {
                showNotification('Nome não encontrado na lista de convidados. Verifique a grafia.', 'error');
                return;
            }
            
            // Verificar se já confirmou
            if (hasGuestConfirmed(name)) {
                showNotification('Este convidado já confirmou presença!', 'warning');
                return;
            }
            
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Email inválido', 'error');
                return;
            }
            
            if (!attendance) {
                showNotification('Selecione sua confirmação de presença', 'error');
                return;
            }
            
            // Salvar confirmação
            const guestData = {
                name: name,
                email: email,
                attendance: attendance,
                timestamp: new Date().toLocaleString('pt-BR')
            };
            
            confirmedGuests.push(guestData);
            
            try {
                localStorage.setItem('confirmedGuests', JSON.stringify(confirmedGuests));
            } catch (error) {
                console.log('Erro ao salvar confirmação:', error);
            }
            
            createConfetti();
            showNotification(`Obrigado, ${name}! Sua confirmação foi registrada.`, 'success');
            form.reset();
        });
    }penas uma confirmação por pessoa.', 'warning');

    
    // Animações avançadas ao carregar
    const sections = document.querySelectorAll('section');
    const cards = document.querySelectorAll('.info-item, .gift-item, .vote-btn');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px) scale(0.95)';
        section.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(section);
    });
    
    // Animação em cascata para cards
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 1000 + (index * 100));
    });
    
    // Sistema de mensagens com autorização
    const messageForm = document.querySelector('.message-form');
    const messagesList = document.getElementById('messagesList');
    let messages = [];
    let messageCount = 0;
    
    try {
        messages = JSON.parse(localStorage.getItem('babyMessages')) || [];
        messageCount = parseInt(localStorage.getItem('messageCount')) || 0;
    } catch (error) {
        console.log('Erro ao carregar mensagens:', error);
    }
    
    function displayMessages() {
        if (!messagesList) return;
        
        messagesList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        messages.slice(-10).reverse().forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-item';
            
            const authorDiv = document.createElement('div');
            authorDiv.className = 'message-author';
            authorDiv.textContent = msg.name;
            
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = msg.text;
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = msg.time;
            
            messageDiv.appendChild(authorDiv);
            messageDiv.appendChild(textDiv);
            messageDiv.appendChild(timeDiv);
            fragment.appendChild(messageDiv);
        });
        
        messagesList.appendChild(fragment);
    }
    
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificação de autorização para mensagens
            if (messageCount >= MAX_MESSAGES_PER_SESSION) {
                showNotification(`Limite de ${MAX_MESSAGES_PER_SESSION} mensagens por sessão atingido`, 'warning');
                return;
            }
            
            const nameInput = document.getElementById('messageName');
            const textInput = document.getElementById('messageText');
            
            if (!nameInput || !textInput) {
                showNotification('Formulário inválido', 'error');
                return;
            }
            
            const name = nameInput.value.trim();
            const text = textInput.value.trim();
            
            // Validação rigorosa de entrada
            if (!name || name.length < 2 || name.length > 50) {
                showNotification('Nome deve ter entre 2 e 50 caracteres', 'error');
                return;
            }
            
            if (!text || text.length < 5 || text.length > 500) {
                showNotification('Mensagem deve ter entre 5 e 500 caracteres', 'error');
                return;
            }
            
            // Autorização aprovada - processar mensagem
            const message = {
                name: name.substring(0, 50),
                text: text.substring(0, 500),
                time: new Date().toLocaleString('pt-BR'),
                timestamp: Date.now()
            };
            
            messages.push(message);
            messageCount++;
            
            try {
                localStorage.setItem('babyMessages', JSON.stringify(messages));
                localStorage.setItem('messageCount', messageCount.toString());
            } catch (error) {
                console.log('Erro ao salvar mensagem:', error);
            }
            
            displayMessages();
            messageForm.reset();
            createConfetti();
            showNotification('Mensagem enviada com sucesso!', 'success');
        });
    }
    
    displayMessages();
    
    // Sistema de Tema Escuro/Claro
    const themeToggle = document.getElementById('themeToggle');
    let currentTheme = 'light';
    
    try {
        currentTheme = localStorage.getItem('theme') || 'light';
    } catch (error) {
        console.log('Erro ao carregar tema:', error);
    }
    
    // Aplicar tema salvo
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                try {
                    localStorage.setItem('theme', 'dark');
                } catch (error) {
                    console.log('Erro ao salvar tema:', error);
                }
                themeToggle.textContent = '☀️';
            } else {
                try {
                    localStorage.setItem('theme', 'light');
                } catch (error) {
                    console.log('Erro ao salvar tema:', error);
                }
                themeToggle.textContent = '🌙';
            }
        });
    }
    
    // Função otimizada para criar confetti
    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        
        const containerStyles = {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '9999'
        };
        
        Object.assign(confettiContainer.style, containerStyles);
        document.body.appendChild(confettiContainer);

        const fragment = document.createDocumentFragment();
        const confettiCount = 30; // Reduzido para melhor performance
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            const confettiStyles = {
                position: 'absolute',
                width: '8px',
                height: '8px',
                background: colors[Math.floor(Math.random() * colors.length)],
                left: Math.random() * 100 + '%',
                borderRadius: '50%',
                animation: 'confetti-fall 2s linear forwards'
            };
            
            Object.assign(confetti.style, confettiStyles);
            fragment.appendChild(confetti);
        }
        
        confettiContainer.appendChild(fragment);
        
        setTimeout(() => {
            try {
                if (confettiContainer.parentNode) {
                    confettiContainer.parentNode.removeChild(confettiContainer);
                }
            } catch (error) {
                console.log('Erro ao remover confetti:', error);
            }
        }, 2000);
    }
    
    // Função melhorada para copiar link
    async function copyLink() {
        const url = window.location.href;
        
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
                showNotification('Link copiado!', 'success');
            } else {
                fallbackCopyTextToClipboard(url);
            }
        } catch (error) {
            fallbackCopyTextToClipboard(url);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(textArea);
        
        try {
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification('Link copiado!', 'success');
            } else {
                showNotification('Erro ao copiar link', 'error');
            }
        } catch (err) {
            showNotification('Erro ao copiar link', 'error');
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    // Função otimizada para mostrar notificações
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };
        
        const notificationStyles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word',
            backgroundColor: colors[type] || colors.info
        };
        
        Object.assign(notification.style, notificationStyles);
        document.body.appendChild(notification);
        
        // Animação de entrada
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        // Remove após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                try {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                } catch (error) {
                    console.log('Erro ao remover notificação:', error);
                }
            }, 300);
        }, 3000);
    }

    // Adicionar botão de compartilhar se existir
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', copyLink);
    }
});

// CSS para animação do confetti
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);