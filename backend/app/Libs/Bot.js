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

    // if (request.header('app-key')) {
    //   let cookies = await Redis.hget(request.header('app-key'), 'cookies')
    //   cookies = JSON.parse(cookies)
    //   await page.setCookie(...cookies)
    // }

    return { browser, page }
  }
}

module.exports = Bot
