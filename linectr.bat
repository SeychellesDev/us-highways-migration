@echo off
setlocal

set "SCAN_DIR=%~dp0"

powershell.exe -NoProfile -Command ^
"$ErrorActionPreference = 'Stop'; ^
$root = $env:SCAN_DIR; ^
$files = Get-ChildItem -LiteralPath $root -Filter '*.php' -File -Recurse; ^
$totalLines = 0; $filesWithContent = 0; ^
foreach ($file in $files) { ^
  $hasContent = $false; ^
  $fileLines = 0; ^
  $reader = [System.IO.File]::OpenText($file.FullName); ^
  try { ^
    while (($line = $reader.ReadLine()) -ne $null) { ^
      $fileLines++; ^
      if ($line.Trim().Length -gt 0) { $hasContent = $true } ^
    } ^
  } finally { $reader.Dispose() }; ^
  if ($hasContent) { ^
    $filesWithContent++; $totalLines += $fileLines; ^
    Write-Output ('{0}.	{1}: {2} lines' -f $filesWithContent, $file.FullName, $fileLines) ^
  } ^
}; ^
Write-Output ('Total lines of PHP code: {0}' -f $totalLines); ^
Write-Output ('Total number of PHP files with content: {0}' -f $filesWithContent)"

if errorlevel 1 exit /b %errorlevel%
