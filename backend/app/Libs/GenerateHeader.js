'use strict'
const Redis = use('Redis')
const LoginJT = use('App/Libs/LoginJT')
class GenerateHeader {

    static async gennerateTimeAndUniqeId() {
        function generateString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }
        let AdminToken = await Redis.get('Admin-Token')
        if (!AdminToken) {
            console.log('re call login');
            await LoginJT.run()
            AdminToken = await Redis.get('Admin-Token')
        }
        return {
            token: AdminToken.replace(/^"(.*)"$/, '$1'),
            t: new Date().getTime(),
            s: generateString(32),
        }
    }
}

module.exports = GenerateHeader
