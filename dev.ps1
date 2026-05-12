# dev.ps1
# Start both API server and Vite dev server with proper PATH

$nodePath = 'C:\ProgramData\Applications\nodejs'
$env:PATH = "$nodePath;$env:PATH"

Write-Host "Starting API server and Vite dev server..."
Write-Host ""

# Start API server in background
Write-Host "Starting API server on port 3001..."
$apiJob = Start-Job -ScriptBlock {
    $nodePath = 'C:\ProgramData\Applications\nodejs'
    $env:PATH = "$nodePath;$env:PATH"
    cd 'C:\GitHub\journal-finder-test'
    node api.js
}

# Give API server time to start
Start-Sleep 2

# Start Vite dev server in foreground
Write-Host "Starting Vite dev server..."
$nodePath = 'C:\ProgramData\Applications\nodejs'
$env:PATH = "$nodePath;$env:PATH"
npm run vite

# Cleanup
Stop-Job $apiJob
