# NPM 설정 초기화 스크립트 (PowerShell)
# 사외 빌드 환경에서 사내 proxy 설정을 제거하는 스크립트

Write-Host "🔧 NPM 설정 초기화 중..." -ForegroundColor Blue

try {
    # 기존 proxy 설정 제거
    npm config delete proxy 2>$null
    npm config delete https-proxy 2>$null
    npm config delete http-proxy 2>$null
    
    # 기본 registry 설정
    npm config set registry https://registry.npmjs.org/
    
    # SSL 검증 활성화
    npm config set strict-ssl true
    
    # 캐시 정리
    npm cache clean --force
    
    Write-Host "✅ NPM 설정이 초기화되었습니다." -ForegroundColor Green
    Write-Host "📋 현재 NPM 설정:" -ForegroundColor Yellow
    npm config list
    
} catch {
    Write-Host "❌ NPM 설정 초기화 실패: $_" -ForegroundColor Red
    exit 1
} 