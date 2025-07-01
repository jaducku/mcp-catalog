#!/bin/bash

# MCP Catalog Kubernetes 배포 스크립트
# 사용법: ./deploy.sh [환경] [네임스페이스]
# 예시: ./deploy.sh prod mcp-system

set -e

# 기본값 설정
ENVIRONMENT=${1:-prod}
NAMESPACE=${2:-default}
APP_NAME="mcp-catalog"
VERSION=${VERSION:-latest}

echo "🚀 MCP Catalog 배포 시작..."
echo "📋 환경: $ENVIRONMENT"
echo "📋 네임스페이스: $NAMESPACE"
echo "📋 버전: $VERSION"

# 네임스페이스 생성 (존재하지 않는 경우)
echo "📁 네임스페이스 확인/생성 중..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# ConfigMap 선택
CONFIGMAP_NAME="mcp-catalog-config"
if [ "$ENVIRONMENT" = "dev" ]; then
    CONFIGMAP_NAME="mcp-catalog-dev-config"
fi

echo "🔧 ConfigMap 적용 중: $CONFIGMAP_NAME"
kubectl apply -f configmap.yaml -n $NAMESPACE

# Deployment에서 ConfigMap 참조 업데이트
echo "🔄 Deployment 설정 업데이트 중..."
cat deployment.yaml | \
    sed "s/name: mcp-catalog-config/name: $CONFIGMAP_NAME/g" | \
    sed "s/namespace: default/namespace: $NAMESPACE/g" | \
    sed "s/image: mcp-catalog:latest/image: $APP_NAME:$VERSION/g" | \
    kubectl apply -f - -n $NAMESPACE

# 배포 상태 확인
echo "⏳ 배포 상태 확인 중..."
kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=300s

# Pod 상태 확인
echo "📦 Pod 상태 확인 중..."
kubectl get pods -l app=$APP_NAME -n $NAMESPACE

# 서비스 확인
echo "🌐 서비스 확인 중..."
kubectl get svc -l app=$APP_NAME -n $NAMESPACE

# Ingress 확인 (있는 경우)
if kubectl get ingress -n $NAMESPACE | grep -q $APP_NAME; then
    echo "🔗 Ingress 확인 중..."
    kubectl get ingress -l app=$APP_NAME -n $NAMESPACE
fi

echo "✅ 배포 완료!"
echo "🔍 로그 확인: kubectl logs -l app=$APP_NAME -n $NAMESPACE -f"
echo "🌐 포트 포워딩: kubectl port-forward svc/$APP_NAME-service 3000:80 -n $NAMESPACE" 