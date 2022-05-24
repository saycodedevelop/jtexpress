'use strict'

const Env = use('Env')
const Hash = use('Hash')
const Redis = use('Redis')
const Logger = use('Logger')
const { createWorker } = require('tesseract.js')
const Bot = use('App/Libs/Bot')
const Status = use('App/Libs/Status')

const WEBSITE_URL = Env.get('THIRDPIRTY_URL')
const axios = require('axios')

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
      checkbox: '.el-checkbox',
      loginBtn: '.login-btn',

    }
    await bot.page.click(SELECTOR.btnCloseDialog)
    await bot.page.waitForTimeout(500)
    // input username , password
    await bot.page.type(SELECTOR.username, USER.username)
    await bot.page.type(SELECTOR.password, USER.password)
    console.log('capture1');
    await bot.page.screenshot({ path: 'capture-preview-1.png' });
    await bot.page.waitForSelector('.img-container > img')
    const img = await bot.page.$('.img-container > img')
    const imgCaptcha = await img.screenshot({ path: 'capture-captcha.png' })
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
    await bot.page.click(SELECTOR.validation)
    await bot.page.waitForTimeout(100)
    await bot.page.type(SELECTOR.validation, verifyInput)


    const checkboxEl = await bot.page.waitForSelector(SELECTOR.checkbox);
    checkboxEl.click();
    console.log('capture2');
    await bot.page.screenshot({ path: 'capture-preview-2.png' });

    await bot.page.waitForTimeout(500)
    await bot.page.click(SELECTOR.loginBtn)
    // await Promise.all([
    //   bot.page.click(SELECTOR.loginBtn),
    //   bot.page.waitForNavigation(),
    // ])

    await bot.page.waitForTimeout(500)
    console.log('capture3');
    await bot.page.screenshot({ path: 'capture-preview-3.png' });

    // go to dashboard page
    await bot.page.goto(`${WEBSITE_URL}/#/dashboard`);
    await bot.page.waitForTimeout(2000);
    console.log('capture4');
    await bot.page.screenshot({ path: 'capture-preview-4.png' });
    // const isLogin = await Status.isAgentLogin(bot.page)



    // get cookies web scapping
    // const cookies = await bot.page.cookies()
    // console.log('cookies ::',cookies);

    // get session web scapping

    // await bot.page.waitForTimeout(3000);
    const sessionStorageData = await bot.page.evaluate(() => {
      let json = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        json[key] = sessionStorage.getItem(key);
      }
      return json;
    });

    // const localStorageData = await bot.page.evaluate(() => {
    //   let json = {};
    //   for (let i = 0; i < localStorage.length; i++) {
    //     const key = localStorage.key(i);
    //     json[key] = localStorage.getItem(key);
    //   }
    //   return json;
    // });

    await bot.browser.close()

    // const lang = localStorageData.language
    // return response.json({ success: true, sessionData: sessionStorageData, localData: localStorageData, cookies })
    return response.json({ success: true, sessionData: sessionStorageData, })
  }

  // async getInfo({ request, response }) {
  //   Logger.error('dkdkddk')
  //   const bot = await Bot.start(request)
  //   await bot.page.goto(`${WEBSITE_URL}/AccInfo.aspx`)

  //   const isLogin = await Status.isAgentLogin(bot.page)
  //   const isElement = await Status.isElementAgentInfo(bot.page)
  //   // dom element selectors
  //   const SELECTOR = {
  //     username: isElement ? '#lblaUserName' : '#lblsUserName',
  //     accountBalance: isElement
  //       ? '#lblaAccBalance > span'
  //       : '#lblsAccBalance > span',
  //     membersBalance: isElement
  //       ? '#lblaTotalBalance > span'
  //       : '#lblsTotalBalance > span',
  //     totalMemberCredit: isElement
  //       ? '#lblaTotalMemberCredit > span'
  //       : '#lblsTotalMemberCredit > span',
  //     totalMember: isElement
  //       ? '#lblaTotalMemberCount'
  //       : '#lblsTotalMemberCount',
  //   }

  //   if (isLogin) {
  //     const username = await bot.page.$eval(
  //       SELECTOR.username,
  //       (el) => el.innerHTML
  //     )
  //     const accountBalance = await bot.page.$eval(
  //       SELECTOR.accountBalance,
  //       (el) => el.innerHTML
  //     )
  //     const membersBalance = await bot.page.$eval(
  //       SELECTOR.membersBalance,
  //       (el) => el.innerHTML
  //     )
  //     const totalMemberCredit = await bot.page.$eval(
  //       SELECTOR.totalMemberCredit,
  //       (el) => el.innerHTML
  //     )
  //     const totalMember = await bot.page.$eval(
  //       SELECTOR.totalMember,
  //       (el) => el.innerHTML
  //     )

  //     await bot.browser.close()

  //     return response.json({
  //       success: true,
  //       data: {
  //         username,
  //         accountBalance,
  //         membersBalance,
  //         totalMemberCredit,
  //         totalMember,
  //       },
  //     })
  //   } else {
  //     await bot.browser.close()
  //     return response.json({
  //       success: false,
  //       message: 'please login ufabet',
  //     })
  //   }
  // }


  generateString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
  gennerateTimeAndUniqeId() {
    return {
      time: new Date().getTime(),
      unique: this.generateString(32),
    }
  }

  async getTest({ request, response }) {
    const config = this.gennerateTimeAndUniqeId()
    const body = {
      "parameter": {
        "tabKey": "订单导入列表"
      },
      token: "session_A2881C2D809FA56F",
      t: config.time,
      s: config.unique
    }

    try {
      const { data } = await axios.post('https://vip.jtexpress.co.th/taiguo-vip-interface/api/getTableLists.do', body)
      return response.json(data)
    } catch (error) {
      return 'err'
      // if (axios.isAxiosError(error)) {
      //   handleAxiosError(error);
      // } else {
      //   handleUnexpectedError(error);
      // }
    }
    // let result;
    // axios.post('https://vip.jtexpress.co.th/taiguo-vip-interface/api/getTableLists.do', body)
    //   .then(function (res) {
    //     console.log(res);
    //     result = res
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //     result = error
    //   })
    // return response.json(result)
    // return config
  }



}

module.exports = AgentController
