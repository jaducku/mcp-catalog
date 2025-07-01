#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

IMAGE_NAME="mcp-catalog"
TAG="latest"

echo -e "${GREEN}🔨 MCP Catalog Docker 이미지 빌드 시작${NC}"

# Docker 이미지 빌드
echo -e "${YELLOW}📦 Docker 이미지 빌드 중...${NC}"
docker build -t ${IMAGE_NAME}:${TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 빌드 성공!${NC}"
    echo -e "${YELLOW}📋 이미지: ${IMAGE_NAME}:${TAG}${NC}"
    echo -e "${GREEN}🎉 이제 이 이미지를 어디든 배포할 수 있습니다!${NC}"
else
    echo -e "${RED}❌ 빌드 실패${NC}"
    exit 1
fi 