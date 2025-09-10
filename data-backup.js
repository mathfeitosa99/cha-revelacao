// Sistema de backup robusto para garantir que os dados nunca sejam perdidos
(function() {
    'use strict';
    
    const DataBackup = {
        // Chaves de armazenamento
        keys: {
            messages: 'babyMessages',
            votes: 'babyVotes', 
            confirmations: 'rsvpConfirmations'
        },
        
        // Backup automático a cada 30 segundos
        autoBackupInterval: 30000,
        
        // Inicializar sistema de backup
        init: function() {
            console.log('💾 Iniciando sistema de backup robusto');
            
            // Backup inicial
            this.createBackup();
            
            // Backup automático
            setInterval(() => {
                this.createBackup();
            }, this.autoBackupInterval);
            
            // Backup antes de sair da página
            window.addEventListener('beforeunload', () => {
                this.createBackup();
            });
            
            // Backup quando a página perde foco
            window.addEventListener('blur', () => {
                this.createBackup();
            });
            
            // Verificar integridade dos dados na inicialização
            this.verifyDataIntegrity();
        },
        
        // Criar backup completo
        createBackup: function() {
            try {
                const backupData = {
                    timestamp: new Date().toISOString(),
                    data: {}
                };
                
                // Coletar todos os dados
                Object.keys(this.keys).forEach(key => {
                    const storageKey = this.keys[key];
                    const data = localStorage.getItem(storageKey);
                    if (data) {
                        backupData.data[key] = data;
                    }
                });
                
                // Salvar backup com timestamp
                const backupKey = 'backup_' + Date.now();
                localStorage.setItem(backupKey, JSON.stringify(backupData));
                
                // Manter apenas os 5 backups mais recentes
                this.cleanOldBackups();
                
                console.log('💾 Backup criado:', backupKey);
            } catch (error) {
                console.error('Erro ao criar backup:', error);
            }
        },
        
        // Limpar backups antigos
        cleanOldBackups: function() {
            try {
                const backupKeys = [];
                
                // Encontrar todas as chaves de backup
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('backup_')) {
                        backupKeys.push(key);
                    }
                }
                
                // Ordenar por timestamp (mais recente primeiro)
                backupKeys.sort((a, b) => {
                    const timestampA = parseInt(a.replace('backup_', ''));
                    const timestampB = parseInt(b.replace('backup_', ''));
                    return timestampB - timestampA;
                });
                
                // Remover backups antigos (manter apenas 5)
                if (backupKeys.length > 5) {
                    for (let i = 5; i < backupKeys.length; i++) {
                        localStorage.removeItem(backupKeys[i]);
                    }
                }
            } catch (error) {
                console.error('Erro ao limpar backups antigos:', error);
            }
        },
        
        // Verificar integridade dos dados
        verifyDataIntegrity: function() {
            console.log('🔍 Verificando integridade dos dados...');
            
            let issuesFound = 0;
            
            Object.keys(this.keys).forEach(key => {
                const storageKey = this.keys[key];
                const data = localStorage.getItem(storageKey);
                
                if (data) {
                    try {
                        // Tentar parsear JSON para verificar se está válido
                        if (key !== 'theme') {
                            const parsed = JSON.parse(data);
                            
                            // Verificações adicionais
                            if (key === 'messages' && !Array.isArray(parsed)) {
                                throw new Error('Mensagens devem ser um array');
                            }
                            if (key === 'votes' && (!parsed.menino || !parsed.menina)) {
                                throw new Error('Votos devem ter propriedades menino e menina');
                            }
                            if (key === 'confirmations' && !Array.isArray(parsed)) {
                                throw new Error('Confirmações devem ser um array');
                            }
                        }
                        console.log('✅', key, 'dados íntegros');
                    } catch (error) {
                        console.error('❌', key, 'dados corrompidos:', error.message);
                        console.log('🔄 Tentando restaurar do backup...');
                        this.restoreFromBackup(key);
                        issuesFound++;
                    }
                } else {
                    // Dados não existem, tentar restaurar do backup
                    console.log('⚠️', key, 'dados não encontrados, tentando restaurar...');
                    this.restoreFromBackup(key);
                    issuesFound++;
                }
            });
            
            if (issuesFound === 0) {
                console.log('✅ Todos os dados estão íntegros!');
            } else {
                console.log(`⚠️ ${issuesFound} problema(s) encontrado(s) e corrigido(s)`);
            }
        },
        
        // Restaurar dados do backup
        restoreFromBackup: function(dataType) {
            try {
                const backupKeys = [];
                
                // Encontrar backups disponíveis
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('backup_')) {
                        backupKeys.push(key);
                    }
                }
                
                // Ordenar por timestamp (mais recente primeiro)
                backupKeys.sort((a, b) => {
                    const timestampA = parseInt(a.replace('backup_', ''));
                    const timestampB = parseInt(b.replace('backup_', ''));
                    return timestampB - timestampA;
                });
                
                // Tentar restaurar do backup mais recente
                for (const backupKey of backupKeys) {
                    try {
                        const backup = JSON.parse(localStorage.getItem(backupKey));
                        if (backup.data && backup.data[dataType]) {
                            const storageKey = this.keys[dataType];
                            localStorage.setItem(storageKey, backup.data[dataType]);
                            console.log('✅ Dados restaurados do backup:', dataType);
                            return true;
                        }
                    } catch (error) {
                        console.error('Erro ao restaurar backup:', backupKey, error);
                    }
                }
                
                // Se não conseguiu restaurar, inicializar com dados padrão
                this.initializeDefaultData(dataType);
                return false;
            } catch (error) {
                console.error('Erro na restauração:', error);
                this.initializeDefaultData(dataType);
                return false;
            }
        },
        
        // Inicializar dados padrão
        initializeDefaultData: function(dataType) {
            const storageKey = this.keys[dataType];
            
            switch (dataType) {
                case 'messages':
                    localStorage.setItem(storageKey, JSON.stringify([]));
                    break;
                case 'votes':
                    localStorage.setItem(storageKey, JSON.stringify({ menino: 0, menina: 0 }));
                    break;
                case 'confirmations':
                    localStorage.setItem(storageKey, JSON.stringify([]));
                    break;
            }
            
            console.log('🔧 Dados padrão inicializados para:', dataType);
        },
        
        // Exportar todos os dados
        exportAllData: function() {
            const exportData = {
                timestamp: new Date().toISOString(),
                data: {}
            };
            
            Object.keys(this.keys).forEach(key => {
                if (key !== 'theme') {
                    const storageKey = this.keys[key];
                    const data = localStorage.getItem(storageKey);
                    if (data) {
                        exportData.data[key] = JSON.parse(data);
                    }
                }
            });
            
            return exportData;