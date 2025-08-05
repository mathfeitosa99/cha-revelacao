document.addEventListener('DOMContentLoaded', function() {
    // Contador regressivo
    const eventDate = new Date('2025-10-12T15:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        if (distance < 0) {
            document.querySelector('.countdown-timer').innerHTML = '<h2>O evento começou!</h2>';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Controle de música YouTube com trecho específico
    const musicToggle = document.getElementById('musicToggle');
    let player;
    let isPlaying = false;
    let loopInterval;
    
    const startTime = 11; // 0:11 em segundos
    const endTime = 90;   // 1:30 em segundos
    
    // Inicializar player do YouTube quando API estiver pronta
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: '4bMOTTJqGgM',
            playerVars: {
                autoplay: 0,
                controls: 0,
                showinfo: 0,
                modestbranding: 1,
                start: startTime
            },
            events: {
                onReady: function(event) {
                    player.setVolume(30);
                },
                onStateChange: function(event) {
                    if (event.data === YT.PlayerState.PLAYING && isPlaying) {
                        // Verificar se chegou no final do trecho
                        loopInterval = setInterval(function() {
                            if (player.getCurrentTime() >= endTime) {
                                player.seekTo(startTime);
                            }
                        }, 1000);
                    } else {
                        clearInterval(loopInterval);
                    }
                }
            }
        });
    };
    
    musicToggle.addEventListener('click', function() {
        if (!player) return;
        
        if (isPlaying) {
            player.pauseVideo();
            clearInterval(loopInterval);
            isPlaying = false;
            musicToggle.textContent = '🔇';
            musicToggle.style.background = '#999';
            musicToggle.title = 'Tocar música';
        } else {
            player.seekTo(startTime);
            player.playVideo();
            isPlaying = true;
            musicToggle.textContent = '🎵';
            musicToggle.style.background = '#b8a690';
            musicToggle.title = 'Pausar música';
        }
    });
    
    // Sistema de votação
    const voteButtons = document.querySelectorAll('.vote-btn');
    let votes = JSON.parse(localStorage.getItem('babyVotes')) || { menino: 0, menina: 0 };
    let userVoted = localStorage.getItem('userVoted') === 'true';
    
    function updateVoteDisplay() {
        const total = votes.menino + votes.menina;
        const boyPercentage = total > 0 ? Math.round((votes.menino / total) * 100) : 50;
        const girlPercentage = total > 0 ? Math.round((votes.menina / total) * 100) : 50;
        
        document.getElementById('boyPercentage').textContent = boyPercentage + '%';
        document.getElementById('girlPercentage').textContent = girlPercentage + '%';
        document.getElementById('totalVotes').textContent = total;
        
        if (userVoted) {
            voteButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.6';
            });
        }
    }
    
    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (userVoted) return;
            
            const vote = this.dataset.vote;
            votes[vote]++;
            userVoted = true;
            
            localStorage.setItem('babyVotes', JSON.stringify(votes));
            localStorage.setItem('userVoted', 'true');
            
            updateVoteDisplay();
            createConfetti();
        });
    });
    
    updateVoteDisplay();
    
    // Formulário RSVP
    const form = document.querySelector('.rsvp-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const attendance = form.querySelector('select').value;
        
        if (name && email && attendance) {
            createConfetti();
            alert(`Obrigado, ${name}! Sua confirmação foi registrada.`);
            form.reset();
        }
    });
    
    // Animação suave ao carregar
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Sistema de mensagens
    const messageForm = document.querySelector('.message-form');
    const messagesList = document.getElementById('messagesList');
    let messages = JSON.parse(localStorage.getItem('babyMessages')) || [];
    
    function displayMessages() {
        messagesList.innerHTML = '';
        messages.slice(-10).reverse().forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-item';
            messageDiv.innerHTML = `
                <div class="message-author">${msg.name}</div>
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${msg.time}</div>
            `;
            messagesList.appendChild(messageDiv);
        });
    }
    
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('messageName').value;
        const text = document.getElementById('messageText').value;
        
        if (name && text) {
            const message = {
                name: name,
                text: text,
                time: new Date().toLocaleString('pt-BR')
            };
            
            messages.push(message);
            localStorage.setItem('babyMessages', JSON.stringify(messages));
            
            displayMessages();
            messageForm.reset();
            createConfetti();
        }
    });
    
    displayMessages();
    
    // Gerar QR Code
    function generateQRCode() {
        const currentUrl = window.location.href;
        const qrContainer = document.getElementById('qrcode');
        
        // Verificar se a biblioteca QRCode está disponível
        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrContainer, currentUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#8b7355',
                    light: '#ffffff'
                }
            }, function(error) {
                if (error) {
                    console.error('Erro QR Code:', error);
                    generateQRCodeFallback();
                }
            });
        } else {
            generateQRCodeFallback();
        }
    }
    
    // Fallback: usar API externa para QR Code
    function generateQRCodeFallback() {
        const currentUrl = encodeURIComponent(window.location.href);
        const qrContainer = document.getElementById('qrcode');
        
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentUrl}&color=8b7355&bgcolor=ffffff`;
        img.alt = 'QR Code do Convite';
        img.style.border = '2px solid #8b7355';
        img.style.borderRadius = '8px';
        
        qrContainer.innerHTML = '';
        qrContainer.appendChild(img);
    }
    
    // Tentar gerar QR Code com delay
    setTimeout(generateQRCode, 2000);
    
    // Fallback se não funcionar em 5 segundos
    setTimeout(function() {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer.hasChildNodes()) {
            generateQRCodeFallback();
        }
    }, 5000);
    
    // Efeito de confete
    function createConfetti() {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.backgroundColor = ['#ff69b4', '#87ceeb', '#98fb98'][Math.floor(Math.random() * 3)];
            confetti.style.zIndex = '9999';
            confetti.style.animation = 'confettiFall 2s linear forwards';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }
    }
});

// Função para abrir mapa
function openMap() {
    const address = 'Travessa Green Village, 40';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
}

// Funções de compartilhamento
function shareWhatsApp() {
    const text = 'Venha ao nosso Chá Revelação! 👶 Aline & Matheus - 12/10/2025 às 15h #ChaRevelacaoAlineMatheus';
    const url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + window.location.href)}`;
    window.open(url, '_blank');
}

function shareFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copiado para a área de transferência!');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copiado!');
    });
}