import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "monaco-editor/esm/vs/editor/editor.api.js": "monaco-editor",
      "monaco-editor/esm/vs/editor/editor.api": "monaco-editor",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "monaco-editor/esm/vs/editor/editor.api.js": "monaco-editor",
      "monaco-editor/esm/vs/editor/editor.api": "monaco-editor",
    };
    return config;
  },
};

export default nextConfig;
