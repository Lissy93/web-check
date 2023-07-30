const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {
  let browser = null;
  let result = null;
  let code = 200;
  
  try {
    const url = event.queryStringParameters.url;

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();

    const requests = [];
    
    // Capture requests
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
      });
    });

    await page.goto(url, {
      waitUntil: 'networkidle0',  // wait until all requests are finished
    });

    result = requests;
    
  } catch (error) {
    code = 500;
    result = {
      error: 'Failed to create HAR file',
      details: error.toString(),
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return {
    statusCode: code,
    body: JSON.stringify(result),
  };
};
