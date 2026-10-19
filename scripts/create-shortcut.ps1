param(
  [string]$LauncherDir = 'D:\DSH\tavern-launcher',
  [string]$ShortcutName = 'DSH 酒馆.lnk'
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop $ShortcutName
$vbs = Join-Path $LauncherDir 'launch-tavern.vbs'
if (-not (Test-Path -LiteralPath $vbs)) {
  throw "launcher not found: $vbs"
}

$target = Join-Path $env:WINDIR 'System32\wscript.exe'
$icon = Join-Path $LauncherDir 'tavern.ico'

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.Arguments = '"' + $vbs + '"'
$shortcut.WorkingDirectory = $LauncherDir
if (Test-Path -LiteralPath $icon) {
  $shortcut.IconLocation = $icon + ',0'
}
$shortcut.Description = 'Start the standalone DSH Tavern page (does not switch the official DSH)'
$shortcut.Save()

Write-Output $shortcutPath
