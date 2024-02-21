# instalador deimos (windows)

$patcher = "$PWD\dist\patcher.js"
$patcher_safe = $patcher -replace '\\', '\\'

$APP_PATCH = @"
require("$patcher_safe");
require("../app.asar");
"@

$PACKAGE_JSON = @"
{
    "main": "index.js",
    "name": "discord"
}
"@

$branch_paths = Get-ChildItem -Directory -Path $env:LOCALAPPDATA |
    Select-String -Pattern "Discord\w*" -AllMatches |
    Select-String -Pattern "DiscordGames" -NotMatch # ignora a pasta discordgames

$branches = @()

foreach ($branch in $branch_paths) {
    $branch = $branch.Line.Split("\")[-1]

    if ($branch -eq "Discord") {
        $branch = "Discord Stable"
    } else {
        $branch = $branch.Replace("Discord", "Discord ")
    }

    $branches = $branches + $branch
}

$branch_count = $branches.Count

Write-Output "$branch_count branches encontrados"
Write-Output "==========================================="
Write-Output "===== selecione uma branch para patch ====="

$i = 0
foreach ($branch in $branches) {
    Write-Output "=== $i. $branch"

    $i++
}

Write-Output "==========================================="
$pos = Read-Host "insira um número"

if ($null -eq $branches[$pos]) {
    Write-Output "seleção de branch inválida"

    exit
}

$branch = $branches.Get($pos)
$discord_root = $branch_paths.Get($pos)

Write-Output "`npatching $branch"

$app_folders = Get-ChildItem -Directory -Path $discord_root |
    Select-String -Pattern "app-"

foreach ($folder in $app_folders)
{
    $version = [regex]::match($folder, 'app-([\d\.]+)').Groups[1].Value
    Write-Output "patching versão $version"

    $resources = "$folder\resources"

    if (-not(Test-Path -Path "$resources")) {
        Write-Error "pasta resources não existe. versão desatualizada?`n"

        continue
    }

    if (-not(Test-Path -Path "$resources\app.asar")) {
        Write-Error "falha ao encontrar app.asar em $folder`n"

        continue
    }

    $app = "$resources\app"

    if (Test-Path -Path $app) {
        Write-Error "você já corrigiu? pasta app já existente em $resources`n"

        continue
    }

    $null = New-Item -Path $app -ItemType Directory

    $null = Tee-Object -InputObject $APP_PATCH -FilePath "$app\index.js"
	$null = Tee-Object -InputObject $PACKAGE_JSON -FilePath "$app\package.json"

    Write-Output "$branch corrigida (versão $version) com sucesso"
}