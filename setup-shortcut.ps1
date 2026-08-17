$Project = $PSScriptRoot
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Store Page Builder.lnk"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$Project\start.ps1`""
$Shortcut.WorkingDirectory = $Project
$Shortcut.Hotkey = "CTRL+ALT+Z"
$Shortcut.WindowStyle = 7
$Shortcut.Description = "Starta Store Page Builder"
$Shortcut.Save()

Write-Host ""
Write-Host "Klart!" -ForegroundColor Green
Write-Host "Genvag skapad pa skrivbordet: Store Page Builder" -ForegroundColor Green
Write-Host "Kortkommando: CTRL + ALT + Z" -ForegroundColor Cyan
Write-Host ""
