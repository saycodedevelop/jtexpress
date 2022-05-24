'use strict'

const Env = use('Env')
const Hash = use('Hash')
const Redis = use('Redis')
const Logger = use('Logger')
const { createWorker } = require('tesseract.js')
const Bot = use('App/Libs/Bot')
const Status = use('App/Libs/Status')

const WEBSITE_URL = Env.get('THIRDPIRTY_URL')

class AgentController {
  async login({ request, response }) {
    if (!request.post().username || !request.post().password) {
      return response.json({
        success: false,
        message: 'invalit username or password',
      })
    }

    const bot = await Bot.start(request)
    console.time('wait call wetsite full page')
    await bot.page.goto(WEBSITE_URL, { "waitUntil": "networkidle0" })
    console.timeEnd('wait call wetsite full page')


    // user account
    const USER = {
      username: request.post().username,
      password: request.post().password,
    }

    const SELECTOR = {
      btnCloseDialog: '.el-dialog__headerbtn',
      username: 'input[name=loginCode]',
      password: 'input[name=loginPassword]',
      validation: '#loginImgCode',
      checkbox: '.el-checkbox__original',
      loginBtn: '.login-btn',
      
    }
    await bot.page.click(SELECTOR.btnCloseDialog)
    await bot.page.waitForTimeout(500)
    // input username , password
    await bot.page.type(SELECTOR.username, USER.username)
    await bot.page.type(SELECTOR.password, USER.password)

    await bot.page.waitForSelector('.img-container > img')
    const img = await bot.page.$('.img-container > img')
    const imgCaptcha = await img.screenshot({ path: 'captcha.png' })
    // const imgCaptcha = await img.screenshot()
    // console.timeEnd('get img from web')

    console.time('process img')
    // image processing captcha
    const worker = createWorker()
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    })
    const {
      data: { text },
    } = await worker.recognize(imgCaptcha)
    console.timeEnd('process img');
    Logger.info('captcha is:', text)
    await worker.terminate()

    // input validation captcha
    const verifyInput = `${text[0]}${text[1]}${text[2]}${text[3]}`
    await bot.page.type(SELECTOR.validation, verifyInput)
    
 
    const checkboxEl = await bot.page.waitForSelector(SELECTOR.checkbox);
    checkboxEl.click();
 
  

    await bot.page.waitForTimeout(200)
    // await bot.page.click(SELECTOR.loginBtn)
    
    await bot.page.waitForTimeout(500)

    await bot.page.screenshot({ path: 'preview.png' });

    await bot.browser.close()
  

    // // click validation
    // await bot.page.click(SELECTOR.validation)


   

    // // await bot.page.waitForTimeout(500)
    // // click submitt
    // await Promise.all([
    //   bot.page.click(SELECTOR.btnSubmit),
    //   bot.page.waitForNavigation(),
    // ])

    // const isLogin = await Status.isAgentLogin(bot.page)

    // if (!isLogin) {
    //   await bot.browser.close()
    //   return response.json({
    //     success: false,
    //     message: 'username or password wrong',
    //   })
    // }

    // // check Sub Account
    // const frame = bot.page.frames().find((frame) => frame.name() === 'fraMain')
    // if (!frame) {
    //   await bot.browser.close()
    //   return response.json({
    //     success: false,
    //     message: 'open ufabet failed',
    //   })
    // }

    // const usernameIsLoginPass = (await Status.isElementAgentInfo(frame))
    //   ? '#lblaUserName'
    //   : '#lblsUserName'
    // const usernameAgent = await frame.$eval(
    //   usernameIsLoginPass,
    //   (el) => el.innerHTML
    // )
    // const isSubAccount = usernameAgent != USER.username
    // const isSubAgent = usernameIsLoginPass == '#lblsUserName' ? true : false
    // // get cookies ufabet
    // const cookies = await bot.page.cookies()
    // cookies.map((res) => {
    //   return (res.domain = Env.get('DOMAIN_COOKIE'))
    // })

    // // Save cookie, token in redis
    // const token = await Hash.make(JSON.stringify(cookies))
    // await Redis.hset(
    //   token,
    //   'username',
    //   usernameAgent,
    //   'isSubAccount',
    //   isSubAccount,
    //   'isSubAgent',
    //   isSubAgent,
    //   'cookies',
    //   JSON.stringify(cookies)
    // )
    // // set expire redis 24 hr
    // const nd = new Date().setHours(23, 59, 59)
    // const expire = Math.floor((nd - Date.now()) / 1000)
    // await Redis.expire(token, expire)

    // await bot.browser.close()
    // Logger.info('success login')
    return response.json({ success: true, xx: 'token' })
  }

  async getInfo({ request, response }) {
    Logger.error('dkdkddk')
    const bot = await Bot.start(request)
    await bot.page.goto(`${WEBSITE_URL}/AccInfo.aspx`)

    const isLogin = await Status.isAgentLogin(bot.page)
    const isElement = await Status.isElementAgentInfo(bot.page)
    // dom element selectors
    const SELECTOR = {
      username: isElement ? '#lblaUserName' : '#lblsUserName',
      accountBalance: isElement
        ? '#lblaAccBalance > span'
        : '#lblsAccBalance > span',
      membersBalance: isElement
        ? '#lblaTotalBalance > span'
        : '#lblsTotalBalance > span',
      totalMemberCredit: isElement
        ? '#lblaTotalMemberCredit > span'
        : '#lblsTotalMemberCredit > span',
      totalMember: isElement
        ? '#lblaTotalMemberCount'
        : '#lblsTotalMemberCount',
    }

    if (isLogin) {
      const username = await bot.page.$eval(
        SELECTOR.username,
        (el) => el.innerHTML
      )
      const accountBalance = await bot.page.$eval(
        SELECTOR.accountBalance,
        (el) => el.innerHTML
      )
      const membersBalance = await bot.page.$eval(
        SELECTOR.membersBalance,
        (el) => el.innerHTML
      )
      const totalMemberCredit = await bot.page.$eval(
        SELECTOR.totalMemberCredit,
        (el) => el.innerHTML
      )
      const totalMember = await bot.page.$eval(
        SELECTOR.totalMember,
        (el) => el.innerHTML
      )

      await bot.browser.close()

      return response.json({
        success: true,
        data: {
          username,
          accountBalance,
          membersBalance,
          totalMemberCredit,
          totalMember,
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

module.exports = AgentController
