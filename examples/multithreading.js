// require('dotenv').config();
// Replace this import with `require('..')` if you are running the example from the repository:
const { plugin } = require('puppeteer-with-fingerprints');

const key = process.env.FINGERPRINT_KEY ?? '';

async function main() {
  const fingerprint = await plugin.fetch(key, { tags: ['Microsoft Windows', 'Chrome'] });
  const browser = await plugin.useFingerprint(fingerprint).launch();

  const page = await browser.newPage();
  const getText = (selector) => page.$eval(selector, (el) => el.innerText);
  await page.goto('https://browserleaks.com/javascript', { waitUntil: 'domcontentloaded' });

  const result = {
    screen: {
      width: await getText('#js-innerWidth'),
      height: await getText('#js-innerHeight'),
    },
    userAgent: await getText('#js-userAgent'),
    deviceMemory: await getText('#js-deviceMemory'),
    hardwareConcurrency: await getText('#js-hardwareConcurrency'),
  };

  await browser.close();
  return result;
}

Promise.all([...Array(3).keys()].map(main)).then(console.log);
