param([string]$PaketKoku = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)), [switch]$TarayiciAcma)
$ErrorActionPreference = 'Stop'
$demoHome = Join-Path $env:LOCALAPPDATA 'SerafettinStaj\ArizaTakipCD'
$appDir = Join-Path $demoHome 'Uygulama'
$statePath = Join-Path $demoHome 'calisma-durumu.json'
function Test-Port([int]$port) {
  $client = New-Object Net.Sockets.TcpClient
  try { $pending = $client.ConnectAsync('127.0.0.1', $port); return ($pending.Wait(350) -and $client.Connected) } catch { return $false } finally { $client.Dispose() }
}
function Test-Owned($entry) {
  if (!$entry) { return $false }
  try { $running = Get-Process -Id ([int]$entry.pid) -ErrorAction Stop; return ($running.Path -eq $entry.exe -and $running.StartTime.ToUniversalTime().Ticks.ToString() -eq $entry.started) } catch { return $false }
}
if (Test-Path -LiteralPath $statePath) {
  $oldState = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
  try { $health = Invoke-RestMethod 'http://127.0.0.1:5001/cd-demo/health' -TimeoutSec 2 } catch { $health = $null }
  if ((Test-Owned $oldState.server) -and (Test-Owned $oldState.mongo) -and $health.demo -eq 'ariza-cd-1' -and $health.success) {
    Write-Host 'Ariza Takip CD uygulamasi zaten acik: http://127.0.0.1:5001'
    if (!$TarayiciAcma) { Start-Process 'http://127.0.0.1:5001' }; exit 0
  }
  & (Join-Path $PSScriptRoot 'Durdur.ps1') -Sessiz
}
if ((Test-Port 5001) -or (Test-Port 27031)) { throw 'CD icin ayrilan 5001 veya 27031 portu baska bir uygulama tarafindan kullaniliyor. Hicbir yabanci islem durdurulmadi.' }
$sourceApp = Join-Path $PaketKoku 'Uygulama'
if (!(Test-Path -LiteralPath (Join-Path $sourceApp 'runtime\node.exe'))) { throw 'CD Uygulama klasoru eksik.' }
New-Item -ItemType Directory -Path $appDir -Force | Out-Null
Write-Host 'Cevrimdisi dosyalar kullanici alanina kopyalaniyor...'
Get-ChildItem -LiteralPath $sourceApp -Force | Copy-Item -Destination $appDir -Recurse -Force
$dataDir = Join-Path $demoHome 'veriler'
$logsDir = Join-Path $demoHome 'gunlukler'
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
$state = [ordered]@{ demo = 'ariza-cd-1'; server = $null; mongo = $null }
function Save-State { $state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $statePath -Encoding UTF8 }
function Process-Entry($process, [string]$executable) { $process.Refresh(); return @{ pid=$process.Id; exe=[IO.Path]::GetFullPath($executable); started=$process.StartTime.ToUniversalTime().Ticks.ToString() } }
try {
  $mongoExe = Join-Path $appDir 'runtime\mongod.exe'
  $mongoArgs = '--dbpath "' + $dataDir + '" --port 27031 --bind_ip 127.0.0.1 --logpath "' + (Join-Path $logsDir 'mongodb.log') + '" --logappend'
  $mongoProcess = Start-Process -FilePath $mongoExe -ArgumentList $mongoArgs -WorkingDirectory $appDir -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logsDir 'mongo-out.log') -RedirectStandardError (Join-Path $logsDir 'mongo-error.log')
  $state.mongo = Process-Entry $mongoProcess $mongoExe; Save-State
  for ($attempt=0; $attempt -lt 60; $attempt++) { if (Test-Port 27031) { break }; if ($mongoProcess.HasExited) { throw 'CD MongoDB baslatilamadi. gunlukler klasorunu kontrol edin.' }; Start-Sleep -Milliseconds 500 }
  if (!(Test-Port 27031)) { throw 'CD MongoDB beklenen surede hazir olmadi.' }
  $nodeExe = Join-Path $appDir 'runtime\node.exe'
  $nodeArgs = '"' + (Join-Path $appDir 'CDLauncher\demo-server.mjs') + '" "' + $demoHome + '"'
  $nodeProcess = Start-Process -FilePath $nodeExe -ArgumentList $nodeArgs -WorkingDirectory $appDir -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $logsDir 'sunucu.log') -RedirectStandardError (Join-Path $logsDir 'sunucu-hata.log')
  $state.server = Process-Entry $nodeProcess $nodeExe; Save-State
  $ready=$false
  for ($attempt=0; $attempt -lt 60; $attempt++) {
    try { $health=Invoke-RestMethod 'http://127.0.0.1:5001/cd-demo/health' -TimeoutSec 1; $ready=$health.demo -eq 'ariza-cd-1' -and $health.success } catch {}
    if ($ready) { break }; if ($nodeProcess.HasExited) { throw 'CD sunucusu baslatilamadi. gunlukler klasorunu kontrol edin.' }; Start-Sleep -Milliseconds 500
  }
  if (!$ready) { throw 'Uygulama hazirlik suresi asildi.' }
  Write-Host 'Hazir: http://127.0.0.1:5001 - Hesaplar GIRIS_BILGILERI.txt dosyasinda.'
  if (!$TarayiciAcma) { Start-Process 'http://127.0.0.1:5001' }
} catch {
  & (Join-Path $PSScriptRoot 'Durdur.ps1') -Sessiz
  throw
}
