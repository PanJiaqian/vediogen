const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class BuildOptimizer {
  constructor() {
    this.distPath = path.resolve(__dirname, '../dist')
    this.reportPath = path.resolve(__dirname, '../build-report.json')
  }

  // 分析打包文件大小
  analyzeBundleSize() {
    console.log('📊 分析打包文件大小...')
    
    const files = this.getAllFiles(this.distPath)
    const analysis = {
      totalSize: 0,
      jsFiles: [],
      cssFiles: [],
      assets: [],
      chunks: {}
    }

    files.forEach(file => {
      const stats = fs.statSync(file)
      const relativePath = path.relative(this.distPath, file)
      const size = stats.size
      const sizeKB = (size / 1024).toFixed(2)
      
      analysis.totalSize += size

      const fileInfo = {
        path: relativePath,
        size: size,
        sizeKB: sizeKB,
        sizeMB: (size / 1024 / 1024).toFixed(2)
      }

      if (file.endsWith('.js')) {
        analysis.jsFiles.push(fileInfo)
        
        // 分析chunk类型
        if (relativePath.includes('vendor')) {
          analysis.chunks.vendor = fileInfo
        } else if (relativePath.includes('app')) {
          analysis.chunks.app = fileInfo
        } else if (relativePath.includes('chunk')) {
          if (!analysis.chunks.lazy) analysis.chunks.lazy = []
          analysis.chunks.lazy.push(fileInfo)
        }
      } else if (file.endsWith('.css')) {
        analysis.cssFiles.push(fileInfo)
      } else {
        analysis.assets.push(fileInfo)
      }
    })

    // 排序（按大小降序）
    analysis.jsFiles.sort((a, b) => b.size - a.size)
    analysis.cssFiles.sort((a, b) => b.size - a.size)
    analysis.assets.sort((a, b) => b.size - a.size)

    return analysis
  }

  // 获取所有文件
  getAllFiles(dir) {
    let files = []
    
    if (!fs.existsSync(dir)) {
      return files
    }

    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stats = fs.statSync(fullPath)
      
      if (stats.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath))
      } else {
        files.push(fullPath)
      }
    })
    
    return files
  }

  // 生成优化建议
  generateOptimizationSuggestions(analysis) {
    const suggestions = []
    
    // 检查大文件
    analysis.jsFiles.forEach(file => {
      if (file.size > 500 * 1024) { // 大于500KB
        suggestions.push({
          type: 'warning',
          message: `JavaScript文件 ${file.path} 过大 (${file.sizeKB}KB)`,
          suggestion: '考虑代码分割或移除未使用的依赖'
        })
      }
    })

    // 检查vendor chunk
    if (analysis.chunks.vendor && analysis.chunks.vendor.size > 1024 * 1024) { // 大于1MB
      suggestions.push({
        type: 'warning',
        message: `Vendor chunk过大 (${analysis.chunks.vendor.sizeKB}KB)`,
        suggestion: '考虑使用DLL插件或外部化大型依赖'
      })
    }

    // 检查总大小
    const totalSizeMB = analysis.totalSize / 1024 / 1024
    if (totalSizeMB > 10) {
      suggestions.push({
        type: 'error',
        message: `总打包大小过大 (${totalSizeMB.toFixed(2)}MB)`,
        suggestion: '需要进行代码优化和资源压缩'
      })
    }

    return suggestions
  }

  // 生成报告
  generateReport(analysis) {
    const suggestions = this.generateOptimizationSuggestions(analysis)
    const totalSizeMB = (analysis.totalSize / 1024 / 1024).toFixed(2)
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSize: analysis.totalSize,
        totalSizeMB: totalSizeMB,
        jsFilesCount: analysis.jsFiles.length,
        cssFilesCount: analysis.cssFiles.length,
        assetsCount: analysis.assets.length
      },
      files: analysis,
      suggestions: suggestions,
      performance: {
        largestJS: analysis.jsFiles[0] || null,
        largestCSS: analysis.cssFiles[0] || null,
        chunkAnalysis: analysis.chunks
      }
    }

    // 保存报告
    fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2))
    
    return report
  }

  // 打印报告
  printReport(report) {
    console.log('\n🎯 构建分析报告')
    console.log('=' * 50)
    
    console.log(`📦 总大小: ${report.summary.totalSizeMB}MB`)
    console.log(`📄 JS文件: ${report.summary.jsFilesCount}个`)
    console.log(`🎨 CSS文件: ${report.summary.cssFilesCount}个`)
    console.log(`🖼️  资源文件: ${report.summary.assetsCount}个`)
    
    console.log('\n📊 最大文件:')
    if (report.performance.largestJS) {
      console.log(`  JS: ${report.performance.largestJS.path} (${report.performance.largestJS.sizeKB}KB)`)
    }
    if (report.performance.largestCSS) {
      console.log(`  CSS: ${report.performance.largestCSS.path} (${report.performance.largestCSS.sizeKB}KB)`)
    }

    if (report.suggestions.length > 0) {
      console.log('\n⚠️  优化建议:')
      report.suggestions.forEach((suggestion, index) => {
        const icon = suggestion.type === 'error' ? '❌' : '⚠️'
        console.log(`  ${icon} ${suggestion.message}`)
        console.log(`     💡 ${suggestion.suggestion}`)
      })
    } else {
      console.log('\n✅ 构建优化良好，无需改进建议')
    }

    console.log(`\n📋 详细报告已保存到: ${this.reportPath}`)
  }

  // 运行分析
  async run() {
    try {
      console.log('🚀 开始构建优化分析...')
      
      // 检查dist目录是否存在
      if (!fs.existsSync(this.distPath)) {
        console.log('❌ dist目录不存在，请先运行构建命令')
        console.log('💡 运行: npm run build')
        return
      }

      const analysis = this.analyzeBundleSize()
      const report = this.generateReport(analysis)
      this.printReport(report)
      
      console.log('\n✅ 分析完成!')
      
    } catch (error) {
      console.error('❌ 分析过程中出现错误:', error.message)
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const optimizer = new BuildOptimizer()
  optimizer.run()
}

module.exports = BuildOptimizer