function Assert-CompatibleNode {
  try {
    $version = (& node -p "process.versions.node").Trim()
  } catch {
    throw "Node.js is not installed or is not available in PATH. Install Node.js 22 LTS."
  }
  $major = [int]($version.Split('.')[0])
  if ($major -lt 20 -or $major -ge 23) {
    throw "This project requires Node.js 20, 21, or 22. Detected v$version. Node.js 22 LTS is recommended."
  }
  Write-Host "Node.js v$version detected." -ForegroundColor Green
}

function Initialize-LocalEnv {
  if (-not (Test-Path ".\.env")) {
    Copy-Item ".\.env.example" ".\.env"
    Write-Host "Created local .env from .env.example." -ForegroundColor Green
  }

  $content = Get-Content ".\.env" -Raw
  $match = [regex]::Match($content, '(?m)^JWT_SECRET=(.*)$')
  $current = if ($match.Success) { $match.Groups[1].Value.Trim() } else { "" }
  $isWeak = $current.Length -lt 32 -or $current -match '(?i)replace|change|generate|example|secret-before-production'

  if ($isWeak) {
    $secret = ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'))
    if ($match.Success) {
      $content = [regex]::Replace($content, '(?m)^JWT_SECRET=.*$', "JWT_SECRET=$secret")
    } else {
      $content = $content.TrimEnd() + "`r`nJWT_SECRET=$secret`r`n"
    }
    Set-Content ".\.env" $content -Encoding UTF8
    Write-Host "Generated a private JWT secret for local development." -ForegroundColor Green
  }
}
