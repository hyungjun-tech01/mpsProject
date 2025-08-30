import type { NextConfig } from "next";
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';


const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
     // 클라이언트 환경에서만 실행
     //console.log('Webpack config:', config); // 디버깅용 로그
     if (!isServer) {
      // pdf.worker.min.mjs 파일을 public 디렉토리로 복사
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
              to: path.resolve(__dirname, 'public/pdf.worker.min.mjs'),
            },
          ],
        })
      );
    }

    
    // Webpack output.environment 설정 추가
    config.output = {
      ...config.output,
      environment: {
        ...config.output?.environment,
        module: true, // ESM 모듈 지원 활성화
      },
    };


     // Webpack experiments 옵션 추가
     config.experiments = {
      ...config.experiments,
      topLevelAwait: true, // ESM 모듈 지원 활성화
    };

    if (isServer) {
      // Ensure externals is an object or array before modifying
      if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
        config.externals = {
          ...config.externals,
          canvas: 'commonjs canvas',
        };
      } else if (Array.isArray(config.externals)) {
        config.externals.push({ canvas: 'commonjs canvas' });
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config.externals = (context: any, request: any, callback: any) => {
          if (request === 'canvas') {
            return callback(null, 'commonjs canvas');
          }
          return originalExternals(context, request, callback);
        };
      } else {
        config.externals = { canvas: 'commonjs canvas' };
      }
    }


    return config;
  },


  // headers 설정 추가
  async headers() {
    return [
      {
        source: '/pdf.worker.min.mjs',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  
};

export default nextConfig;
