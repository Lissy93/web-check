const MAX_URL_LENGTH = 2048;
const ALLOW_PRIVATE_TARGETS = process.env.API_ALLOW_PRIVATE_TARGETS === 'true';

const createClientError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const isIpv4Address = (hostname) => {
  const octets = hostname.split('.');
  if (octets.length !== 4) {
    return false;
  }
  return octets.every((octet) => {
    if (!/^\d+$/.test(octet)) {
      return false;
    }
    const value = Number(octet);
    return value >= 0 && value <= 255;
  });
};

const isPrivateIpv4 = (hostname) => {
  if (!isIpv4Address(hostname)) {
    return false;
  }
  const [a, b] = hostname.split('.').map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
};

const isPrivateIpv6 = (hostname) => {
  const host = hostname.toLowerCase();
  return (
    host === '::1' ||
    host.startsWith('fc') ||
    host.startsWith('fd') ||
    host.startsWith('fe80:') ||
    host.startsWith('::ffff:127.') ||
    host.startsWith('::ffff:10.') ||
    host.startsWith('::ffff:192.168.') ||
    /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
};

const isUnsafeTargetHost = (hostname) => {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true;
  }
  return isPrivateIpv4(host) || isPrivateIpv6(host);
};

const normalizeUrl = (rawUrl) => {
  if (typeof rawUrl !== 'string') {
    throw createClientError('Invalid URL: URL must be a string');
  }

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) {
    throw createClientError('Invalid URL: URL cannot be empty');
  }

  if (trimmedUrl.length > MAX_URL_LENGTH) {
    throw createClientError(`Invalid URL: URL exceeds ${MAX_URL_LENGTH} characters`);
  }

  if(/[\u0000-\u001F\u007F]/.test(trimmedUrl)) {
    throw createClientError('Invalid URL: URL contains control characters');
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  let parsedUrl;
  try {
    parsedUrl = new URL(withProtocol);
  } catch {
    throw createClientError('Invalid URL: Could not parse target URL');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createClientError('Invalid URL: Only HTTP and HTTPS protocols are supported');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw createClientError('Invalid URL: Credentials in URL are not allowed');
  }

  if (!parsedUrl.hostname) {
    throw createClientError('Invalid URL: Missing hostname');
  }

  if (!ALLOW_PRIVATE_TARGETS && isUnsafeTargetHost(parsedUrl.hostname)) {
    throw createClientError(
      'Target host is not allowed: local and private network addresses are blocked'
    );
  }

  parsedUrl.hash = '';
  return parsedUrl.toString();
};

// If present, set a shorter timeout for API requests
const TIMEOUT = process.env.API_TIMEOUT_LIMIT ? parseInt(process.env.API_TIMEOUT_LIMIT, 10) : 60000;

// If present, set CORS allowed origins for responses
const ALLOWED_ORIGINS = process.env.API_CORS_ORIGIN || '*';

// Disable everything :( Setting this env var will turn off the instance, and show message
const DISABLE_EVERYTHING = !!process.env.VITE_DISABLE_EVERYTHING;

// Set the platform currently being used
let PLATFORM = 'NETLIFY';
if (process.env.PLATFORM) { PLATFORM = process.env.PLATFORM.toUpperCase(); }
else if (process.env.VERCEL) { PLATFORM = 'VERCEL'; }
else if (process.env.WC_SERVER) { PLATFORM = 'NODE'; }

// Define the headers to be returned with each response
const headers = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json;charset=UTF-8',
};

const timeoutErrorMsg = 'You can re-trigger this request, by clicking "Retry"\n'
+ 'If you\'re running your own instance of Web Check, then you can '
+ 'resolve this issue, by increasing the timeout limit in the '
+ '`API_TIMEOUT_LIMIT` environmental variable to a higher value (in milliseconds), '
+ 'or if you\'re hosting on Vercel increase the maxDuration in vercel.json.\n\n'
+ `The public instance currently has a lower timeout of ${TIMEOUT}ms `
+ 'in order to keep running costs affordable, so that Web Check can '
+ 'remain freely available for everyone.';

const disabledErrorMsg = 'Error - WebCheck Temporarily Disabled.\n\n'
+ 'We\'re sorry, but due to the increased cost of running Web Check '
+ 'we\'ve had to temporatily disable the public instand. '
+ 'We\'re activley looking for affordable ways to keep Web Check running, '
+ 'while free to use for everybody.\n'
+ 'In the meantime, since we\'ve made our code free and open source, '
+ 'you can get Web Check running on your own system, by following the instructions in our GitHub repo';

// A middleware function used by all API routes on all platforms
const commonMiddleware = (handler) => {

  // Create a timeout promise, to throw an error if a request takes too long
  const createTimeoutPromise = (timeoutMs) => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed-out after ${timeoutMs} ms`));
      }, timeoutMs);
    });
  };

  // Vercel
  const vercelHandler = async (request, response) => {

    if (DISABLE_EVERYTHING) {
      return response.status(503).json({ error: disabledErrorMsg });
    }

    const queryParams = request.query || {};
    const rawUrl = queryParams.url;

    if (!rawUrl) {
      return response.status(500).json({ error: 'No URL specified' });
    }

    const url = normalizeUrl(rawUrl);

    try {
      // Race the handler against the timeout
      const handlerResponse = await Promise.race([
        handler(url, request),
        createTimeoutPromise(TIMEOUT)
      ]);

      if (handlerResponse.body && handlerResponse.statusCode) {
        response.status(handlerResponse.statusCode).json(handlerResponse.body);
      } else {
        response.status(200).json(
          typeof handlerResponse === 'object' ? handlerResponse : JSON.parse(handlerResponse)
        );
      }
    } catch (error) {
      let errorCode = error.statusCode || 500;
      if (error.message.includes('timed-out') || response.statusCode === 504) {
        errorCode = 408;
        error.message = `${error.message}\n\n${timeoutErrorMsg}`;
      }
      response.status(errorCode).json({ error: error.message });
    }
  };

  // Netlify
  const netlifyHandler = async (event, context, callback) => {
    const queryParams = event.queryStringParameters || event.query || {};
    const rawUrl = queryParams.url;

    if (DISABLE_EVERYTHING) {
      callback(null, {
        statusCode: 503,
        body: JSON.stringify({ error: 'Web-Check is temporarily disabled. Please try again later.' }),
        headers,
      });
      return;
    }

    if (!rawUrl) {
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error: 'No URL specified' }),
        headers,
      });
      return;
    }

    const url = normalizeUrl(rawUrl);

    try {
      // Race the handler against the timeout
      const handlerResponse = await Promise.race([
        handler(url, event, context),
        createTimeoutPromise(TIMEOUT)
      ]);

      if (handlerResponse.body && handlerResponse.statusCode) {
        callback(null, handlerResponse);
      } else {
        callback(null, {
          statusCode: 200,
          body: typeof handlerResponse === 'object' ? JSON.stringify(handlerResponse) : handlerResponse,
          headers,
        });
      }
    } catch (error) {
      let errorCode = error.statusCode || 500;
      if (error.message.includes('timed-out')) {
        errorCode = 408;
        error.message = `${error.message}\n\n${timeoutErrorMsg}`;
      }
      callback(null, {
        statusCode: errorCode,
        body: JSON.stringify({ error: error.message }),
        headers,
      });
    }
  };

  // The format of the handlers varies between platforms
  const nativeMode = (['VERCEL', 'NODE'].includes(PLATFORM));
  return nativeMode ? vercelHandler : netlifyHandler;
};

if (PLATFORM === 'NETLIFY') {
  module.exports = commonMiddleware;
}

export default commonMiddleware;
