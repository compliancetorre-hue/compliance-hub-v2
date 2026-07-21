$root = Join-Path $PSScriptRoot 'frontend'
$port = 3000
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port"
$mime = @{
    '.html'=  'text/html; charset=utf-8'
    '.js'=    'text/javascript; charset=utf-8'
    '.css'=   'text/css; charset=utf-8'
    '.json'=  'application/json'
    '.png'=   'image/png'
    '.jpg'=   'image/jpeg'
    '.jpeg'=  'image/jpeg'
    '.ico'=   'image/x-icon'
    '.svg'=   'image/svg+xml'
    '.woff'=  'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'=   'font/ttf'
}
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $urlPath = $ctx.Request.Url.LocalPath.TrimStart('/')
    if ($urlPath -eq '' -or $urlPath -eq '/') { $urlPath = 'index.html' }
    $filePath = Join-Path $root $urlPath
    if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $ct  = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ctx.Response.ContentType = $ct
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.StatusCode = 200
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
        $ctx.Response.StatusCode = 404
        $ctx.Response.ContentLength64 = $body.Length
        $ctx.Response.OutputStream.Write($body, 0, $body.Length)
    }
    $ctx.Response.Close()
}
