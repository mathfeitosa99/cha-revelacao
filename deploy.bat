@echo off
echo 🚀 Deploy automatico do Cha Revelacao
echo.

:: Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git nao encontrado!
    echo 📥 Instale o Git em: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Verificar se está em um repositório Git
if not exist ".git" (
    echo ❌ Nao e um repositorio Git!
    echo 🔧 Inicializando repositorio...
    git init
    echo ✅ Repositorio inicializado!
    echo.
    echo 🔗 Agora adicione o repositorio remoto:
    echo git remote add origin [URL-DO-SEU-REPO-GITHUB]
    pause
    exit /b 0
)

:: Detectar branch atual
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" (
    echo 🔧 Criando branch main...
    git checkout -b main
    set CURRENT_BRANCH=main
)

echo 📝 Branch atual: %CURRENT_BRANCH%
echo.

:: Verificar se existe repositório remoto
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Nenhum repositorio remoto configurado!
    echo 🔧 Execute: git remote add origin [URL-DO-SEU-REPO]
    pause
    exit /b 1
)

echo 📝 Adicionando arquivos...
git add .

echo 💬 Fazendo commit...
set /p message="Digite a mensagem do commit: "
if "%message%"=="" set message="Update: %date% %time%"
git commit -m "%message%"
if errorlevel 1 (
    echo ⚠️  Nenhuma mudanca para commit
    choice /c SN /m "Continuar mesmo assim? (S/N)"
    if errorlevel 2 exit /b 0
)

echo 🌐 Enviando para GitHub...
echo Tentando push para branch: %CURRENT_BRANCH%
git push -u origin %CURRENT_BRANCH%
if errorlevel 1 (
    echo ❌ Erro no push!
    echo.
    echo 🔍 Diagnostico:
    echo - Verificando repositorio remoto...
    git remote -v
    echo.
    echo - Status do repositorio:
    git status
    echo.
    echo 💡 Solucoes possiveis:
    echo 1. Verifique se o repositorio GitHub existe
    echo 2. Verifique suas credenciais do Git
    echo 3. Tente: git push -u origin %CURRENT_BRANCH% --force
    pause
    exit /b 1
)

echo ✅ Deploy concluido! 
echo 🔗 Seu site sera atualizado automaticamente no Netlify
echo 📊 Branch: %CURRENT_BRANCH%
pause