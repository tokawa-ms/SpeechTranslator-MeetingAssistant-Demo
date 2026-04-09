<#
.SYNOPSIS
  Docker イメージをビルド・プッシュし、Azure Container Apps にデプロイするスクリプト
.DESCRIPTION
  1. .env ファイルから環境変数を読み込み
  2. ACR にログインしイメージをビルド＆プッシュ
  3. Bicep テンプレートで Container App をデプロイ
#>
param(
    [string]$ResourceGroup,
    [string]$RegistryName,
    [string]$ImageName = "multilangtranslator",
    [string]$ImageTag = "latest"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── .env 読み込み ──
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+)\s*$') {
            [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
        }
    }
    Write-Host "[INFO] .env を読み込みました"
}
else {
    Write-Warning ".env ファイルが見つかりません。環境変数が事前に設定されていることを確認してください。"
}

# パラメータ未指定時は環境変数から取得
if (-not $ResourceGroup) { $ResourceGroup = $env:RESOURCE_GROUP }
if (-not $RegistryName) { $RegistryName = $env:CONTAINER_REGISTRY_NAME }

if (-not $ResourceGroup -or -not $RegistryName) {
    Write-Error "RESOURCE_GROUP / CONTAINER_REGISTRY_NAME が .env またはパラメータで指定されていません。"
    exit 1
}

$registryServer = az acr show --name $RegistryName --query loginServer -o tsv
$fullImage = "$registryServer/${ImageName}:${ImageTag}"

# ── 1. ACR ログイン ──
Write-Host "`n[1/3] ACR ($RegistryName) にログイン..."
az acr login --name $RegistryName

# ── 2. Docker ビルド & プッシュ ──
Write-Host "`n[2/3] Docker イメージをビルド ($fullImage)..."
docker build -t $fullImage .
docker push $fullImage

# ── 3. Bicep デプロイ ──
Write-Host "`n[3/3] Bicep テンプレートをデプロイ..."
$deployResult = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file "infra/main.bicep" `
    --parameters "infra/main.bicepparam" `
    --parameters imageName="${ImageName}:${ImageTag}" `
    --query "properties.outputs" `
    -o json | ConvertFrom-Json

$appUrl = $deployResult.containerAppUrl.value
$principalId = $deployResult.principalId.value
Write-Host "[INFO] デプロイ完了: $appUrl"

Write-Host "`n=========================================="
Write-Host "デプロイ完了!"
Write-Host "URL: $appUrl"
Write-Host "=========================================="
Write-Host ""
Write-Host "[NOTE] Speech / OpenAI リソースへのアクセスには、"
Write-Host "       Container App のマネージド ID (principalId: $principalId) に"
Write-Host "       'Cognitive Services User' ロールを付与してください:"
Write-Host ""
Write-Host "  az role assignment create ``"
Write-Host "    --assignee-object-id $principalId ``"
Write-Host "    --assignee-principal-type ServicePrincipal ``"
Write-Host "    --role 'Cognitive Services User' ``"
Write-Host "    --scope <SPEECH_OR_OPENAI_RESOURCE_ID>"
