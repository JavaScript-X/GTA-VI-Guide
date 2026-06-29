param(
  [string]$Container = "gta-vi-guide-postgres-1",
  [string]$Database = "gta_guide",
  [string]$User = "gta_guide",
  [string]$OutDir = "backups"
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outFile = Join-Path $OutDir "$Database-$timestamp.sql"

docker exec $Container pg_dump -U $User $Database > $outFile
Write-Host "Backup written to $outFile"
