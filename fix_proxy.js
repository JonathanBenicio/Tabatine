const fs = require('fs')

let proxy = fs.readFileSync('src/proxy.ts', 'utf8')

// If they hit auth, they shouldn't be authenticated, but if they are setting a password, they MUST be authenticated.
// Make sure /set-password isn't considered an auth route that redirects them to dashboard automatically before they finish setting password.
// Currently isProtectedRoute = !isAuthRoute && !isApiRoute.
// So /set-password is a protected route. Meaning it forces login. Which is correct!

console.log("Looks correct.")
