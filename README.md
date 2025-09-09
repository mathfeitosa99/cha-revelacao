# 🎉 Chá de Revelação - Aline & Matheus

Sistema completo para chá de revelação com painel administrativo privado.

## 📋 Funcionalidades

### Para os Convidados
- ✅ Confirmação de presença (RSVP)
- 🗳️ Votação no sexo do bebê (Menino/Menina)
- 💬 Mural de mensagens
- 📅 Adicionar evento ao Google Calendar
- 🗺️ Localização do evento
- ⏰ Contador regressivo

### Para os Organizadores
- 🔐 **Painel Administrativo Privado** (`admin.html`)
- 📊 Estatísticas em tempo real
- 👥 Lista completa de confirmações
- 📱 Contatos dos convidados
- 📥 Exportação de dados
- 🔄 Atualização automática

## 🚀 Como Usar

### 1. Configuração Inicial
1. Abra o arquivo `index.html` no navegador
2. O sistema funciona 100% offline (sem necessidade de servidor)

### 2. Acesso ao Painel Admin
1. Abra o arquivo `admin.html` no navegador
2. **Senha padrão:** `chavelacao2024`
3. ⚠️ **IMPORTANTE:** Altere a senha no arquivo `admin.html` (linha 185)

### 3. Personalização
- **Data do evento:** Altere no arquivo `script.js` (linha 1)
- **Lista de convidados:** Edite `window.GUEST_LIST` no `script.js`
- **Senha admin:** Modifique `ADMIN_PASSWORD` no `admin.html`
- **Números WhatsApp:** Atualize `organizerPhones` no `script.js`

## 📱 Notificações WhatsApp

O sistema envia notificações automáticas via WhatsApp quando:
- ✅ Alguém confirma presença
- 🗳️ Alguém vota no sexo do bebê
- 📅 7 dias antes do evento (lembrete)

### Configurar Números
No arquivo `script.js`, encontre e edite:
```javascript
const organizerPhones = [
    '5541998005061', // Matheus
    '5541997745808'  // Aline
];
```

## 🔧 Configurações Importantes

### Alterar Senha do Admin
No arquivo `admin.html`, linha 185:
```javascript
const ADMIN_PASSWORD = 'SUA_NOVA_SENHA_AQUI';
```

### Alterar Data do Evento
No arquivo `script.js`, linha 1:
```javascript
const EVENT_DATE = new Date(2025, 9, 5, 15, 0, 0).getTime(); // Ano, Mês-1, Dia, Hora, Minuto
```

### Editar Lista de Convidados
No arquivo `script.js`, encontre `window.GUEST_LIST` e edite a lista:
```javascript
window.GUEST_LIST = [
    "Nome Convidado 1",
    "Nome Convidado 2",
    // ... adicione mais nomes
];
```

## 📊 Dados Salvos

Todos os dados são salvos no navegador (localStorage):
- ✅ Confirmações de presença
- 🗳️ Votos no sexo do bebê
- 💬 Mensagens dos convidados

### Backup dos Dados
1. Acesse o painel admin (`admin.html`)
2. Clique em "📥 Exportar Dados"
3. Arquivo JSON será baixado automaticamente

## 🎨 Temas e Personalização

 
## 🔒 Segurança

- ✅ Validação de convidados
- 🚫 Limite de votos por pessoa
- 🔐 Painel admin protegido por senha
- 💾 Dados salvos localmente (privacidade)

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Desktop e Mobile
- ✅ Funciona offline
- ✅ Sem necessidade de servidor

## 🆘 Solução de Problemas

### Dados não aparecem no painel admin
1. Verifique se a senha está correta
2. Confirme que há dados salvos (faça um teste de confirmação)
3. Atualize a página (F5)

### WhatsApp não abre automaticamente
- Normal em alguns navegadores por segurança
- Os links são gerados corretamente
- Copie e cole o link manualmente se necessário

### Contador não funciona
- Verifique a data do evento no `script.js`
- Certifique-se que a data está no futuro
- Formato: `new Date(ano, mês-1, dia, hora, minuto)`

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README primeiro
2. Teste em modo incógnito do navegador
3. Verifique o console do navegador (F12)

---

**Desenvolvido com ❤️ para Aline & Matheus**

🎉 **Que seja um momento inesquecível!** 👶👧