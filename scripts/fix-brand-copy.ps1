# =====================================================================
# fix-brand-copy.ps1 — one-shot copy update for the studio rebrand.
#
# Replaces (everywhere except _design-source / node_modules / .next /
# .git / public):
#   500+          → 200+
#   since 2022    → since 2024
#   four years    → two years   (and case variants)
#   4yr           → 2yr         (stat-card unit)
#   Theo Vortek   → Hector G.
#   Theo, founder → Hector G., founder
#   Theo is the studio owner → Hector G. is the studio owner
#   Theo · Design Vortex     → Hector G. · Design Vortex
#
# The first-person rewrites on the about page + blog bios are done
# by hand because they're context-dependent.
# =====================================================================

param([string]$Root = $PSScriptRoot + "\..")

$Root = (Resolve-Path $Root).Path
$exts = @("*.ts","*.tsx","*.mjs","*.md","*.json","*.css")
$skipPatterns = @("\node_modules\","\.next\","\_design-source\","\.git\","\public\")

# Pairs: (find, replace). Order matters — do longer/more-specific first.
$pairs = @(
  ,@('Theo · Design Vortex founder', 'Hector G. · Design Vortex founder')
  ,@('Theo is the studio owner',     'Hector G. is the studio owner')
  ,@('Theo, founder',                'Hector G., founder')
  ,@('Theo Vortek',                  'Hector G.')
  ,@('since 2022',                   'since 2024')
  ,@('Since 2022',                   'Since 2024')
  ,@('Four years of',                'Two years of')
  ,@('four years of',                'two years of')
  ,@('In four years and ',           'In two years and ')
  ,@('in four years and ',           'in two years and ')
  ,@('four years running',           'two years running')
  ,@('Four years later',             'Two years in')
  ,@('over four years',              'over two years')
  ,@('500+',                         '200+')
  ,@('500 commissions',              '200 commissions')
  ,@('4yr',                          '2yr')
)

$utf8NoBOM = New-Object System.Text.UTF8Encoding $false
$files = Get-ChildItem -Path $Root -Recurse -File -Include $exts -ErrorAction SilentlyContinue |
  Where-Object {
    $p = $_.FullName
    $skip = $false
    foreach ($pat in $skipPatterns) { if ($p.Contains($pat)) { $skip = $true; break } }
    -not $skip
  }

$updated = 0
$totalReplacements = 0
foreach ($f in $files) {
  $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $orig = $text
  $fileReps = 0
  foreach ($pair in $pairs) {
    if ($text.Contains($pair[0])) {
      $count = ($text.Length - $text.Replace($pair[0], "").Length) / $pair[0].Length
      $text = $text.Replace($pair[0], $pair[1])
      $fileReps += $count
    }
  }
  if ($text -ne $orig) {
    [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBOM)
    $updated++
    $totalReplacements += $fileReps
    $rel = $f.FullName.Substring($Root.Length + 1)
    Write-Host ("  {0,4} -> {1}" -f $fileReps, $rel)
  }
}

Write-Host ""
Write-Host "Done. Updated $updated of $($files.Count) files, $totalReplacements total replacements."
