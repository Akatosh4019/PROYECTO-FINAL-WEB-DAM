$ErrorActionPreference='Stop'
Push-Location $PSScriptRoot
try {
 docker compose up --build -d
 if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar el web. Revisa Docker Desktop y la conexión.' }
 Write-Host 'Web: http://localhost:8085'
 Write-Host 'El backend debe estar iniciado en el puerto 8088.'
} finally { Pop-Location }
