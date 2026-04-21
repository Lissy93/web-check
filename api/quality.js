import axios from 'axios';
import middleware from './_common/middleware.js';

const qualityHandler = async (url, event, context) => {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    return { skipped: 'Google API key not configured. Please export GOOGLE_CLOUD_API_KEY' };
  }

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?`
  + `url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY`
  + `&category=BEST_PRACTICES&category=SEO&category=PWA&strategy=mobile`
  + `&key=${apiKey}`;

  return (await axios.get(endpoint)).data;
};

export const handler = middleware(qualityHandler);
export default handler;
