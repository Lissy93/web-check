import dns from 'dns';
import dnsPromises from 'dns/promises';
import http from 'http';
import https from 'https';
import net from 'net';

const DEFAULT_METADATA_HOSTS = [
  'metadata',
  'metadata.google.internal',
  'metadata.google.internal.',
  'metadata.azure.internal',
  'metadata.azure.internal.',
  'metadata.aws.internal',
  'instance-data.ec2.internal',
  'instance-data',
  'metadata.tencentyun.com',
  'metadata.tencentcloud.com',
  'metadata.oraclecloud.com',
  'metadata.oci.oraclecloud.com',
  'metadata.myhuaweicloud.com',
  'metadata.huaweicloud.com',
  'metadata.aliyun.internal',
  'metadata.digitalocean.com',
  'metadata.linode.com',
  'metadata.vultr.com',
  'metadata.ibmcloud.com',
  'metadata.openstack.org',
  'metadata.packet.net',
];

const DEFAULT_METADATA_IPS = [
  '169.254.169.254', // AWS/GCP/Azure/OCI/OpenStack/DigitalOcean
  '169.254.169.253', // GCP (legacy)
  '169.254.169.250', // Oracle (legacy)
  '100.100.100.200', // Alibaba Cloud
  '100.100.100.201', // Alibaba Cloud (secondary)
  'fd00:ec2::254', // AWS IPv6 IMDS
];

const parseEnvList = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const METADATA_HOSTS = new Set([
  ...DEFAULT_METADATA_HOSTS,
  ...parseEnvList(process.env.SSRF_METADATA_HOSTS),
].map((host) => host.toLowerCase()));

const METADATA_IPS = new Set([
  ...DEFAULT_METADATA_IPS,
  ...parseEnvList(process.env.SSRF_METADATA_IPS),
]);

const IPV4_BLOCK_RANGES = [
  [0x00000000, 0x00ffffff], // 0.0.0.0/8
  [0x0a000000, 0x0affffff], // 10.0.0.0/8
  [0x64400000, 0x647fffff], // 100.64.0.0/10
  [0x7f000000, 0x7fffffff], // 127.0.0.0/8
  [0xa9fe0000, 0xa9feffff], // 169.254.0.0/16
  [0xac100000, 0xac1fffff], // 172.16.0.0/12
  [0xc0a80000, 0xc0a8ffff], // 192.168.0.0/16
  [0xc0000000, 0xc00000ff], // 192.0.0.0/24
  [0xc0000200, 0xc00002ff], // 192.0.2.0/24
  [0xc6120000, 0xc613ffff], // 198.18.0.0/15
  [0xc6336400, 0xc63364ff], // 198.51.100.0/24
  [0xcb007100, 0xcb0071ff], // 203.0.113.0/24
  [0xe0000000, 0xefffffff], // 224.0.0.0/4
  [0xf0000000, 0xffffffff], // 240.0.0.0/4
];

const ipv4ToInt = (ip) => {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
};

const isPrivateIpv4 = (ip) => {
  const value = ipv4ToInt(ip);
  if (value === null) return true;
  return IPV4_BLOCK_RANGES.some(([start, end]) => value >= start && value <= end);
};

const isPrivateIpv6 = (ip) => {
  const normalized = ip.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe80::')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // Unique local
  if (normalized.startsWith('ff')) return true; // Multicast
  if (normalized.startsWith('2001:db8:')) return true; // Documentation
  if (normalized.startsWith('2001:10:')) return true; // ORCHID (deprecated)

  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.replace('::ffff:', '');
    return net.isIPv4(mapped) ? isPrivateIpv4(mapped) : true;
  }

  return false;
};

const isPrivateIp = (ip) => {
  if (METADATA_IPS.has(ip)) {
    return true;
  }

  if (net.isIPv4(ip)) {
    return isPrivateIpv4(ip);
  }
  if (net.isIPv6(ip)) {
    return isPrivateIpv6(ip);
  }

  return true;
};

const isDisallowedHostname = (hostname) => {
  const lower = hostname.toLowerCase();
  if (METADATA_HOSTS.has(lower)) return true;
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true;
  if (lower.endsWith('.local') || lower.endsWith('.localdomain')) return true;
  if (lower.endsWith('.internal')) return true;
  return false;
};

const resolveAndCheck = async (hostname) => {
  const records = await dnsPromises.lookup(hostname, { all: true });
  if (!records.length) {
    throw new Error('Host resolves to no addresses');
  }

  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new Error('Host resolves to a private or metadata address');
    }
  }
};

const originalLookup = dns.lookup.bind(dns);

export const safeLookup = (hostname, options, callback) => {
  const opts = typeof options === 'function' ? {} : options || {};
  const cb = typeof options === 'function' ? options : callback;

  originalLookup(hostname, { ...opts, all: true }, (error, addresses) => {
    if (error) {
      cb(error);
      return;
    }

    if (!addresses || addresses.length === 0) {
      cb(new Error('Host resolves to no addresses'));
      return;
    }

    for (const record of addresses) {
      if (isPrivateIp(record.address)) {
        cb(new Error('Host resolves to a private or metadata address'));
        return;
      }
    }

    if (opts.all) {
      cb(null, addresses);
      return;
    }

    cb(null, addresses[0].address, addresses[0].family);
  });
};

const extractHostname = (input, options) => {
  if (input instanceof URL) {
    return input.hostname;
  }

  if (typeof input === 'string') {
    try {
      return new URL(input).hostname;
    } catch (_) {
      return null;
    }
  }

  const fromOptions = options || input || {};
  let host = fromOptions.hostname || fromOptions.host || null;
  if (!host) return null;

  if (host.startsWith('[') && host.includes(']')) {
    host = host.slice(1, host.indexOf(']'));
  } else if (host.includes(':')) {
    host = host.split(':')[0];
  }

  return host;
};

const assertSafeHostSync = (hostname) => {
  if (!hostname) return;
  if (isDisallowedHostname(hostname)) {
    throw new Error('URL hostname is blocked');
  }
  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error('URL resolves to a private or metadata address');
  }
};

let guardsInstalled = false;
const originalFns = {
  lookup: dns.lookup.bind(dns),
  httpRequest: http.request.bind(http),
  httpsRequest: https.request.bind(https),
  httpGet: http.get.bind(http),
  httpsGet: https.get.bind(https),
};

export const installSsrfGuards = () => {
  if (guardsInstalled) return;
  guardsInstalled = true;

  dns.lookup = safeLookup;

  const wrapRequest = (original) => (...args) => {
    const hostname = extractHostname(args[0], args[1]);
    assertSafeHostSync(hostname);
    return original(...args);
  };

  http.request = wrapRequest(originalFns.httpRequest);
  https.request = wrapRequest(originalFns.httpsRequest);
  http.get = wrapRequest(originalFns.httpGet);
  https.get = wrapRequest(originalFns.httpsGet);
};

export const assertSafeUrl = async (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (error) {
    throw new Error('URL provided is invalid');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('URL scheme not allowed');
  }

  if (parsed.username || parsed.password) {
    throw new Error('URL credentials are not allowed');
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    throw new Error('URL hostname is missing');
  }

  if (isDisallowedHostname(hostname)) {
    throw new Error('URL hostname is blocked');
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error('URL resolves to a private or metadata address');
    }
    return parsed.toString();
  }

  await resolveAndCheck(hostname);

  return parsed.toString();
};
