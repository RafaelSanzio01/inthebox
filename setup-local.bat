@echo off
echo [1/3] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env created from .env.example. Please update it with your TMDB_API_KEY.
) else (
    echo .env already exists.
)

echo.
echo [2/3] Installing dependencies...
call npm install

echo.
echo [3/3] Setting up database...
call npx prisma generate
call npx prisma db push

echo.
echo Project setup complete! 
echo IMPORTANT: Open .env and add your TMDB_API_KEY before running 'npm run dev'.
pause
