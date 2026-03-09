const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Patch 1: Bypass the $N() catch error log
const oldCatch = '.catch(u=>{knt(`Failed to initialize the command state: ${u}`)});';
const newCatch = '.catch(u=>{knt(`Failed to initialize the command state (bypassed): ${u}`)});';

if (content.includes(oldCatch)) {
  content = content.replace(oldCatch, newCatch);
  console.log('Patch 1 applied (catch block updated).');
} else {
  console.warn('Patch 1 target not found.');
}

// Patch 2: Make $N() always return a default state
const oldN = 'async function $N(){';
const newN = 'async function $N(){ return { firstCommandTimestamp: new Date().toISOString() };';

if (content.includes(oldN)) {
  content = content.replace(oldN, newN);
  console.log('Patch 2 applied ($N function shimmed).');
} else {
  console.warn('Patch 2 target not found.');
}

fs.writeFileSync(filePath, content);
console.log('Prisma CLI patched successfully.');
