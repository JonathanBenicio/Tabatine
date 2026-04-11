import fs from 'fs';
import path from 'path';

/**
 * Script para gerar um resumo de cobertura de código (Code Coverage) 
 * no formato Markdown para o GitHub Step Summary.
 */

const COVERAGE_DIR = './coverage';
const OUTPUT_FILE = process.env.GITHUB_STEP_SUMMARY || './coverage-summary.md';

function parseTextSummary() {
    const summaryPath = path.join(COVERAGE_DIR, 'text-summary.txt');
    if (!fs.existsSync(summaryPath)) {
        console.error('Arquivo text-summary.txt não encontrado em:', summaryPath);
        return null;
    }

    const content = fs.readFileSync(summaryPath, 'utf8');
    
    // O text-summary do istanbul/monocart segue este padrão:
    // Lines        : 85.5% ( 123/144 )
    // Functions    : 75% ( 15/20 )
    // Statements   : 84% ( 130/155 )
    // Branches     : 60% ( 12/20 )

    const lines = content.match(/Lines\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);
    const functions = content.match(/Functions\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);
    const statements = content.match(/Statements\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);
    const branches = content.match(/Branches\s+:\s+([\d.]+)%\s+\(\s+(\d+\/\d+)\s+\)/);

    return {
        lines: lines ? { pct: lines[1], ratio: lines[2] } : null,
        functions: functions ? { pct: functions[1], ratio: functions[2] } : null,
        statements: statements ? { pct: statements[1], ratio: statements[2] } : null,
        branches: branches ? { pct: branches[1], ratio: branches[2] } : null
    };
}

function generateMarkdown(data) {
    if (!data) return '### ⚠️ Erro ao carregar dados de cobertura de código.';

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

const summaryData = parseTextSummary();
const markdown = generateMarkdown(summaryData);

fs.writeFileSync(OUTPUT_FILE, markdown);
console.log('Sumário de cobertura gerado com sucesso em:', OUTPUT_FILE);
