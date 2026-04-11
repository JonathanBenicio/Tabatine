import { test as testBase, expect } from '@playwright/test';
import { addCoverageReport } from 'monocart-reporter';

export const test = testBase.extend<{
    autoTestFixture: string;
}>({
    // Fixture automática para gerenciar a cobertura de todos os testes
    autoTestFixture: [async ({ page }, use, testInfo) => {
        // Cobertura V8 é exclusiva do Chromium
        const isChromium = testInfo.project.name === 'chromium' || testInfo.project.name === 'Desktop Chromium' || testInfo.project.name === 'setup';

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
