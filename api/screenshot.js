import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';
import middleware from './_common/middleware.js';

const screenshotHandler = async (targetUrl) => {

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
      const width = process.env.BROWSER_WIDTH ? parseInt(process.env.BROWSER_WIDTH, 10) : 800;
      const height = process.env.BROWSER_HEIGHT ? parseInt(process.env.BROWSER_HEIGHT, 10) : 600;

      browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox'], // Add --no-sandbox flag
      defaultViewport: { width, height },
      executablePath: process.env.CHROME_PATH || await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    let page = await browser.newPage();

    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    const browserTimeout = process.env.BROWSER_TIMEOUT ? parseInt(process.env.BROWSER_TIMEOUT, 10) : 8000;
    page.setDefaultNavigationTimeout(browserTimeout);
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

export const handler = middleware(screenshotHandler);
export default handler;
