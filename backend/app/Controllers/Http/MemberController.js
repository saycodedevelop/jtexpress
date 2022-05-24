'use strict'
const Env = use('Env')
const Redis = use('Redis')
const Bot = use('App/Libs/Bot')
const Status = use('App/Libs/Status')

const WEBSITE_URL = Env.get('THIRDPIRTY_URL')

class MemberController {
  async getMemberList({ request, response }) {
    let pageIndex = request.get().pageIndex

    if (!pageIndex) {
      pageIndex = 1
    }

    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )

    const SELECTOR = {
      table: '#AccBal_cm1_g > tbody > tr:not(:first-child)',
      totalPage:
        '#page_main > table > tbody > tr:nth-child(2) > td > span:nth-child(5)',
    }

    // check status account and set url
    const isSubAccount = await Status.isSubAccount(request)
    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'
    const urlRole = isSubAgent ? 'sa' : 'ag'

    const bot = await Bot.start(request)
    if (isSubAccount) {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}_Sub/AccBal.aspx?role=${urlRole}&userName=${usernameUfabet}&searchKey=&pageIndex=${pageIndex}`
      )
    } else {
      await bot.page.goto(
        `${WEBSITE_URL}/_${urlAgent}/AccBal.aspx?role=${urlRole}&userName=${usernameUfabet}&searchKey=&pageIndex=${pageIndex}`
      )
    }

    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      const member = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[1].innerText)
      )
      const contact = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[2].innerText)
      )
      const balanceInGame = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[6].innerText)
      )
      const currentBalance = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[9].innerText)
      )
      const creditLimit = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[10].innerText)
      )

      let totalPage = await bot.page.$eval(
        SELECTOR.totalPage,
        (el) => el.innerText
      )

      totalPage = totalPage.substring(3)

      await bot.browser.close()

      return response.json({
        success: true,
        data: {
          member,
          contact,
          balanceInGame,
          currentBalance,
          creditLimit,
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

  async findMember({ request, response, params }) {
    const usernameMember = params.username
    if (!usernameMember) {
      return response.json({
        success: false,
        message: 'not member',
      })
    }
    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )
    const SELECTOR = {
      table: '#AccBal_cm1_g > tbody > tr:not(:first-child)',
      totalPage:
        '#page_main > table > tbody > tr:nth-child(2) > td > span:nth-child(5)',
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
      const member = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[1].innerText)
      )
      const contact = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[2].innerText)
      )
      const balanceInGame = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[6].innerText)
      )
      const currentBalance = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[9].innerText)
      )
      const creditLimit = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[10].innerText)
      )

      await bot.browser.close()

      return response.json({
        success: true,
        data: {
          member,
          contact,
          balanceInGame,
          currentBalance,
          creditLimit,
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

  async getMemberInfo({ request, response, params }) {
    const usernameMember = params.username

    if (!usernameMember) {
      return response.json({
        success: false,
        message: 'not member',
      })
    }

    const usernameUfabet = await Redis.hget(
      request.header('ufa-key'),
      'username'
    )

    // dom element selectors
    const SELECTOR = {
      table: '#AccBal_cm1_g > tbody > tr:not(:first-child)',
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
      const memberArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[1].innerText)
      )
      const contactArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[2].innerText)
      )
      const balanceInGameArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[6].innerText)
      )
      const currentBalanceArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[9].innerText)
      )
      const creditLimitArr = await bot.page.$$eval(SELECTOR.table, (list) =>
        list.map((ele) => ele.querySelectorAll('td')[10].innerText)
      )

      // Get First Data
      const member = memberArr[0]
      const contact = contactArr[0]
      const balanceInGame = balanceInGameArr[0]
      const currentBalance = currentBalanceArr[0]
      const creditLimit = creditLimitArr[0]

      await bot.browser.close()
      return response.json({
        success: true,
        data: {
          member,
          contact,
          balanceInGame,
          currentBalance,
          creditLimit,
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

  async setMemberInfo({ request, response, params }) {

    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'

    const bot = await Bot.start(request)
    await bot.page.goto(
      `${WEBSITE_URL}/_${urlAgent}1/MemberSet.aspx?userName=${params.username}&set=1`
    )
    // await bot.page.waitForTimeout(500)
    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      // dom element selectors
      const SELECTOR = {
        password: '#txtPassword',
        contact: '#txtContact',
        btnSubmit: '#btnSave2',
      }

      const USER = {
        password: request.post().password,
        contact: request.post().contact,
      }

      if (USER.password) {
        await bot.page.click(SELECTOR.password)
        await bot.page.$eval(
          SELECTOR.password,
          (el, password) => (el.value = password),
          USER.password
        )
      }

      if (USER.contact) {
        await bot.page.click(SELECTOR.contact)
        await bot.page.$eval(
          SELECTOR.contact,
          (el, contact) => (el.value = contact),
          USER.contact
        )
      }

      await bot.page.waitForTimeout(500)
      await Promise.all([
        bot.page.click(SELECTOR.btnSubmit),
        bot.page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ])

      await bot.browser.close()

      return response.json({
        success: true,
        data: { message: 'update member success' },
      })
    } else {
      await bot.browser.close()
      return response.json({
        success: false,
        message: 'please login ufabet',
      })
    }
  }

  async createMember({ request, response }) {
    // dom element selectors
    const SELECTOR = {
      username: '#txtUserName',
      password: '#txtPassword',
      creditLimit: '#txtTotalLimit',
      contact: '#txtContact',
      btnSubmit: '#btnSave',
      statusCreateUser: '#lblStatus > span',
    }

    const USER = {
      username: request.post().username,
      password: request.post().password,
      creditLimit: '0',
      contact: request.post().contact,
    }

    if (
      !USER.username ||
      !USER.password ||
      !USER.creditLimit ||
      !USER.contact
    ) {
      return response.json({
        success: false,
        message: 'not data request',
      })
    }

    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'

    const bot = await Bot.start(request)
    await bot.page.goto(`${WEBSITE_URL}/_${urlAgent}1/MemberSet.aspx`)
    // await bot.page.waitForTimeout(500)
    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      await bot.page.click(SELECTOR.username)
      await bot.page.$eval(
        SELECTOR.username,
        (el, username) => (el.value = username),
        USER.username
      )
      // await bot.page.waitForTimeout(500)
      await bot.page.click(SELECTOR.password)
      await bot.page.$eval(
        SELECTOR.password,
        (el, password) => (el.value = password),
        USER.password
      )
      // await bot.page.waitForTimeout(500)
      await bot.page.click(SELECTOR.creditLimit)
      await bot.page.$eval(
        SELECTOR.creditLimit,
        (el, creditLimit) => (el.value = creditLimit),
        USER.creditLimit
      )

      await bot.page.click(SELECTOR.contact)
      await bot.page.$eval(
        SELECTOR.contact,
        (el, contact) => (el.value = contact),
        USER.contact
      )
      await bot.page.waitForTimeout(500)
      await Promise.all([
        bot.page.click(SELECTOR.btnSubmit),
        bot.page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ])

      const statusCreateUser = await bot.page.$eval(
        SELECTOR.statusCreateUser,
        (el) => el.textContent
      )

      await bot.browser.close()

      return response.json({
        success: true,
        data: statusCreateUser,
      })
    } else {
      await bot.browser.close()
      return response.json({
        success: false,
        message: 'please login ufabet',
      })
    }
  }

  async copyMember({ request, response, params }) {
    // dom element selectors
    const SELECTOR = {
      username: '#txtUserName',
      password: '#txtPassword',
      creditLimit: '#txtTotalLimit',
      contact: '#txtContact',
      btnSubmit: '#btnSave',
      statusCreateUser: '#lblStatus > span',
    }

    const USER = {
      username: request.post().username,
      password: request.post().password,
      cName: params.copyUsername,
      creditLimit: '0',
      contact: request.post().contact,
    }

    if (
      !USER.username ||
      !USER.password ||
      !USER.cName ||
      !USER.creditLimit ||
      !USER.contact
    ) {
      return response.json({
        success: false,
        message: 'not data request',
      })
    }

    const isSubAgent = await Status.isSubAgent(request)
    const urlAgent = isSubAgent ? 'SubAg' : 'Age'

    const bot = await Bot.start(request)
    await bot.page.goto(`${WEBSITE_URL}/_${urlAgent}1/MemberSet.aspx?cName=${USER.cName}&set=1`)
    await bot.page.waitForTimeout(500)
    const isLogin = await Status.isAgentLogin(bot.page)

    if (isLogin) {
      await bot.page.click(SELECTOR.username)
      await bot.page.$eval(
        SELECTOR.username,
        (el, username) => (el.value = username),
        USER.username
      )
      // await bot.page.waitForTimeout(500)
      await bot.page.click(SELECTOR.password)
      await bot.page.$eval(
        SELECTOR.password,
        (el, password) => (el.value = password),
        USER.password
      )
      // await bot.page.waitForTimeout(500)
      await bot.page.click(SELECTOR.creditLimit)
      await bot.page.$eval(
        SELECTOR.creditLimit,
        (el, creditLimit) => (el.value = creditLimit),
        USER.creditLimit
      )

      await bot.page.click(SELECTOR.contact)
      await bot.page.$eval(
        SELECTOR.contact,
        (el, contact) => (el.value = contact),
        USER.contact
      )
      await bot.page.waitForTimeout(500)
      await Promise.all([
        bot.page.click(SELECTOR.btnSubmit),
        bot.page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ])

      const statusCreateUser = await bot.page.$eval(
        SELECTOR.statusCreateUser,
        (el) => el.textContent
      )

      await bot.browser.close()

      return response.json({
        success: true,
        data: statusCreateUser,
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

module.exports = MemberController
