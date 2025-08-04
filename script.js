document.addEventListener('DOMContentLoaded', function() {
    // Constantes
    const EVENT_DATE = new Date('2025-09-28T15:00:00').getTime();
    const YOUTUBE_START_TIME = 124;
    const YOUTUBE_END_TIME = 240;
    const MAX_VOTES_PER_SESSION = 1;
    const MAX_MESSAGES_PER_SESSION = 3;
    const MAX_RSVP_PER_SESSION = 1;
    
    // Contador regressivo otimizado
    let countdownInterval;
    let isTabVisible = true;
    
    function updateCountdown() {
        if (!isTabVisible) return;
        
        const now = new Date().getTime();
        const distance = EVENT_DATE - now;
        
        if (distance < 0) {
            document.querySelector('.countdown-timer').innerHTML = '<h2>O evento começou!</h2>';
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
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Controle de visibilidade da aba
    document.addEventListener('visibilitychange', function() {
        isTabVisible = !document.hidden;
    });
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    
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
    
    // Formulário RSVP com autorização
    const form = document.querySelector('.rsvp-form');
    let rsvpCount = 0;
    
    try {
        rsvpCount = parseInt(localStorage.getItem('rsvpCount')) || 0;
    } catch (error) {
        console.log('Erro ao carregar RSVP count:', error);
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificação de autorização para RSVP
            if (rsvpCount >= MAX_RSVP_PER_SESSION) {
                showNotification('Você já confirmou presença! Apenas uma confirmação por pessoa.', 'warning');
                return;
            }
            
            const name = form.querySelector('input[type="text"]')?.value?.trim();
            const email = form.querySelector('input[type="email"]')?.value?.trim();
            const attendance = form.querySelector('select')?.value;
            
            // Validação de entrada
            if (!name || name.length < 2) {
                showNotification('Nome deve ter pelo menos 2 caracteres', 'error');
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
            
            // Autorização aprovada - processar RSVP
            rsvpCount++;
            
            try {
                localStorage.setItem('rsvpCount', rsvpCount.toString());
                const rsvpData = { name, email, attendance, timestamp: Date.now() };
                localStorage.setItem('rsvpData', JSON.stringify(rsvpData));
            } catch (error) {
                console.log('Erro ao salvar RSVP:', error);
            }
            
            createConfetti();
            showNotification(`Obrigado, ${name}! Sua confirmação foi registrada.`, 'success');
            form.reset();
        });
    }
    
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