import type { NextConfig } from "next";
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';


const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
              to: path.resolve(__dirname, 'public/pdf.worker.min.js')
            }
          ]
        })
      );
    }
    return config;
  },
};


export default nextConfig;
