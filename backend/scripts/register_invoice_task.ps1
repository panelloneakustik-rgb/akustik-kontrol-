# Run once in an elevated PowerShell if you want Task Scheduler to pick this up automatically:
#   powershell -ExecutionPolicy Bypass -File C:\akustik\backend\scripts\register_invoice_task.ps1

$python = "C:\akustik\backend\venv\Scripts\python.exe"
$workDir = "C:\akustik\backend"
$action = New-ScheduledTaskAction -Execute $python -Argument "manage.py check_invoice_emails" -WorkingDirectory $workDir
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName "AkustikKontrol-EFatura" -Action $action -Trigger $trigger -Settings $settings -Description "Luca e-fatura PDF maillerini siparislerle eslestirir" -Force
Write-Host "Task registered: AkustikKontrol-EFatura (every 5 minutes)"
