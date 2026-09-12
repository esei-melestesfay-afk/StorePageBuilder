Set-Location $PSScriptRoot

# Hämta alltid senaste versionen från GitHub först.
# Om internet saknas fortsätter den lokala versionen att fungera.
try {
    git pull --ff-only --quiet 2>$null
} catch {
}

# Om servern redan körs räcker det att öppna sidan igen.
# Statiska filer läses direkt från mappen, så en uppdaterad app.js/index.html
# blir tillgänglig efter en vanlig Ctrl+F5 i webbläsaren.
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

py -3 .\server.py
