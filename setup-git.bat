@echo off
echo 🔧 Configuracao inicial do Git + GitHub
echo.

:: Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git nao encontrado!
    echo 📥 Instale o Git em: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Inicializar repositório se não existir
if not exist ".git" (
    echo 🔧 Inicializando repositorio Git...
    git init
    echo ✅ Repositorio inicializado!
    echo.
)

:: Configurar branch principal como main
echo 🔧 Configurando branch principal...
git config init.defaultBranch main
git checkout -b main 2>nul

:: Adicionar arquivos
echo 📝 Adicionando arquivos...
git add .

:: Primeiro commit
echo 💬 Fazendo primeiro commit...
git commit -m "Initial commit: Cha Revelacao website"

echo.
echo 🎯 Agora voce precisa:
echo.
echo 1. Criar um repositorio no GitHub (https://github.com/new)
echo 2. Copiar a URL do repositorio (ex: https://github.com/usuario/cha-revelacao.git)
echo 3. Executar o comando abaixo com SUA URL:
echo.
echo    git remote add origin [SUA-URL-AQUI]
echo    git push -u origin main
echo.
echo 4. Depois disso, use o deploy.bat normalmente!
echo.
pause