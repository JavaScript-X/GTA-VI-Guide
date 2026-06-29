param(
  [Parameter(Mandatory = $true)][string]$BackupFile,
  [string]$Container = "gta-vi-guide-postgres-1",
  [string]$Database = "gta_guide",
  [string]$User = "gta_guide"
)

Get-Content $BackupFile | docker exec -i $Container psql -U $User $Database
Write-Host "Restore completed from $BackupFile"
