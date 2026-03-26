// We can't easily test visual scrolling in a node environment, but we can verify the CSS classes
import fs from 'fs';
const content = fs.readFileSync('src/components/LayoutWrapper.tsx', 'utf8');

let passed = true;
if (!content.includes('h-screen overflow-hidden')) {
  console.error("Missing main container scroll locks: flex h-screen overflow-hidden bg-zinc-950");
  passed = false;
}
if (!content.includes('nav className="flex-1 overflow-y-auto')) {
  console.error("Missing nav scroll: nav className=\"flex-1 overflow-y-auto");
  passed = false;
}
if (!content.includes('main className="flex-1 flex flex-col min-w-0 overflow-hidden"')) {
  console.error("Missing main block clip: main className=\"flex-1 flex flex-col min-w-0 overflow-hidden\"");
  passed = false;
}
if (!content.includes('header className="h-20 shrink-0 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30"')) {
  console.error("Missing header clip adjustments: shrink-0 on header");
  passed = false;
}
if (!content.includes('className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8"')) {
  console.error("Missing content wrapper scroll");
  passed = false;
}

if (passed) {
  console.log("All necessary layout updates applied!");
} else {
  process.exit(1);
}
