# Script para renomear os arquivos de música para o formato esperado pelo sistema

# Diretórios onde os arquivos de música podem estar
$sourceDirs = @(
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop"
)

# Lista de nomes originais e novos nomes (baseado na imagem enviada)
$musicFiles = @(
    @{Original = "Silent Starscape(1).mp3"; New = "galaxy-music-1.mp3"},
    @{Original = "Silent Starscape.mp3"; New = "galaxy-music-2.mp3"},
    @{Original = "Whispers of the Stars.mp3"; New = "galaxy-music-3.mp3"},
    @{Original = "Wanderers Among the Stars.mp3"; New = "galaxy-music-4.mp3"},
    @{Original = "Across the Silent Stars.mp3"; New = "galaxy-music-5.mp3"},
    @{Original = "Galactic Whisper(1).mp3"; New = "galaxy-music-6.mp3"},
    @{Original = "Galactic Whisper.mp3"; New = "galaxy-music-7.mp3"},
    @{Original = "Silent Horizons.mp3"; New = "galaxy-music-8.mp3"},
    @{Original = "Echoes in the Void(1).mp3"; New = "galaxy-music-9.mp3"}
)

# Diretório de destino
$destinationDir = ".\public\sounds\"

# Verifica se o diretório de destino existe
if (-not (Test-Path $destinationDir)) {
    Write-Host "Criando diretório $destinationDir"
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
}

# Função para encontrar e copiar o arquivo
function Find-And-Copy-File {
    param (
        [string]$fileName,
        [string]$destination
    )
    
    foreach ($dir in $sourceDirs) {
        $filePath = Join-Path -Path $dir -ChildPath $fileName
        if (Test-Path $filePath) {
            Write-Host "Copiando $filePath para $destination"
            Copy-Item -Path $filePath -Destination $destination -Force
            return $true
        }
    }
    
    Write-Host "Arquivo não encontrado: $fileName" -ForegroundColor Yellow
    return $false
}

# Renomeia e move os arquivos
foreach ($file in $musicFiles) {
    $newPath = Join-Path -Path $destinationDir -ChildPath $file.New
    Find-And-Copy-File -fileName $file.Original -destination $newPath
}

Write-Host "Processo concluído!" -ForegroundColor Green
Write-Host "Os arquivos foram copiados para $destinationDir" 