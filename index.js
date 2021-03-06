/*
NOTE: Do no log anything apart from access_token
*/

const puppeteer = require('puppeteer')

async function main() {
  const url = process.argv[2] || process.env['NHSD_LOGIN_URL']
  if (!url) {
    console.error("Login URL is required. Pass it to entrypoint or as NHSD_LOGIN_URL environment variable.")
  } else {
    return await nhsdLogin(url)
  }
}

let browser

async function nhsdLogin(url) {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    args: ['--no-sandbox', '--headless', '--disable-gpu']
  });

  const navigator = gotoLogin(browser, url)
  const page = await navigator().catch(navigator).catch(navigator) // retries three times

  await page.waitForSelector('body > div > div > pre', {timeout: 30000});
  const credHtmlText = await page.$eval('body > div > div > pre', e => e.innerText)
  const credentialsJsonText = credHtmlText.replace(/'/g, '"')
  const credentials= JSON.parse(credentialsJsonText)

  return credentials['access_token']
}

function gotoLogin(browser, url) {
  return (async () => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2'});
    await page.waitForSelector('#start');
    await page.click("#start");
    await page.waitForSelector('button[class="btn btn-lg btn-primary btn-block"]', {timeout: 30000});
    await page.click('button[class="btn btn-lg btn-primary btn-block"]');

    return page;
  })
}

main()
  .then(accessToken => console.log(accessToken))
  .catch(e => console.error("unhandled exception occurred: ", e))
  .finally(() => browser.close())

