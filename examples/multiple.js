require('dotenv').config();
const { plugin } = require('..');

(async () => {
  const key = process.env.FINGERPRINT_KEY ?? '';

  for (let i = 0; i < 2; ++i) {
    const fingerprint = await plugin.fetch(key, { tags: ['Microsoft Windows', 'Chrome'] });
    const browser = await plugin.useFingerprint(fingerprint).launch();

    const page = await browser.newPage();
    await page.goto('https://httpbin.org/headers', { waitUntil: 'domcontentloaded' });

    const { headers } = JSON.parse(await page.$eval('pre', (pre) => pre.innerText));

    console.log(`Browser №${i + 1}:`, {
      headers: {
        userAgent: headers['User-Agent'],
        acceptLanguage: headers['Accept-Language'],
      },
      viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })),
    });

    await browser.close();
  }
})();
