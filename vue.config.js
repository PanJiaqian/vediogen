const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // 生产环境优化
  productionSourceMap: false,

  // 性能优化配置
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      }
    }
  },

  // 开发服务器配置
  devServer: {
    port: 8080,
    open: false,
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    // 启用gzip压缩
    compress: true
  },

  // CSS优化
  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false
  },

  // 链式操作配置
  chainWebpack: config => {
    // 删除默认的preload和prefetch插件以避免配置冲突
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  }
})
