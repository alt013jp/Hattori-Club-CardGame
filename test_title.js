const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
    // Start local server if not running
    const serverProcess = spawn('node', ['server.js'], { detached: true, stdio: 'ignore' });
    serverProcess.unref();

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 5000 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({ path: 'C:/Users/nanoa/.gemini/antigravity/brain/506ccdb5-670f-4fd9-b0e1-4878d7aeedc4/title_screen_v1.png' });
        console.log('Screenshot saved to title_screen_v1.png');
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
        if (serverProcess.pid) process.kill(-serverProcess.pid); // kill process group
    }
})();
