const fs = require('fs');
let file = fs.readFileSync('src/app/reset-password/page.tsx', 'utf8');

// Insert import
if(!file.includes("SubmitButton")) {
  file = file.replace("import { updatePassword } from './actions'", "import { updatePassword } from './actions'\nimport { SubmitButton } from '@/components/SubmitButton'");
}

const oldButton = `<button
            type="submit"
            className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Salvar e Entrar
          </button>`;

const newButton = `<SubmitButton
            loadingText="Salvando..."
            className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Salvar e Entrar
          </SubmitButton>`;

file = file.replace(oldButton, newButton);
fs.writeFileSync('src/app/reset-password/page.tsx', file);
