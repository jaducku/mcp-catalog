# AWS ECS 배포용 MCP Catalog Docker 이미지 빌드 스크립트 (PowerShell)

param(
    [string]$Tag = "latest",
    [string]$Platform = "linux/amd64"
)

# 에러 발생 시 스크립트 중단
$ErrorActionPreference = "Stop"

# 변수 설정
$ImageName = "mcp-catalog"

Write-Host "🐳 AWS ECS용 MCP Catalog Docker 이미지 빌드 시작..." -ForegroundColor Blue
Write-Host "📦 이미지: $ImageName`:$Tag" -ForegroundColor Yellow
Write-Host "🏗️  플랫폼: $Platform" -ForegroundColor Yellow

# 빌드 시작 시간 기록
$StartTime = Get-Date

try {
    # Docker 빌드 실행
    Write-Host "🔨 Docker 이미지 빌드 중..." -ForegroundColor Blue
    
    # 사내 proxy 설정이 빌드에 영향을 주지 않도록 설정
    $env:HTTP_PROXY = ""
    $env:HTTPS_PROXY = ""
    $env:http_proxy = ""
    $env:https_proxy = ""
    
    docker build `
        --platform $Platform `
        --tag "$ImageName`:$Tag" `
        --tag "$ImageName`:latest" `
        --no-cache `
        --build-arg HTTP_PROXY="" `
        --build-arg HTTPS_PROXY="" `
        --build-arg http_proxy="" `
        --build-arg https_proxy="" `
        .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker 빌드 실패"
    }
    
    # 빌드 완료 시간 계산
    $EndTime = Get-Date
    $Duration = [math]::Round(($EndTime - $StartTime).TotalSeconds)
    
    Write-Host "✅ Docker 이미지 빌드 완료! ($Duration 초 소요)" -ForegroundColor Green
    
    # 이미지 정보 출력
    Write-Host "📊 이미지 정보:" -ForegroundColor Blue
    docker images "$ImageName`:$Tag"
    
    # 이미지 크기 확인
    $ImageInfo = docker images "$ImageName`:$Tag" --format "table {{.Size}}" | Select-Object -Last 1
    Write-Host "📏 이미지 크기: $ImageInfo" -ForegroundColor Yellow
    
    # 보안 스캔 (Trivy가 설치된 경우)
    if (Get-Command trivy -ErrorAction SilentlyContinue) {
        Write-Host "🔍 보안 스캔 실행 중..." -ForegroundColor Blue
        trivy image --severity HIGH,CRITICAL "$ImageName`:$Tag"
    }
    
    # 헬스체크 테스트
    Write-Host "🏥 헬스체크 테스트..." -ForegroundColor Blue
    $ContainerId = docker run -d -p 3001:3000 "$ImageName`:$Tag"
    
    if ($LASTEXITCODE -ne 0) {
        throw "컨테이너 실행 실패"
    }
    
    # 컨테이너 시작 대기
    Start-Sleep -Seconds 10
    
    # 헬스체크 확인
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -TimeoutSec 10
        if ($Response.StatusCode -eq 200) {
            Write-Host "✅ 헬스체크 성공!" -ForegroundColor Green
        } else {
            Write-Host "❌ 헬스체크 실패!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 헬스체크 실패!" -ForegroundColor Red
    }
    
    # 컨테이너 정리
    docker stop $ContainerId | Out-Null
    docker rm $ContainerId | Out-Null
    
    Write-Host "🎉 빌드 및 테스트 완료!" -ForegroundColor Green
    Write-Host "💡 다음 단계:" -ForegroundColor Yellow
    Write-Host "   1. ECR에 푸시: docker push your-account.dkr.ecr.region.amazonaws.com/$ImageName`:$Tag"
    Write-Host "   2. ECS 서비스 업데이트"
    Write-Host "   3. 배포 확인"
    
} catch {
    Write-Host "❌ 빌드 실패: $_" -ForegroundColor Red
    
    # 컨테이너 정리 (실패 시에도)
    if ($ContainerId) {
        docker stop $ContainerId 2>$null | Out-Null
        docker rm $ContainerId 2>$null | Out-Null
    }
    
    exit 1
} 