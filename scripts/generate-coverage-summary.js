import fs from 'fs';
import path from 'path';

/**
 * Script para gerar um resumo de cobertura de código (Code Coverage) 
 * no formato Markdown para o GitHub Step Summary.
 */

const COVERAGE_DIR = './coverage';
const OUTPUT_FILE = process.env.GITHUB_STEP_SUMMARY || './coverage-summary.md';

/**
 * Busca um arquivo de forma recursiva
 */
function findFile(dir, fileName) {
    if (!fs.existsSync(dir)) return null;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file === 'node_modules' || file === '.next' || file === '.git') continue;
                const found = findFile(fullPath, fileName);
                if (found) return found;
            } else if (file === fileName) {
                return fullPath;
            }
        }
    } catch (e) {
        // Silently ignore permission errors
    }
    return null;
}

/**
 * Aguarda a existência de um arquivo com retries
 */
async function waitForFile(filePath, fileName, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        const foundPath = findFile(filePath, fileName);
        if (foundPath) return foundPath;
        
        console.log(`Aguardando arquivo ${fileName} em ${filePath}... Tentativa ${i + 1}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
}

async function parseTextSummary() {
    // Primeiro tenta o caminho padrão, depois busca no root e subpastas
    let summaryPath = await waitForFile(COVERAGE_DIR, 'text-summary.txt');
    
    if (!summaryPath) {
        console.log('Buscando text-summary.txt no diretório raiz (ignorando node_modules etc)...');
        summaryPath = findFile('./', 'text-summary.txt');
    }

    if (!summaryPath) {
        console.error('Arquivo text-summary.txt não encontrado após buscas e retries.');
        
        // Log para ajudar no debug no CI
        const searchDirs = [COVERAGE_DIR, './playwright-report', './test-results'];
        searchDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                try {
                    console.log(`Arquivos em ${dir}:`, fs.readdirSync(dir, { recursive: true }));
                } catch (e) {}
            }
        });
        
        return null;
    }

    console.log('Usando arquivo de sumário encontrado em:', summaryPath);
    const content = fs.readFileSync(summaryPath, 'utf8');
    
    // [S5] O text-summary do istanbul/monocart segue este padrão:
    // Lines        : 85.5% ( 123/144 )
    // Functions    : 75% ( 15/20 )
    // Statements   : 84% ( 130/155 )
    // Branches     : 60% ( 12/20 )
    //
    // Regex: captura (1) percentual e (2) ratio (ex: "123/144")
    // \s+ = whitespace flexível entre label e valores

    const lines = content.match(/Lines\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);
    const functions = content.match(/Functions\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);
    const statements = content.match(/Statements\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);
    const branches = content.match(/Branches\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);

    // Safety: loga conteúdo bruto se nenhuma métrica for detectada (debug CI)
    if (!lines && !functions && !statements && !branches) {
        console.warn('⚠️ Nenhuma métrica de cobertura encontrada no text-summary. Conteúdo bruto:');
        console.warn(content.substring(0, 500));
    }

    return {
        lines: lines ? { pct: lines[1], ratio: lines[2] } : null,
        functions: functions ? { pct: functions[1], ratio: functions[2] } : null,
        statements: statements ? { pct: statements[1], ratio: statements[2] } : null,
        branches: branches ? { pct: branches[1], ratio: branches[2] } : null
    };
}

function generateMarkdown(data) {
    if (!data) {
        return '### ⚠️ Erro ao carregar dados de cobertura de código.\n\n> O arquivo `text-summary.txt` não foi encontrado ou não pôde ser processado. Verifique os logs da execução dos testes.';
    }

    const getStatusEmoji = (pct) => {
        const val = parseFloat(pct);
        if (val >= 80) return '🟢';
        if (val >= 50) return '🟡';
        return '🔴';
    };

    let md = '## 📊 Relatório de Cobertura de Código (E2E)\n\n';
    md += '| Métrica | Cobertura | Detalhes |\n';
    md += '| :--- | :---: | :--- |\n';
    
    if (data.lines) md += `| **Lines** | ${getStatusEmoji(data.lines.pct)} **${data.lines.pct}%** | \`${data.lines.ratio}\` |\n`;
    if (data.functions) md += `| **Functions** | ${getStatusEmoji(data.functions.pct)} **${data.functions.pct}%** | \`${data.functions.ratio}\` |\n`;
    if (data.statements) md += `| **Statements** | ${getStatusEmoji(data.statements.pct)} **${data.statements.pct}%** | \`${data.statements.ratio}\` |\n`;
    if (data.branches) md += `| **Branches** | ${getStatusEmoji(data.branches.pct)} **${data.branches.pct}%** | \`${data.branches.ratio}\` |\n`;

    md += '\n\n> Relatório gerado automaticamente pelo **monocart-reporter** durante a execução dos testes Playwright.';
    
    return md;
}

async function main() {
    const summaryData = await parseTextSummary();
    const markdown = generateMarkdown(summaryData);

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log('Sumário de cobertura gerado com sucesso em:', OUTPUT_FILE);
}

main().catch(err => {
    console.error('Erro ao gerar sumário de cobertura:', err);
    process.exit(1);
});
