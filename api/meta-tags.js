const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event) => {
  let url;
  try {
    // Add https:// prefix if not present
    url = new URL(event.queryStringParameters.url);
    if (!url.protocol) {
      url = new URL('https://' + event.queryStringParameters.url);
    }
  } catch (error) {
    // Return error if URL is not valid
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Invalid URL provided.',
      }),
    };
  }
  
  try {
    // Fetch the page
    const response = await axios.get(url.toString());
  
    // Parse the page body with cheerio
    const $ = cheerio.load(response.data);
  
    // Extract meta tags
    const metaTags = {};
  
    $('head meta').each((index, element) => {
      const name = $(element).attr('name');
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      
      if (name) {
        metaTags[name] = content;
      } else if (property) {
        metaTags[property] = content;
      }
    });
  
    // Return meta tags
    return {
      statusCode: 200,
      body: JSON.stringify(metaTags),
    };
  } catch (error) {
    // Return error if there's a problem fetching or parsing the page
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};
