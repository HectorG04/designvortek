# =====================================================================
# fix-mojibake.ps1 — one-shot pass over the codebase.
#
# Replaces the most common UTF-8-read-as-CP1252 mojibake sequences
# introduced by PowerShell edits and writes files back as UTF-8 (no BOM).
#
# Pairs (find, replace) — char codes are the Unicode code points of
# the visible mojibake characters as they appear when the file is read
# as UTF-8 (which it is in our app):
#
#   â€™  (U+00E2 U+20AC U+2122)  → '  (U+2019, right single quote)
#   â€œ  (U+00E2 U+20AC U+0153)  → "  (U+201C, left double quote)
#   â€¦  (U+00E2 U+20AC U+00A6)  → …  (U+2026, ellipsis)
#   â€¢  (U+00E2 U+20AC U+00A2)  → •  (U+2022, bullet)
#   â€"  (U+00E2 U+20AC U+201D)  → —  (U+2014, em-dash)
#   â€"  (U+00E2 U+20AC U+201C)  → –  (U+2013, en-dash)
#   Â·   (U+00C2 U+00B7)         → ·  (U+00B7, middle dot)
#   Â    (U+00C2 U+00A0)         → nbsp (U+00A0)
#   Ã—   (U+00C3 U+2014)         → ×  (U+00D7, multiplication)
#   Ã©   (U+00C3 U+00A9)         → é  (U+00E9)
#   Ã¨   (U+00C3 U+00A8)         → è  (U+00E8)
# =====================================================================

param([string]$Root = $PSScriptRoot + "\..")

$Root = (Resolve-Path $Root).Path
$exts = @("*.ts","*.tsx","*.mjs","*.md","*.json","*.css")
$skipPatterns = @("\node_modules\","\.next\","\_design-source\","\.git\","\public\")

# Build mojibake → correct pairs using explicit char-code construction.
# Each pair is [string find, string replace].
$pairs = New-Object 'System.Collections.Generic.List[System.Object]'
$pairs.Add(@(([string][char]0xE2 + [char]0x20AC + [char]0x2122), ([string][char]0x2019)))   # â€™ → '
$pairs.Add(@(([string][char]0xE2 + [char]0x20AC + [char]0x0153), ([string][char]0x201C)))   # â€œ → "
$pairs.Add(@(([string][char]0xE2 + [char]0x20AC + [char]0x00A6), ([string][char]0x2026)))   # â€¦ → …
$pairs.Add(@(([string][char]0xE2 + [char]0x20AC + [char]0x00A2), ([string][char]0x2022)))   # â€¢ → •
$pairs.Add(@(([string][char]0xE2 + [char]0x20AC + [char]0x201D), ([string][char]0x2014)))   # â€" → — (em-dash)
$pairs.Add(@(([string][char]0xE2 + [char]0x20AC + [char]0x201C), ([string][char]0x2013)))   # â€" → – (en-dash)
$pairs.Add(@(([string][char]0xC2 + [char]0xB7),                  ([string][char]0xB7)))     # Â· → ·
$pairs.Add(@(([string][char]0xC2 + [char]0xA0),                  ([string][char]0xA0)))     # Â  → nbsp
$pairs.Add(@(([string][char]0xC3 + [char]0x2014),                ([string][char]0xD7)))     # Ã— → ×
$pairs.Add(@(([string][char]0xC3 + [char]0xA9),                  ([string][char]0xE9)))     # Ã© → é
$pairs.Add(@(([string][char]0xC3 + [char]0xA8),                  ([string][char]0xE8)))     # Ã¨ → è

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
  $fileReplacements = 0
  foreach ($pair in $pairs) {
    $find = $pair[0]
    $replace = $pair[1]
    if ($text.Contains($find)) {
      $count = ($text.Length - $text.Replace($find, "").Length) / $find.Length
      $text = $text.Replace($find, $replace)
      $fileReplacements += $count
    }
  }
  if ($text -ne $orig) {
    [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBOM)
    $updated++
    $totalReplacements += $fileReplacements
    $rel = $f.FullName.Substring($Root.Length + 1)
    Write-Host ("  {0,4} -> {1}" -f $fileReplacements, $rel)
  }
}

Write-Host ""
Write-Host "Done. Updated $updated of $($files.Count) files, $totalReplacements total replacements."
