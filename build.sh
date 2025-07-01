#!/bin/bash

# AWS ECS 배포용 MCP Catalog Docker 이미지 빌드 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 변수 설정
IMAGE_NAME="mcp-catalog"
TAG="${1:-latest}"
PLATFORM="${2:-linux/amd64}"

echo -e "${BLUE}🐳 AWS ECS용 MCP Catalog Docker 이미지 빌드 시작...${NC}"
echo -e "${YELLOW}📦 이미지: ${IMAGE_NAME}:${TAG}${NC}"
echo -e "${YELLOW}🏗️  플랫폼: ${PLATFORM}${NC}"

# 빌드 시작 시간 기록
start_time=$(date +%s)

# Docker 빌드 실행
echo -e "${BLUE}🔨 Docker 이미지 빌드 중...${NC}"
docker build \
  --platform ${PLATFORM} \
  --tag ${IMAGE_NAME}:${TAG} \
  --tag ${IMAGE_NAME}:latest \
  --no-cache \
  .

# 빌드 완료 시간 계산
end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "${GREEN}✅ Docker 이미지 빌드 완료! (${duration}초 소요)${NC}"

# 이미지 정보 출력
echo -e "${BLUE}📊 이미지 정보:${NC}"
docker images ${IMAGE_NAME}:${TAG}

# 이미지 크기 확인
image_size=$(docker images ${IMAGE_NAME}:${TAG} --format "table {{.Size}}" | tail -n 1)
echo -e "${YELLOW}📏 이미지 크기: ${image_size}${NC}"

# 보안 스캔 (Trivy가 설치된 경우)
if command -v trivy &> /dev/null; then
    echo -e "${BLUE}🔍 보안 스캔 실행 중...${NC}"
    trivy image --severity HIGH,CRITICAL ${IMAGE_NAME}:${TAG}
fi

# 헬스체크 테스트
echo -e "${BLUE}🏥 헬스체크 테스트...${NC}"
container_id=$(docker run -d -p 3001:3000 ${IMAGE_NAME}:${TAG})

# 컨테이너 시작 대기
sleep 10

# 헬스체크 확인
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 헬스체크 성공!${NC}"
else
    echo -e "${RED}❌ 헬스체크 실패!${NC}"
fi

# 컨테이너 정리
docker stop ${container_id} > /dev/null 2>&1
docker rm ${container_id} > /dev/null 2>&1

echo -e "${GREEN}🎉 빌드 및 테스트 완료!${NC}"
echo -e "${YELLOW}💡 다음 단계:${NC}"
echo -e "   1. ECR에 푸시: docker push your-account.dkr.ecr.region.amazonaws.com/${IMAGE_NAME}:${TAG}"
echo -e "   2. ECS 서비스 업데이트"
echo -e "   3. 배포 확인" 