const fs = require('fs');
const path = './src/components/LayoutWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file contents have changes. Let's make sure our replace worked.
if (content.includes('<div className="flex h-screen overflow-hidden">')) {
  console.log('Update 1 applied');
} else {
  content = content.replace(
    '<div className="flex min-h-screen">',
    '<div className="flex h-screen overflow-hidden bg-zinc-950">'
  );
}

if (content.includes('<nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">')) {
  console.log('Update 2 applied');
} else {
  content = content.replace(
    '<nav className="flex-1 py-6 px-4 space-y-2">',
    '<nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">'
  );
}

// Let's modify main content div to make it explicitly flex-1 and overflow-hidden
// and the inner div overflow-y-auto
if (content.includes('<main className="flex-1 flex flex-col min-w-0 overflow-hidden">')) {
    console.log('Update 3 applied');
} else {
  content = content.replace(
    '<main className="flex-1 flex flex-col min-w-0">',
    '<main className="flex-1 flex flex-col min-w-0 overflow-hidden">'
  );
}

fs.writeFileSync(path, content, 'utf8');
