const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {
    const urlParam = event.queryStringParameters.url;
    if (!urlParam) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing url parameter' }) 
      };
    }
  
    let url;
    try {
      url = new URL(urlParam.includes('://') ? urlParam : 'https://' + urlParam);
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid URL format' }),
      };
    }

    // Launch the browser and open a new page
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 800, height: 600 },
      executablePath: process.env.CHROME_PATH || await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();

    // To store network activity
    let networkActivity = [];

    // Register an event listener for network requests
    page.on('request', (request) => {
        networkActivity.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
        });
    });

    // Navigate to the page and wait for it to load
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Close the browser
    await browser.close();

    // Return network activity
    return {
        statusCode: 200,
        body: JSON.stringify(networkActivity),
    };
};
