# 🚀 Setup do Projeto - Chá Revelação

## 1. Instalar Git
- Baixe em: https://git-scm.com/download/win
- Instale com as opções padrão
- Reinicie o terminal/cmd

## 2. Configurar Git (primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## 3. Inicializar Repositório
```bash
git init
git add .
git commit -m "Primeiro commit"
```

## 4. Conectar ao GitHub
1. Crie um repositório no GitHub
2. Execute:
```bash
git remote add origin https://github.com/SEU-USUARIO/cha-revelacao.git
git branch -M main
git push -u origin main
```

## 5. Deploy Automático
Após configurar, use: `deploy.bat`

## 6. Hospedagem Gratuita
- **Netlify**: https://netlify.com (conecte seu GitHub)
- **Vercel**: https://vercel.com (conecte seu GitHub)
- **GitHub Pages**: Nas configurações do repositório

## Comandos Úteis
```bash
git status          # Ver mudanças
git add .           # Adicionar arquivos
git commit -m "msg" # Fazer commit
git push            # Enviar para GitHub
```