require('dotenv').config();
const { plugin } = require('..');

async function main(index) {
  const browser = await plugin.launch();

  const page = await browser.newPage();
  await page.goto(`https://jsonplaceholder.typicode.com/todos/${index + 1}`, { waitUntil: 'domcontentloaded' });

  const todo = JSON.parse(await page.$eval('pre', (pre) => pre.innerText));

  await browser.close();
  return todo;
}

Promise.all([...Array(3).keys()].map(main)).then((todos) => {
  console.log({ todos });
});
