import { test as testBase, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export const test = testBase.extend<{
    autoTestFixture: string;
}>({
    // Fixture automática para gerenciar a cobertura de todos os testes
    autoTestFixture: [async ({ page }, use, testInfo) => {
        // [S4] Cobertura V8 é exclusiva do Chromium — checa pelo browserType ao invés do project.name
        // Isso é mais robusto: funciona mesmo se o nome do projeto for renomeado no config
        const browserName = testInfo.project.use?.defaultBrowserType 
            || testInfo.project.name;
        const isChromium = browserName === 'chromium' || testInfo.project.name === 'setup';

        if (isChromium) {
            console.log(`[Coverage] Iniciando coleta V8 para: ${testInfo.title}`);
            await Promise.all([
                page.coverage.startJSCoverage({ resetOnNavigation: false }),
                page.coverage.startCSSCoverage({ resetOnNavigation: false })
            ]);
        }

        await use('autoTestFixture');

        if (isChromium) {
            const [jsCoverage, cssCoverage] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage()
            ]);
            
            const coverageData = [...jsCoverage, ...cssCoverage];
            console.log(`[Coverage] Coleta finalizada: ${testInfo.title}. Registros: ${coverageData.length}`);
            
            // Adiciona dados ao relatório global do monocart
            await addCoverageReport(coverageData, testInfo);
        }
    }, { auto: true }] // 'auto: true' garante que isso rode para cada teste que importar desta fixture
});

export { expect };
