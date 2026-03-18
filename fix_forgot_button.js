const fs = require('fs');
let file = fs.readFileSync('src/app/auth/forgot-password/page.tsx', 'utf8');

const oldButton = `<button
              type="submit"
              className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Enviar Email de Recuperação
            </button>`;

const newButton = `<SubmitButton
              loadingText="Enviando..."
              className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              Enviar Email de Recuperação
            </SubmitButton>`;

file = file.replace(oldButton, newButton);
fs.writeFileSync('src/app/auth/forgot-password/page.tsx', file);
