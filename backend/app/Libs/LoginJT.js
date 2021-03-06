'use strict'
const Env = use('Env')
const WEBSITE_URL = Env.get('THIRDPIRTY_URL')
const Redis = use('Redis')
const Bot = use('App/Libs/Bot')
const { createWorker } = require('tesseract.js')
const Logger = use('Logger')
class LoginJT {
    static async run(headerReq) {
        const bot = await Bot.start()
        console.time('wait call wetsite full page')
        await bot.page.goto(WEBSITE_URL, { "waitUntil": "networkidle0" })
        console.timeEnd('wait call wetsite full page')


        // user account

        // const USER = {
        //     username: JT_USERNAME,
        //     password: JT_PASSWORD,
        // }
        const pass = Buffer.from(headerReq['vip-auth'],'base64').toString('utf-8')
        const USER = {
            username: headerReq['vip-username'],
            password: pass,
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
        if (!sessionStorageData.userInfo) {
            return { msg: 'Login False', time: new Date(), data: sessionStorageData }
        }
        await Redis.set('userInfo-' + USER.username, JSON.stringify(sessionStorageData.userInfo), 'EX', 3600);
        await Redis.set('Admin-Token-' + USER.username, JSON.stringify(sessionStorageData['Admin-Token']), 'EX', 3600);
        await Redis.set('UpdateTime-' + USER.username, JSON.stringify(new Date()), 'EX', 3600);
        return { msg: 'Login Success', time: new Date() }
    }
}

module.exports = LoginJT
