const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const svgFiles = [
  { svg: 'exam.svg', png: 'exam.png', activePng: 'exam-active.png' },
  { svg: 'mock.svg', png: 'mock.png', activePng: 'mock-active.png' },
  { svg: 'profile.svg', png: 'profile.png', activePng: 'profile-active.png' }
];

console.log('尝试使用不同方法转换 SVG 到 PNG...\n');

// 方法1: 使用 sharp (推荐)
try {
  console.log('方法1: 使用 sharp 库...');
  const sharp = require('sharp');

  for (const files of svgFiles) {
    const svgPath = path.join(__dirname, files.svg);
    const pngPath = path.join(__dirname, files.png);
    const activePath = path.join(__dirname, files.activePng);

    // 读取 SVG 内容并修改颜色
    let svgContent = fs.readFileSync(svgPath, 'utf8');

    // 生成普通图标（灰色）
    let graySvg = svgContent;
    sharp(Buffer.from(graySvg))
      .resize(81, 81)
      .png()
      .toFile(pngPath)
      .then(() => console.log(`✅ ${files.png}`))
      .catch(err => console.error(`❌ ${files.png}:`, err.message));

    // 生成激活图标（绿色）
    let activeSvg = svgContent.replace(/#999999/g, '#07c160');
    sharp(Buffer.from(activeSvg))
      .resize(81, 81)
      .png()
      .toFile(activePath)
      .then(() => console.log(`✅ ${files.activePng}`))
      .catch(err => console.error(`❌ ${files.activePng}:`, err.message));
  }

  console.log('\n转换完成！');
  process.exit(0);
} catch (e) {
  console.log('⚠️  sharp 库未安装');
}

// 方法2: 使用 convert (ImageMagick)
try {
  console.log('\n方法2: 使用 ImageMagick...');
  for (const files of svgFiles) {
    const svgPath = path.join(__dirname, files.svg);
    const pngPath = path.join(__dirname, files.png);
    const activePath = path.join(__dirname, files.activePng);

    execSync(`convert -background none -resize 81x81 "${svgPath}" "${pngPath}"`);
    console.log(`✅ ${files.png}`);

    // 修改颜色并转换激活图标
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    let activeSvg = svgContent.replace(/#999999/g, '#07c160');
    const activeSvgPath = path.join(__dirname, 'temp-active.svg');
    fs.writeFileSync(activeSvgPath, activeSvg);

    execSync(`convert -background none -resize 81x81 "${activeSvgPath}" "${activePath}"`);
    fs.unlinkSync(activeSvgPath);
    console.log(`✅ ${files.activePng}`);
  }
  console.log('\n转换完成！');
  process.exit(0);
} catch (e) {
  console.log('⚠️  ImageMagick 未安装');
}

// 方法3: 使用在线转换服务提示
console.log('\n' + '='.repeat(50));
console.log('⚠️  本地转换工具不可用');
console.log('\n请使用以下方法之一：');
console.log('\n1. 安装 sharp 库（推荐）：');
console.log('   cd static/tabbar && npm install sharp');
console.log('   node convert-svg-to-png.js');
console.log('\n2. 安装 ImageMagick：');
console.log('   brew install imagemagick');
console.log('   node convert-svg-to-png.js');
console.log('\n3. 使用在线工具手动转换：');
console.log('   https://cloudconvert.com/svg-to-png');
console.log('   https://convertio.co/zh/svg-png/');
console.log('\n然后将转换后的文件放到：');
console.log('   /Users/qiao/Documents/workspaces/资料管理小程序/miniprogram-native/static/tabbar/');
console.log('='.repeat(50));

process.exit(1);
