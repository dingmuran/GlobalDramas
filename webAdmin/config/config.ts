import { join } from 'node:path';
import { defineConfig } from '@umijs/max';
import settings from './defaultSettings';
import routes from './routes';
export default defineConfig({
  title: 'Gload Dramas',
  hash: true,
  history: { type: 'hash' },
  routes,
  model: {},
  initialState: {},
  access: {},
  request: {},
  antd: {
    appConfig: {},
    configProvider: {
      locale: 'zh_CN',
      variant: 'filled',
      theme: {
        cssVar: true,
        token: {
          colorPrimary: '#1677ff',
          motion: false,
          borderRadius: 6,
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        },
      },
    },
  },
  layout: { locale: true, ...settings },
  locale: { default: 'zh-CN', antd: true, baseNavigator: false },
  mock: false,
  define: {
    'process.env.CI': process.env.CI,
    __APP_VERSION__: '6.0.3',
    __UMI_VERSION__: '4.7.3',
    __UTOO_VERSION__: '1',
  },
  tailwindcss: {},
  moment2dayjs: { preset: 'antd', plugins: ['duration', 'relativeTime'] },
  fastRefresh: true,
  utoopack: {
    module: {
      rules: {
        '*.md': {
          loaders: [{ loader: join(__dirname, 'md-raw-loader.cjs') }],
          as: '*.js',
        },
      },
    },
  },
  proxy: {
    '/api': {
      target: process.env.API_TARGET || 'http://localhost:8888',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
