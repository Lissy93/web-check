const puppeteer = require('puppeteer-core');
// Suppression de la ligne `const chromium = require('chrome-aws-lambda');` car nous configurons manuellement

// Supposons que `middleware` est une fonction que vous avez définie ou importée depuis un autre fichier
// Si `_common/middleware` n'est pas adapté à votre usage, assurez-vous que la fonction middleware est correctement implémentée
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
      // Configuration spécifique pour Chromium sur Alpine Linux
      browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Adapté pour Alpine
      defaultViewport: { width: 800, height: 600 },
      executablePath: '/usr/bin/chromium-browser', // Chemin d'exécution de Chromium sur Alpine
      headless: true, // ou false si vous avez besoin du mode non headless
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    page.setDefaultNavigationTimeout(8000); // Ajustez selon le besoin
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
