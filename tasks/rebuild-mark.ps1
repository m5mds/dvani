<#
.SYNOPSIS
Rebuild one client mark from brand artwork, on Windows, in a single command.

.DESCRIPTION
Wraps tasks/repair-built-marks.py so a rebuild needs no manual dependency
install, no directory creation, and no copying files into place by hand.
Run it from anywhere inside the clone.

.EXAMPLE
./tasks/rebuild-mark.ps1 north-coffee "$HOME\Pictures\north-coffee.png"

.NOTES
The artwork is copied into assets/brand-sources/client-logos/, which is
gitignored on purpose: this repository is public and the masters are
third-party trademarked assets. Only the derived silhouette is committed.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)][string]$Stem,
    [Parameter(Mandatory = $true, Position = 1)][string]$Artwork
)

$ErrorActionPreference = 'Stop'
$repo = (& git -C $PSScriptRoot rev-parse --show-toplevel 2>$null)
if (-not $repo) { throw "Not inside a git clone. Clone the repo first, then run this from within it." }
Set-Location $repo

if (-not (Test-Path -LiteralPath $Artwork)) {
    throw "Artwork not found: $Artwork`nPass the full path to the image file, in quotes."
}

$python = $null
foreach ($candidate in 'python', 'python3', 'py') {
    if (Get-Command $candidate -ErrorAction SilentlyContinue) { $python = $candidate; break }
}
if (-not $python) { throw "No Python found on PATH. Install it from python.org, then reopen PowerShell." }

Write-Host "Checking dependencies..." -ForegroundColor Cyan
& $python -c "import cv2, numpy, PIL" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing opencv-python-headless, pillow, numpy..." -ForegroundColor Cyan
    & $python -m pip install --quiet --upgrade opencv-python-headless pillow numpy
    if ($LASTEXITCODE -ne 0) { throw "Dependency install failed. Run it by hand to see the error." }
}

Write-Host "Rebuilding $Stem..." -ForegroundColor Cyan
& $python tasks/repair-built-marks.py --artwork $Stem --from $Artwork
if ($LASTEXITCODE -ne 0) { throw "Rebuild failed - see the message above." }

Write-Host "`nChecking the pack..." -ForegroundColor Cyan
& $python tasks/check-client-logo-pack.py
$gate = $LASTEXITCODE

Write-Host "`nChanged files:" -ForegroundColor Cyan
& git status --short -- assets/client-logos-monochrome

if ($gate -ne 0) {
    Write-Host "`nThe checker reported problems above. Nothing has been committed." -ForegroundColor Yellow
} else {
    Write-Host "`nPack is green. To publish:" -ForegroundColor Green
    Write-Host "  git add assets/client-logos-monochrome"
    Write-Host "  git commit -m `"fix(logos): rebuild $Stem from brand artwork`""
    Write-Host "  git push"
}
