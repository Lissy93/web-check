const puppeteer = require('puppeteer-core');
const middleware = require('./_common/middleware');

const handler = async (targetUrl) => {

  if (!targetUrl) {
    throw new Error('URL is missing from queryStringParameters');
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'http://' + targetUrl;
  }

  try {
    new URL(targetUrl);
  } catch (error) {
    throw new Error('URL provided is invalid');
  }

  let browser = null;
  try {
      browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: '/usr/bin/chromium-browser', 
      headless: true, 
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    page.setDefaultNavigationTimeout(8000); 
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      const selector = 'body';
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (!element) {
          reject(new Error(`Error: No element found with selector: ${selector}`));
        }
        resolve();
      });
    });

    const screenshotBuffer = await page.screenshot();
    const base64Screenshot = screenshotBuffer.toString('base64');

    return { image: base64Screenshot };

  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

module.exports = middleware(handler);
module.exports.handler = middleware(handler);
