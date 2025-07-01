# AWS ECS 배포용 최적화된 Dockerfile
FROM node:18-alpine AS base

# 보안 업데이트 및 필수 패키지 설치
RUN apk update && apk upgrade && \
    apk add --no-cache \
    libc6-compat \
    curl \
    dumb-init && \
    rm -rf /var/cache/apk/*

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --frozen-lockfile && \
    npm cache clean --force

# 빌드 단계
FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드 복사
COPY . .

# 빌드 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Next.js 빌드
RUN npm run build

# 운영 이미지
FROM base AS runner
WORKDIR /app

# 운영 환경 변수 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 보안을 위한 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 필요한 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/.next && \
    chown -R nextjs:nodejs /app

# 빌드된 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 헬스체크 스크립트 생성
RUN echo '#!/bin/sh\ncurl -f http://localhost:3000/api/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh && \
    chown nextjs:nodejs /app/healthcheck.sh

# 비특권 사용자로 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 헬스체크 설정 (AWS ECS에서 사용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /app/healthcheck.sh

# 시그널 처리를 위한 dumb-init 사용
ENTRYPOINT ["dumb-init", "--"]

# 애플리케이션 시작
CMD ["node", "server.js"] 