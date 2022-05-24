'use strict'
const Env = use('Env')
const { validate } = use('Validator')
const Redis = use('Redis')
const Bot = use('App/Libs/Bot')
const Status = use('App/Libs/Status')

const WEBSITE_URL = Env.get('THIRDPIRTY_URL')
class ReportController {
  async getTransactionGame({ request, response }) {
    const rules = {
      username: 'required',
      game: 'required',
      dateFrom: 'required|dateFormat:MM/DD/YYYY',
      dateTo: 'required|dateFormat:MM/DD/YYYY',
    }

    let pageIndex = request.post().page

    if (!pageIndex) {
      pageIndex = 1
    }
    const validation = await validate(request.all(), rules)
    if (validation.fails()) {
      return response.json({
        success: false,
        message: 'plases check input data',
      })
    }

    const { username, game, dateFrom, dateTo } = request.all()
    const checkAllStatus = game.length == 18 ? 'True' : 'False'
    let gameCatagory = ''
    for (let i = 0; i < game.length; i++) {
      const element = game[i]
      if (i == game.length - 1) {
        gameCatagory += `${element}`
        break
      }
      gameCatagory += `${element},`
    }

    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )

    const SELECTOR = {
      table: '#SubAccsWLTransGame_cm1_grdTrans > tbody > tr.GridItem',
      totalPage: '#SubAccsWLTransGame_cm1_lblPageIndex',
    }

    // check status account and set url
    const isSubAccount = await Status.isSubAccount(request)
    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'
    const urlRole = isSubAgent ? 'sa' : 'ag'

    const bot = await Bot.start(request)
    if (isSubAccount) {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}_Sub/SubAccsWLTransGame.aspx?role=${urlRole}&userName=${username}&pageIndex=${pageIndex}&to=${dateTo}&from=${dateFrom}&userName2=${usernameUfabet}&cur=THB&catId=${gameCatagory}&userID=${usernameUfabet}&isFull=true&checkAll=${checkAllStatus}`
      )
    } else {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}/SubAccsWLTransGame.aspx?role=${urlRole}&userName=${username}&pageIndex=${pageIndex}&to=${dateTo}&from=${dateFrom}&userName2=${usernameUfabet}&cur=THB&catId=${gameCatagory}&userID=${usernameUfabet}&isFull=true&checkAll=${checkAllStatus}`
      )
    }
    await bot.page.waitForTimeout(500)
    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      //   await bot.page.screenshot({ path: 'fullpage.png', fullPage: true })
      const time = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[1].innerText)
      )
      const choice = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[2].innerText)
      )
      const odds = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[3].innerText)
      )
      const stake = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[4].innerText)
      )
      const winLose = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[5].innerText)
      )
      const status = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[6].innerText)
      )

      let totalPage = await bot.page.$$eval(SELECTOR.totalPage, (list) =>
        list.map((ele) => ele.querySelectorAll('a').length)
      )
      totalPage++

      await bot.browser.close()

      return response.json({
        success: true,
        data: {
          time,
          choice,
          odds,
          stake,
          winLose,
          status,
          currentPage: pageIndex,
          totalPage,
        },
      })
    } else {
      await bot.browser.close()
      return response.json({
        success: false,
        message: 'please login ufabet',
      })
    }
  }
}
module.exports = ReportController
