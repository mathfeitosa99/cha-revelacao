@echo off
echo 🚀 Deploy automatico do Cha Revelacao
echo.

:: Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git nao encontrado!
    echo 📥 Instale o Git em: https://git-scm.com/download/win
    echo 🔄 Reinicie o terminal apos a instalacao
    pause
    exit /b 1
)

:: Verificar se está em um repositório Git
if not exist ".git" (
    echo ❌ Nao e um repositorio Git!
    echo 🔧 Execute: git init
    echo 🔧 Execute: git remote add origin [URL-DO-SEU-REPO]
    pause
    exit /b 1
)

echo 📝 Verificando mudancas...
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro ao verificar status do Git
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
    echo ⚠️  Nenhuma mudanca para commit ou erro
    pause
    exit /b 1
)

echo 🌐 Enviando para GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Erro no push! Verifique:
    echo - Se o repositorio remoto esta configurado
    echo - Se voce tem permissao de push
    echo - Se a branch main existe
    pause
    exit /b 1
)

echo ✅ Deploy concluido! 
echo 🔗 Seu site sera atualizado automaticamente
pause