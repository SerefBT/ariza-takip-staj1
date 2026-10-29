$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
$ready=$false
try { $result=Invoke-RestMethod 'http://127.0.0.1:5000/api/health' -TimeoutSec 2; $ready=$result.service -eq 'ariza-takip' -and $result.success } catch {}
if (!$ready) {
  New-Item -ItemType Directory -Path (Join-Path $projectRoot '.local') -Force | Out-Null
  $nodePath=(Get-Command node.exe).Source
  $process=Start-Process -FilePath $nodePath -ArgumentList 'scripts/dev.mjs' -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot '.local\app.log') -RedirectStandardError (Join-Path $projectRoot '.local\app-error.log') -PassThru
  $process.Id | Set-Content (Join-Path $projectRoot '.local\launcher.pid')
  Write-Host 'Ariza Takip baslatiliyor...'
  for ($attempt=0;$attempt -lt 120;$attempt++) {
    try { $result=Invoke-RestMethod 'http://127.0.0.1:5000/api/health' -TimeoutSec 1; $ready=$result.service -eq 'ariza-takip' -and $result.success } catch {}
    if ($ready) { break }
    if ($process.HasExited) { throw 'Uygulama kapandi. .local\app-error.log dosyasini kontrol edin.' }
    Start-Sleep -Milliseconds 1000
  }
}
if (!$ready) { throw 'Baslatma tamamlanamadi. .local klasorundeki gunlukleri kontrol edin.' }
Start-Process 'http://localhost:5000'
Write-Host 'Uygulama hazir: http://localhost:5000'
