const axios = require('axios');
const middleware = require('./_common/middleware');

const handler = async (url) => {
  try {
    // First, get the size of the website's HTML
    const { data: html } = await axios.get(url);
    const sizeInBytes = Buffer.byteLength(html, 'utf8');
    const apiUrl = `https://api.websitecarbon.com/data?bytes=${sizeInBytes}&green=0`;

    // Then use that size to get the carbon data
    const { data: carbonData } = await axios.get(apiUrl);

    if (!carbonData.statistics || (carbonData.statistics.adjustedBytes === 0 && carbonData.statistics.energy === 0)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: 'Not enough info to get carbon data' }),
      };
    }

    carbonData.scanUrl = url;
    return carbonData;
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
};

module.exports = middleware(handler);
module.exports.handler = middleware(handler);
