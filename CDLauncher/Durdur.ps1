param([switch]$Sessiz)
$ErrorActionPreference = 'Stop'
$demoHome = Join-Path $env:LOCALAPPDATA 'SerafettinStaj\ArizaTakipCD'
$statePath = Join-Path $demoHome 'calisma-durumu.json'
if (!(Test-Path -LiteralPath $statePath)) { if (!$Sessiz) { Write-Host 'Bu CD uygulamasina ait acik oturum bulunamadi.' }; exit 0 }
$state = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
function Get-Owned($entry) {
  if (!$entry) { return $null }
  try { $running = Get-Process -Id ([int]$entry.pid) -ErrorAction Stop; if ($running.Path -eq $entry.exe -and $running.StartTime.ToUniversalTime().Ticks.ToString() -eq $entry.started) { return $running } } catch {}
  return $null
}
$ownedServer = Get-Owned $state.server; $ownedMongo = Get-Owned $state.mongo
if ($ownedServer -and $ownedMongo) {
  $appDir=Join-Path $demoHome 'Uygulama'
  & (Join-Path $appDir 'runtime\node.exe') (Join-Path $appDir 'CDLauncher\durdur.mjs') $demoHome | Out-Null
  Start-Sleep -Milliseconds 800
}
foreach ($entry in @($state.server,$state.mongo)) {
  $owned = Get-Owned $entry
  if ($owned) { Stop-Process -Id $owned.Id -Force; try { $owned.WaitForExit(5000) | Out-Null } catch {} }
}
Remove-Item -LiteralPath $statePath -Force
if (!$Sessiz) { Write-Host 'Yalnizca Ariza Takip CD uygulamasinin kayitli islemleri durduruldu. Demo verileri korundu.' }
