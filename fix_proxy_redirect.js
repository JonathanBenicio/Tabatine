const fs = require('fs');
let file = fs.readFileSync('src/proxy.ts', 'utf8');

const oldRedirect = `    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }`;

const newRedirect = `    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }`;

file = file.replace(oldRedirect, newRedirect);
fs.writeFileSync('src/proxy.ts', file);
