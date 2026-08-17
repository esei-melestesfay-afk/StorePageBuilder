Set-Location $PSScriptRoot

# Snabb kontroll: om servern redan körs, öppna sidan direkt.
$alreadyRunning = $false
$client = $null
try {
    $client = New-Object System.Net.Sockets.TcpClient
    $task = $client.ConnectAsync("127.0.0.1", 8765)
    if ($task.Wait(180) -and $client.Connected) {
        $alreadyRunning = $true
    }
} catch {
} finally {
    if ($client) { $client.Dispose() }
}

if ($alreadyRunning) {
    Start-Process "http://127.0.0.1:8765"
    exit
}

# Hämta senaste versionen tyst. Om internet saknas startar den lokala versionen ändå.
try {
    git pull --ff-only --quiet 2>$null
} catch {
}

py -3 .\server.py
