# AWS ECS 배포 가이드

MCP Catalog 애플리케이션을 AWS ECS(Elastic Container Service)에 배포하는 방법을 설명합니다.

## 📋 사전 요구사항

### 1. AWS CLI 설치 및 설정
```bash
# AWS CLI 설치 확인
aws --version

# AWS 자격 증명 설정
aws configure
```

### 2. Docker 설치
```bash
# Docker 설치 확인
docker --version
```

### 3. 필요한 AWS 권한
- ECR (Elastic Container Registry) 접근 권한
- ECS (Elastic Container Service) 관리 권한
- IAM 역할 생성 권한
- CloudWatch Logs 접근 권한

## 🏗️ 1단계: ECR 리포지토리 생성

### ECR 리포지토리 생성
```bash
# ECR 리포지토리 생성
aws ecr create-repository \
    --repository-name mcp-catalog \
    --region us-east-1

# 출력 예시:
# {
#     "repository": {
#         "repositoryArn": "arn:aws:ecr:us-east-1:123456789012:repository/mcp-catalog",
#         "registryId": "123456789012",
#         "repositoryName": "mcp-catalog",
#         "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog"
#     }
# }
```

### ECR 로그인
```bash
# ECR 로그인 토큰 가져오기
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

## 🐳 2단계: Docker 이미지 빌드 및 푸시

### 이미지 빌드
```bash
# 프로젝트 디렉토리에서 실행
./build.sh v1.0.0

# 또는 Windows에서
./build.ps1 -Tag "v1.0.0"
```

### 이미지 태깅 및 푸시
```bash
# 이미지 태깅
docker tag mcp-catalog:v1.0.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:v1.0.0
docker tag mcp-catalog:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:latest

# ECR에 푸시
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:v1.0.0
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:latest
```

## 🔑 3단계: AWS Secrets Manager 설정

### 데이터베이스 자격 증명 저장
```bash
# Supabase URL 저장
aws secretsmanager create-secret \
    --name "mcp-catalog/supabase-url" \
    --description "MCP Catalog Supabase URL" \
    --secret-string "https://your-project.supabase.co"

# Supabase Anon Key 저장
aws secretsmanager create-secret \
    --name "mcp-catalog/supabase-key" \
    --description "MCP Catalog Supabase Anon Key" \
    --secret-string "your-supabase-anon-key"
```

## 👤 4단계: IAM 역할 생성

### ECS Task Execution Role
```bash
# 신뢰 정책 파일 생성
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# IAM 역할 생성
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://trust-policy.json

# 정책 연결
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Secrets Manager 접근 정책 생성
cat > secrets-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:123456789012:secret:mcp-catalog/*"
      ]
    }
  ]
}
EOF

# 정책 생성 및 연결
aws iam create-policy \
    --policy-name MCPCatalogSecretsPolicy \
    --policy-document file://secrets-policy.json

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::123456789012:policy/MCPCatalogSecretsPolicy
```

## 📝 5단계: ECS 클러스터 생성

```bash
# ECS 클러스터 생성
aws ecs create-cluster \
    --cluster-name mcp-catalog-cluster \
    --capacity-providers FARGATE \
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1
```

## 📋 6단계: Task Definition 생성

### task-definition.json 파일 생성
```json
{
  "family": "mcp-catalog",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "mcp-catalog",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "NEXT_TELEMETRY_DISABLED", "value": "1"},
        {"name": "NEXT_PUBLIC_DB_TYPE", "value": "supabase"},
        {"name": "NEXT_PUBLIC_USE_MOCK_DATA", "value": "false"}
      ],
      "secrets": [
        {
          "name": "NEXT_PUBLIC_SUPABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:mcp-catalog/supabase-url"
        },
        {
          "name": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:mcp-catalog/supabase-key"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mcp-catalog",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### CloudWatch 로그 그룹 생성
```bash
aws logs create-log-group \
    --log-group-name /ecs/mcp-catalog \
    --region us-east-1
```

### Task Definition 등록
```bash
aws ecs register-task-definition \
    --cli-input-json file://task-definition.json
```

## 🌐 7단계: Load Balancer 및 Target Group 생성

### Application Load Balancer 생성
```bash
# VPC ID 조회
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text)

# 서브넷 ID 조회
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text)

# 보안 그룹 생성
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
    --group-name mcp-catalog-sg \
    --description "Security group for MCP Catalog" \
    --vpc-id $VPC_ID \
    --query "GroupId" --output text)

# 인바운드 규칙 추가
aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SECURITY_GROUP_ID \
    --protocol tcp \
    --port 3000 \
    --source-group $SECURITY_GROUP_ID

# ALB 생성
ALB_ARN=$(aws elbv2 create-load-balancer \
    --name mcp-catalog-alb \
    --subnets $SUBNET_IDS \
    --security-groups $SECURITY_GROUP_ID \
    --query "LoadBalancers[0].LoadBalancerArn" --output text)

# Target Group 생성
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
    --name mcp-catalog-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id $VPC_ID \
    --target-type ip \
    --health-check-path /api/health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 10 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --query "TargetGroups[0].TargetGroupArn" --output text)

# 리스너 생성
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN
```

## 🚀 8단계: ECS 서비스 생성

### service-definition.json 파일 생성
```json
{
  "serviceName": "mcp-catalog-service",
  "cluster": "mcp-catalog-cluster",
  "taskDefinition": "mcp-catalog",
  "desiredCount": 2,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-abcdef123"],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/mcp-catalog-tg/1234567890123456",
      "containerName": "mcp-catalog",
      "containerPort": 3000
    }
  ],
  "healthCheckGracePeriodSeconds": 300
}
```

### 서비스 생성
```bash
aws ecs create-service \
    --cli-input-json file://service-definition.json
```

## 🔍 9단계: 배포 확인

### 서비스 상태 확인
```bash
# 서비스 상태 확인
aws ecs describe-services \
    --cluster mcp-catalog-cluster \
    --services mcp-catalog-service

# 태스크 상태 확인
aws ecs list-tasks \
    --cluster mcp-catalog-cluster \
    --service-name mcp-catalog-service

# 로그 확인
aws logs tail /ecs/mcp-catalog --follow
```

### Load Balancer DNS 확인
```bash
aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --query "LoadBalancers[0].DNSName" --output text
```

## 🔄 10단계: 업데이트 배포

### 새 이미지 배포
```bash
# 새 이미지 빌드 및 푸시
./build.sh v1.1.0
docker tag mcp-catalog:v1.1.0 123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:v1.1.0
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/mcp-catalog:v1.1.0

# Task Definition 업데이트 (이미지 태그 변경)
# task-definition.json에서 이미지 태그를 v1.1.0으로 변경 후

aws ecs register-task-definition \
    --cli-input-json file://task-definition.json

# 서비스 업데이트
aws ecs update-service \
    --cluster mcp-catalog-cluster \
    --service mcp-catalog-service \
    --task-definition mcp-catalog:2
```

## 📊 모니터링 및 로깅

### CloudWatch 대시보드 생성
```bash
# CloudWatch 대시보드 설정
aws cloudwatch put-dashboard \
    --dashboard-name "MCP-Catalog-Dashboard" \
    --dashboard-body file://dashboard.json
```

### 알람 설정
```bash
# CPU 사용률 알람
aws cloudwatch put-metric-alarm \
    --alarm-name "MCP-Catalog-High-CPU" \
    --alarm-description "High CPU usage for MCP Catalog" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2
```

## 🛡️ 보안 고려사항

1. **네트워크 보안**
   - VPC 내 프라이빗 서브넷 사용 권장
   - 보안 그룹에서 최소 권한 원칙 적용

2. **컨테이너 보안**
   - 정기적인 이미지 스캔 (Trivy, ECR 스캔)
   - 비특권 사용자로 컨테이너 실행

3. **데이터 보안**
   - AWS Secrets Manager로 민감 정보 관리
   - 전송 중 암호화 (HTTPS)

## 💰 비용 최적화

1. **리소스 크기 조정**
   - CPU/메모리 사용량 모니터링 후 적절한 크기 선택
   - Spot 인스턴스 사용 고려

2. **Auto Scaling**
   - CPU/메모리 기반 자동 스케일링 설정
   - 스케줄 기반 스케일링 (예: 야간 축소)

## 🔧 문제 해결

### 일반적인 문제들

1. **태스크가 시작되지 않음**
   ```bash
   # 태스크 이벤트 확인
   aws ecs describe-tasks --cluster mcp-catalog-cluster --tasks <task-id>
   ```

2. **헬스체크 실패**
   ```bash
   # 컨테이너 로그 확인
   aws logs get-log-events --log-group-name /ecs/mcp-catalog --log-stream-name <stream-name>
   ```

3. **연결 문제**
   - 보안 그룹 규칙 확인
   - 네트워크 ACL 확인
   - Target Group 헬스체크 설정 확인

이제 MCP Catalog가 AWS ECS에서 안정적으로 실행됩니다! 🎉 