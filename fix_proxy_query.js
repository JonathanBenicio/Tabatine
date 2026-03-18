const fs = require('fs');
let file = fs.readFileSync('src/proxy.ts', 'utf8');

const oldProxy = `    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }`;

const newProxy = `    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      // Clear specific auth messages so they don't linger on the dashboard URL
      url.searchParams.delete('msg')
      url.searchParams.delete('error')
      url.searchParams.delete('next')
      return NextResponse.redirect(url)
    }`;

file = file.replace(oldProxy, newProxy);
fs.writeFileSync('src/proxy.ts', file);
