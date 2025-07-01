$IMAGE_NAME = "mcp-catalog"
$TAG = "latest"

Write-Host "🔨 MCP Catalog Docker 이미지 빌드 시작" -ForegroundColor Green

# Docker 이미지 빌드
Write-Host "📦 Docker 이미지 빌드 중..." -ForegroundColor Yellow
docker build -t "${IMAGE_NAME}:${TAG}" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 빌드 성공!" -ForegroundColor Green
    Write-Host "📋 이미지: ${IMAGE_NAME}:${TAG}" -ForegroundColor Yellow
    Write-Host "🎉 이제 이 이미지를 어디든 배포할 수 있습니다!" -ForegroundColor Green
} else {
    Write-Host "❌ 빌드 실패" -ForegroundColor Red
    exit 1
} 