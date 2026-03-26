const fs = require('fs');
const path = './src/components/LayoutWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

// The original file content
content = content.replace(
  '<div className="flex min-h-screen">',
  '<div className="flex h-screen overflow-hidden bg-zinc-950">'
);

content = content.replace(
  '<nav className="flex-1 py-6 px-4 space-y-2">',
  '<nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">'
);

content = content.replace(
  '<main className="flex-1 flex flex-col min-w-0">',
  '<main className="flex-1 flex flex-col min-w-0 overflow-hidden">'
);

content = content.replace(
  '<header className="h-20 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">',
  '<header className="h-20 shrink-0 border-b border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">'
);

fs.writeFileSync(path, content, 'utf8');
