// require('dotenv').config();
// Replace this import with `require('..')` if you are running the example from the repository:
const { plugin } = require('puppeteer-with-fingerprints');

(async () => {
  const browser = await plugin.launch({
    args: [`--user-data-dir=${__dirname}/profile`],
  });

  const page = await browser.newPage();
  await page.goto('chrome://version');

  const el = await page.waitForSelector('#profile_path');
  console.log('Current profile:', await el.evaluate((el) => el.textContent));

  await browser.close();
})();
