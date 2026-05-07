const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = process.cwd();
const BASE = path.join(ROOT, 'public', 'gamification');
const TARGET_DIRS = ['effects', 'rewards', 'cards', 'badges'];
const QUALITY = 86;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && full.toLowerCase().endsWith('.png')) acc.push(full);
  }
  return acc;
}

async function main() {
  let before = 0;
  let after = 0;
  const converted = [];

  for (const rel of TARGET_DIRS) {
    const dir = path.join(BASE, rel);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir);
    for (const pngPath of files) {
      const webpPath = pngPath.replace(/\.png$/i, '.webp');
      const inStat = fs.statSync(pngPath);
      before += inStat.size;

      await sharp(pngPath)
        .webp({ quality: QUALITY, effort: 6, alphaQuality: 100 })
        .toFile(webpPath);

      const outStat = fs.statSync(webpPath);
      after += outStat.size;
      converted.push({
        from: path.relative(ROOT, pngPath),
        to: path.relative(ROOT, webpPath),
        before: inStat.size,
        after: outStat.size,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    quality: QUALITY,
    convertedCount: converted.length,
    beforeBytes: before,
    afterBytes: after,
    savedBytes: before - after,
    savedPercent: before > 0 ? Number((((before - after) / before) * 100).toFixed(2)) : 0,
    converted,
  };

  const reportPath = path.join(ROOT, 'scripts', 'optimize-gamification-assets.report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    convertedCount: report.convertedCount,
    beforeBytes: report.beforeBytes,
    afterBytes: report.afterBytes,
    savedBytes: report.savedBytes,
    savedPercent: report.savedPercent,
    reportPath: path.relative(ROOT, reportPath),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
