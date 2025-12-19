// WooCommerce REST API client helper
// Handles ESM/CJS interop for Next.js Turbopack

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createWCClient(url: string, consumerKey: string, consumerSecret: string): Promise<any> {
  const module = await import('@woocommerce/woocommerce-rest-api');
  // Handle both ESM and CJS module formats
  const WooCommerceRestApi = module.default || module;
  // The default export may itself have a .default property in some bundler configurations
  const ApiClass = (WooCommerceRestApi as { default?: unknown }).default || WooCommerceRestApi;
  return new (ApiClass as new (options: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version: string;
    queryStringAuth: boolean;
  }) => unknown)({
    url,
    consumerKey,
    consumerSecret,
    version: 'wc/v3',
    queryStringAuth: true,
  });
}

export function normalizeUrl(url: string): string {
  let wcUrl = url.trim();
  if (!wcUrl.startsWith('http://') && !wcUrl.startsWith('https://')) {
    wcUrl = `https://${wcUrl}`;
  }
  return wcUrl.replace(/\/+$/, '');
}
