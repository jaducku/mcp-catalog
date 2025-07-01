import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 배포를 위한 standalone 출력 설정
  output: 'standalone',
  
  // ESLint 설정 - 오류를 경고로 변경
  eslint: {
    // 빌드 시 ESLint 오류가 있어도 빌드를 계속 진행
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 설정
  typescript: {
    // 빌드 시 TypeScript 오류가 있어도 빌드를 계속 진행
    ignoreBuildErrors: false,
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_DB_TYPE: process.env.NEXT_PUBLIC_DB_TYPE,
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
