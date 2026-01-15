import axios from 'axios';
import middleware from './_common/middleware.js';

const MOZILLA_TLS_OBSERVATORY_API =
  process.env. TLS_OBSERVATORY_API ||
  'https://tls-observatory.services. mozilla.com/api/v1';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tlsHandler = async (url) => {
  try {
    const domain = new URL(url).hostname;

    const scanResponse = await axios.post(
      `${MOZILLA_TLS_OBSERVATORY_API}/scan? target=${domain}&rescan=true`
    );

    const scanId = scanResponse.data.scan_id;
    if (scanId === undefined || scanId === null) {
      return { statusCode: 500, body: { error: 'Failed to get scan_id' } };
    }

    const MAX_RETRIES = 20;
    const POLLING_INTERVAL = 2000;

    let attempts = 0;
    let resultResponse;

    while (attempts < MAX_RETRIES) {
      attempts++;

      resultResponse = await axios. get(
        `${MOZILLA_TLS_OBSERVATORY_API}/results?id=${scanId}`
      );

      const data = resultResponse. data;

      const completed =
        data.completion_perc === 100 ||
        data.state === 'FINISHED' ||
        data.state === 'READY' ||
        data.analysis?. state === 'COMPLETED';

      if (completed) {
        return { statusCode: 200, body: data };
      }

      await sleep(POLLING_INTERVAL);
    }

    return {
      statusCode: 408,
      body: {
        error: 'TLS scan timed out awaiting results',
        partial_data: resultResponse?.data,
      },
    };
  } catch (error) {
    console.error('TLS Observatory Error:', error.response?.data || error.message);
    return { statusCode: 500, body: { error: error.message } };
  }
};

export const handler = middleware(tlsHandler);
export default handler;