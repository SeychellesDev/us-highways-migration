@echo off
setlocal enabledelayedexpansion

set dir=us-highways-migration
set php_files=0
set php_lines=0

for /r "%dir%" %%F in (*.php) do (
    findstr /r /v "^[[:space:]]*$" "%%F" >nul
    if !errorlevel! equ 0 (
        set /a php_files+=1
        for /f %%C in ('find /c /v "" ^< "%%F"') do (
            set /a php_lines+=%%C
        )
    )
)

echo Total lines of PHP code: %php_lines%
echo Total number of PHP files with content: %php_files%