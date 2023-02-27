require('dotenv').config();
const { plugin } = require('..');

// The default proxy value is just an example, it won't work.
const proxy = process.env.FINGERPRINT_PROXY ?? 'socks5://127.0.0.1:9762';

(async () => {
  plugin.useProxy(proxy, {
    detectExternalIP: false,
    changeGeolocation: true,
  });

  const browser = await plugin.launch({
    // This argument will be ignored if the `useProxy` method has been called.
    args: [`--proxy-server=${proxy}`],
  });

  const page = await browser.newPage();
  await page.goto('https://canhazip.com/', { waitUntil: 'domcontentloaded' });

  const result = await page.evaluate(() => document.body.innerText.trim());
  console.log('External IP:', result);

  await browser.close();
})();
