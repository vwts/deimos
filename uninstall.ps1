# desinstalador deimos

$branch_paths = Get-ChildItem -Directory -Path $env:LOCALAPPDATA |
    Select-String -Pattern "Discord\w*" -AllMatches |
    Select-String -Pattern "DiscordGames" -NotMatch # ignorar pasta discordgames

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

Write-Output "$branch_count branches encontradas"
Write-Output "==================================================="
Write-Output "===== selecione uma branche para descompactar ====="

$i = 0
foreach ($branch in $branches) {
    Write-Output "=== $i. $branch"

    $i++
}

Write-Output "==================================================="
$pos = Read-Host "digite um número"

if ($null -eq $branches[$pos]) {
    Write-Output "seleção de branch inválida"

    exit
}

$branch = $branches.Get($pos)
$discord_root = $branch_paths.Get($pos)

Write-Output "`ndescompactando $branch"

$app_folders = Get-ChildItem -Directory -Path $discord_root |
    Select-String -Pattern "app-"

foreach ($folder in $app_folders)
{
    $version = [regex]::match($folder, 'app-([\d\.]+)').Groups[1].Value

    Write-Output "descompactando $branch versão $version"

    $resources = "$folder\resources"

    if (-not(Test-Path -Path "$resources")) {
        Write-Output "pasta resources não existe... possivelmente uma cópia desatualizada e pode ser ignorada.`n"

        continue
    }

    if (-not(Test-Path -Path "$resources\app")) {
        Write-Output "pasta app não existe... já foi descompactada?`n"

        continue
    }

    Remove-Item -Path "$folder\resources\app" -Recurse -Force -Confirm:$false

    if (Test-Path "$folder\resources\app")
    {
        Write-Error "falha ao deletar $folder\resources\app"
    } else {
        Write-Output "$branch descompactada com sucesso (versão $version)"
    }
}