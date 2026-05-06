# npm-with-path.ps1
# Prepends the Node.js install folder to PATH and runs npm with any provided arguments.

$nodePath = 'C:\ProgramData\Applications\nodejs'
$env:PATH = "$nodePath;$env:PATH"

if ($args.Count -eq 0) {
    Write-Error 'Usage: .\npm-with-path.ps1 <npm-command> [args]'
    exit 1
}

npm @args
