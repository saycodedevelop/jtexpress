'use strict'

const Env = use('Env')
const Redis = use('Redis')
const Bot = use('App/Libs/Bot')
const Status = use('App/Libs/Status')

const WEBSITE_URL = Env.get('THIRDPIRTY_URL')

class TransferController {
  async deposit({ request, response, params }) {
    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )

    const usernameMember = params.username
    let inputValue = request.post().value

    if (!usernameMember || !inputValue) {
      return response.json({
        success: false,
        message: 'plases check input data',
      })
    }

    const SELECTOR = {
      table: '#AccBal_cm1_g > tbody > tr:not(:first-child)',
      depositInput: '#AccPay_cm1_txtAmount',
      btnSubmit: '#AccPay_cm1_btnSubmit',
      textStatus: '#AccPay_cm1_lblStatus'
    }

    // check status account and set url
    const isSubAccount = await Status.isSubAccount(request)
    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'
    const urlRole = isSubAgent ? 'sa' : 'ag'

    const bot = await Bot.start(request)
    if (isSubAccount) {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}_Sub/AccPay.aspx?userName=${usernameMember}&role=ag&curCode=THB`
      )
    } else {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}/AccPay.aspx?userName=${usernameMember}&role=ag&curCode=THB`
      )
    }

    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      inputValue = inputValue.toString()
      await bot.page.waitForSelector(SELECTOR.depositInput)
      await bot.page.click(SELECTOR.depositInput)
      // inputValue = `${inputValue}`
      await bot.page.$eval(
        SELECTOR.depositInput,
        (el, withdraw) => (el.value = withdraw),
        inputValue
      )
      await bot.page.waitForTimeout(1000)
      await bot.page.click(SELECTOR.btnSubmit)
      await bot.page.waitForNavigation()
      await bot.page.waitForTimeout(500)
      await bot.page.waitForSelector(SELECTOR.depositInput)
      await bot.page.waitForSelector(SELECTOR.textStatus)

      // check status ว่า ufabet เตือนว่าเติมถี่เกินไปหรือเปล่า
      const textStatus = await bot.page.$eval(
        SELECTOR.textStatus,
        (el) => el.innerHTML
      )
      await bot.browser.close()
      if (textStatus) {
        return response.json({
          success: false,
          data: {
            message: textStatus,
          },
        })
      } else {
        return response.json({
          success: true,
          data: {
            message: 'update deposit success',
          },
        })
      }
    } else {
      await bot.browser.close()
      return response.json({
        success: false,
        message: 'please login ufabet',
      })
    }
  }
  async withdraw({ request, response, params }) {
    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )

    const usernameMember = params.username
    let inputValue = request.post().value

    if (!usernameMember || !inputValue) {
      return response.json({
        success: false,
        message: 'plases check input data',
      })
    }

    const SELECTOR = {
      table: '#AccBal_cm1_g > tbody > tr:not(:first-child)',
      withdrawInput: '#AccPay_cm1_txtAmount',
      btnSubmit: '#AccPay_cm1_btnSubmit',
      textStatus: '#AccPay_cm1_lblStatus'
    }

    // check status account and set url
    const isSubAccount = await Status.isSubAccount(request)
    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'
    const urlRole = isSubAgent ? 'sa' : 'ag'

    const bot = await Bot.start(request)
    if (isSubAccount) {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}_Sub/AccBal.aspx?role=${urlRole}&userName=${usernameUfabet}&searchKey=${usernameMember}`
      )
    } else {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}/AccBal.aspx?role=${urlRole}&userName=${usernameUfabet}&searchKey=${usernameMember}`
      )
    }
    // await bot.page.waitForTimeout(500)
    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      inputValue = parseInt(inputValue)

      const currentBalanceArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[9].innerText)
      )

      let currentBalance = currentBalanceArr[0]
      currentBalance = parseInt(currentBalance.replace(/,/g, ''))
      if (inputValue > currentBalance) {
        await bot.browser.close()
        return response.json({
          success: false,
          message: 'not enough value',
        })
      }

      const urlWithdrawArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td > a')[0].href)
      )
      const urlWithdraw = urlWithdrawArr[0]

      await bot.page.goto(urlWithdraw)
      await bot.page.waitForSelector(SELECTOR.withdrawInput)
      await bot.page.click(SELECTOR.withdrawInput)
      inputValue = `-${inputValue}`
      await bot.page.$eval(
        SELECTOR.withdrawInput,
        (el, withdraw) => (el.value = withdraw),
        inputValue
      )
      await bot.page.waitForTimeout(1000)
      await bot.page.click(SELECTOR.btnSubmit)
      await bot.page.waitForNavigation()
      await bot.page.waitForTimeout(500)
      await bot.page.waitForSelector(SELECTOR.withdrawInput)
      await bot.page.waitForSelector(SELECTOR.textStatus)

      // check status ว่า ufabet เตือนว่าเติมถี่เกินไปหรือเปล่า
      const textStatus = await bot.page.$eval(
        SELECTOR.textStatus,
        (el) => el.innerHTML
      )
      await bot.browser.close()

      if (textStatus) {
        return response.json({
          success: false,
          data: {
            message: textStatus,
          },
        })
      } else {
        return response.json({
          success: true,
          data: {
            message: 'update withdraw success',
          },
        })
      }

    } else {
      await bot.browser.close()
      return response.json({
        success: false,
        message: 'please login ufabet',
      })
    }
  }
  async cashOut({ request, response, params }) {
    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )

    const usernameMember = params.username
    if (!usernameMember) {
      return response.json({
        success: false,
        message: 'plases check input data',
      })
    }

    const SELECTOR = {
      btnCashOut: '#btnCashOut',
      iframe: '#form1 > iframe',
      btnWithdraw:
        'body > div > div:nth-child(2) > div > button.btn.btn-danger.m-2',
    }

    // check status account and set url
    const isSubAccount = await Status.isSubAccount(request)
    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'
    const urlRole = isSubAgent ? 'sa' : 'ag'

    const bot = await Bot.start(request)
    if (isSubAccount) {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}_Sub/AccBal.aspx?role=${urlRole}&userName=${usernameUfabet}&searchKey=${usernameMember}`
      )
    } else {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}/AccBal.aspx?role=${urlRole}&userName=${usernameUfabet}&searchKey=${usernameMember}`
      )
    }

    const isLogin = await Status.isAgentLogin(bot.page)
    if (isLogin) {
      const pageTarget = bot.page.target() //save this to know that this was the opener

      await bot.page.click(SELECTOR.btnCashOut) //click on a btn cash out
      //check that you opened this page, rather than just checking the url
      const newTarget = await bot.browser.waitForTarget(
        (target) => target.opener() === pageTarget
      )

      //get the page object
      const newPage = await newTarget.page()
      await newPage.waitForSelector(SELECTOR.iframe)

      const urlIframe = await newPage.$eval(SELECTOR.iframe, (el) => el.src)

      //   Go to url from iframe
      await bot.page.goto(urlIframe)
      await bot.page.waitForTimeout(1500)
      const anotherLogin = await bot.page.$eval(
        '#ctl00_ContentPlaceHolder1_ErrMsg',
        (el) => el.innerText
      )
      if (anotherLogin) {
        await bot.browser.close()
        return response.json({
          success: false,
          message: anotherLogin,
        })
      } else {
        await bot.page.click(SELECTOR.btnWithdraw)
        await bot.page.waitForTimeout(1500)
        await bot.browser.close()
        return response.json({
          success: true,
          data: 'cash out success',
        })
      }
    } else {
      await bot.browser.close()
      return response.json({
        success: false,
        message: 'please login ufabet',
      })
    }
  }
}

module.exports = TransferController
