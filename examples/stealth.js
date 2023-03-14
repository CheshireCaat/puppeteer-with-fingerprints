require('dotenv').config();
const { plugin } = require('..');

const key = process.env.FINGERPRINT_KEY ?? '';

(async () => {
  const fingerprint = await plugin.fetch(key, { tags: ['Microsoft Windows', 'Chrome'] });
  const browser = await plugin.useFingerprint(fingerprint).launch({ headless: false });

  const page = await browser.newPage();

  await page.goto('https://bot.sannysoft.com/');
  await new Promise((fn) => setTimeout(fn, 5000));

  await page.screenshot({ path: `${__dirname}/stealth.png`, fullPage: true });
  await browser.close();
})();
