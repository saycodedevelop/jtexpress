'use strict'

const puppeteer = require('puppeteer')
// const Redis = use('Redis')
class Bot {
  static async start() {
    const browserFetcher = await puppeteer.createBrowserFetcher()
    const revisionInfo = await browserFetcher.download('818858')
    const browser = await puppeteer.launch({
      executablePath: revisionInfo.executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()

    // if (request.header('ufa-key')) {
    //   let cookies = await Redis.hget(request.header('ufa-key'), 'cookies')
    //   cookies = JSON.parse(cookies)
    //   await page.setCookie(...cookies)
    // }

    return { browser, page }
  }
}

module.exports = Bot
