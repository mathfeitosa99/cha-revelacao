// ===== SISTEMA ADMINISTRATIVO DE CONFIRMAÇÕES =====

// Convidados pré-confirmados
const preConfirmedGuests = [
    {
        name: 'Matheus Felipe Feitosa',
        phone: '(41) 99800-5061',
        attendance: 'sim',
        count: 1,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('pt-BR'),
        isPreConfirmed: true
    },
    {
        name: 'Aline do Nascimento Gomes',
        phone: '(41) 99774-5808',
        attendance: 'sim',
        count: 1,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('pt-BR'),
        isPreConfirmed: true
    },
    {
        name: 'Alice do Nascimento Gomes',
        phone: '(41) 99729-0815',
        attendance: 'sim',
        count: 1,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('pt-BR'),
        isPreConfirmed: true
    }
];

// Inicializar sistema administrativo
document.addEventListener('DOMContentLoaded', function() {
    initializePreConfirmed();
    loadGuestList();
    updateStats();
    
    // Atualizar a cada 30 segundos
    setInterval(() => {
        loadGuestList();
        updateStats();
    }, 30000);
});

// Inicializar convidados pré-confirmados
function initializePreConfirmed() {
    let confirmations = JSON.parse(localStorage.getItem('rsvpConfirmations')) || [];
    
    // Verificar se os pré-confirmados já existem
    preConfirmedGuests.forEach(preGuest => {
        const exists = confirmations.find(guest => guest.name === preGuest.name);
        if (!exists) {
            confirmations.unshift(preGuest);
        }
    });
    
    localStorage.setItem('rsvpConfirmations', JSON.stringify(confirmations));
}

// Carregar lista de convidados
function loadGuestList() {
    const guestList = document.getElementById('guestList');
    const confirmations = JSON.parse(localStorage.getItem('rsvpConfirmations')) || [];
    
    if (confirmations.length === 0) {
        guestList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nenhuma confirmação ainda.</p>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    confirmations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    guestList.innerHTML = '';
    
    confirmations.forEach((guest, index) => {
        const guestItem = document.createElement('div');
        guestItem.className = 'guest-item';
        
        const statusClass = guest.attendance === 'sim' ? 'confirmado' : 
                           guest.attendance === 'talvez' ? 'talvez' : 'nao';
        
        const statusText = guest.attendance === 'sim' ? 'Confirmado!' : 
                          guest.attendance === 'talvez' ? 'Talvez' : 'Não Vai';
        
        const preConfirmedBadge = guest.isPreConfirmed ? 
            '<span style="background: #17a2b8; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7em; margin-left: 10px;">FAMÍLIA</span>' : '';
        
        guestItem.innerHTML = `
            <div class="guest-info">
                <h3>${index + 1}. ${guest.name} ${preConfirmedBadge}</h3>
                <div class="guest-details">
                    📱 ${guest.phone} | 
                    👥 ${guest.count} pessoa${guest.count > 1 ? 's' : ''} | 
                    📅 ${guest.date}
                </div>
            </div>
            <div class="status ${statusClass}">${statusText}</div>
        `;
        
        guestList.appendChild(guestItem);
    });
}

// Atualizar estatísticas
function updateStats() {
    const confirmations = JSON.parse(localStorage.getItem('rsvpConfirmations')) || [];
    
    const stats = {
        confirmados: 0,
        talvez: 0,
        nao: 0,
        totalPessoas: 0
    };
    
    confirmations.forEach(guest => {
        if (guest.attendance === 'sim') {
            stats.confirmados++;
            stats.totalPessoas += guest.count;
        } else if (guest.attendance === 'talvez') {
            stats.talvez++;
            stats.totalPessoas += guest.count;
        } else {
            stats.nao++;
        }
    });
    
    document.getElementById('totalConfirmados').textContent = stats.confirmados;
    document.getElementById('totalTalvez').textContent = stats.talvez;
    document.getElementById('totalNao').textContent = stats.nao;
    document.getElementById('totalPessoas').textContent = stats.totalPessoas;
}

// Exportar dados
function exportData() {
    const confirmations = JSON.parse(localStorage.getItem('rsvpConfirmations')) || [];
    
    if (confirmations.length === 0) {
        alert('Nenhuma confirmação para exportar!');
        return;
    }
    
    let csvContent = 'Nome,Telefone,Status,Pessoas,Data\n';
    
    confirmations.forEach(guest => {
        const status = guest.attendance === 'sim' ? 'Confirmado' : 
                      guest.attendance === 'talvez' ? 'Talvez' : 'Não Vai';
        
        csvContent += `"${guest.name}","${guest.phone}","${status}","${guest.count}","${guest.date}"\n`;
    });
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `confirmacoes-cha-revelacao-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar notificação
    showNotification('Lista exportada com sucesso! 📊', 'success');
}

// Função de notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
        }
        .notification-success { background-color: #4CAF50; }
        .notification-error { background-color: #f44336; }
        .notification-info { background-color: #2196F3; }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 4000);
}