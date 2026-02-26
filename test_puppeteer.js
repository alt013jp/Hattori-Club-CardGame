const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Catch console errors and logs
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        await page.goto('http://localhost:8080');
        console.log('Page loaded. Waiting for auto-start to trigger...');

        // Fallback click just in case
        await page.evaluate(() => {
            if (typeof startTestGame === 'function') startTestGame();
        });

        await new Promise(r => setTimeout(r, 2000));

        console.log('Taking screenshot...');
        await page.screenshot({ path: 'test_puppeteer.png' });

        console.log('Done.');
    } catch (error) {
        console.error('SCRIPT ERROR:', error);
    } finally {
        if (browser) await browser.close();
        process.exit(0);
    }
})();
