const fs = require('fs');
const path = require('path');

// 创建简单的 PNG 图标（使用基础图形数据）
// 这是一个 81x81 的 PNG 文件的最小有效版本

function createSimplePNG(color) {
  // PNG 文件头
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (图像头)
  const width = 81;
  const height = 81;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // 创建图像数据 - 简单的图标形状
  const pixels = [];
  for (let y = 0; y < height; y++) {
    pixels.push(0); // filter type
    for (let x = 0; x < width; x++) {
      // 创建简单的图形
      const centerX = width / 2;
      const centerY = height / 2;

      // 简单的圆形图标
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 30) {
        // 内部 - 使用指定颜色
        pixels.push(color.r, color.g, color.b, 255);
      } else {
        // 外部 - 透明
        pixels.push(0, 0, 0, 0);
      }
    }
  }

  // 压缩图像数据（使用 zlib）
  const zlib = require('zlib');
  const imageData = Buffer.from(pixels);
  const compressed = zlib.deflateSync(imageData);

  // IDAT chunk (图像数据)
  const idat = compressed;

  // IEND chunk (文件尾)
  const iend = Buffer.alloc(0);

  // 构建 PNG 文件
  const chunks = [];

  // IHDR
  const ihdrChunk = createChunk('IHDR', ihdr);
  chunks.push(ihdrChunk);

  // IDAT
  const idatChunk = createChunk('IDAT', idat);
  chunks.push(idatChunk);

  // IEND
  const iendChunk = createChunk('IEND', iend);
  chunks.push(iendChunk);

  return Buffer.concat([signature, ...chunks]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuffer, data]));

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCRC(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// 定义颜色
const grayColor = { r: 122, g: 126, b: 131 };  // 未选中状态
const greenColor = { r: 7, g: 193, b: 96 };    // 选中状态

const outputPath = __dirname;

// 创建图标文件
console.log('正在创建图标文件...');

// 试卷图标 (文档形状)
try {
  fs.writeFileSync(path.join(outputPath, 'exam.png'), createSimplePNG(grayColor));
  fs.writeFileSync(path.join(outputPath, 'exam-active.png'), createSimplePNG(greenColor));
  console.log('✅ exam.png');
  console.log('✅ exam-active.png');
} catch (e) {
  console.error('❌ 创建试卷图标失败:', e.message);
}

// 模考图标 (书签形状)
try {
  fs.writeFileSync(path.join(outputPath, 'mock.png'), createSimplePNG(grayColor));
  fs.writeFileSync(path.join(outputPath, 'mock-active.png'), createSimplePNG(greenColor));
  console.log('✅ mock.png');
  console.log('✅ mock-active.png');
} catch (e) {
  console.error('❌ 创建模考图标失败:', e.message);
}

// 我的图标 (用户形状)
try {
  fs.writeFileSync(path.join(outputPath, 'profile.png'), createSimplePNG(grayColor));
  fs.writeFileSync(path.join(outputPath, 'profile-active.png'), createSimplePNG(greenColor));
  console.log('✅ profile.png');
  console.log('✅ profile-active.png');
} catch (e) {
  console.error('❌ 创建我的图标失败:', e.message);
}

console.log('');
console.log('图标创建完成！');
