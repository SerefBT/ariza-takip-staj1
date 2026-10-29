param([string]$ServerUrl='http://192.168.1.182:5000')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME=Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:GRADLE_USER_HOME=Join-Path $projectRoot '.tools\gradle'
$env:ANDROID_USER_HOME=Join-Path $projectRoot '.tools\android'
$env:VITE_API_BASE_URL=$ServerUrl
Push-Location frontend
try {
  & npm.cmd run build
  if($LASTEXITCODE -ne 0){throw 'Web derlemesi basarisiz.'}
  & npx.cmd cap sync android
  if($LASTEXITCODE -ne 0){throw 'Android esitlemesi basarisiz.'}
} finally { Pop-Location; Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue }
Push-Location frontend\android
try { & .\gradlew.bat --no-daemon assembleDebug; if($LASTEXITCODE -ne 0){throw 'APK derlemesi basarisiz.'} } finally { Pop-Location }
New-Item -ItemType Directory -Path artifacts -Force | Out-Null
Copy-Item -LiteralPath 'frontend\android\app\build\outputs\apk\debug\app-debug.apk' -Destination 'artifacts\ArizaTakip-1.0.0.apk' -Force
& npm.cmd run build
if($LASTEXITCODE -ne 0){throw 'Web dagitim derlemesi basarisiz.'}
Write-Host 'APK hazir: artifacts\ArizaTakip-1.0.0.apk'
