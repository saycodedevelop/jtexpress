'use strict'
const Redis = use('Redis')
const LoginJT = use('App/Libs/LoginJT')
class GenerateHeader {

    static async gennerateTimeAndUniqeId(header) {
        const vipuser = header['vip-username']
        function generateString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }
        let AdminToken = await Redis.get('Admin-Token-' + vipuser)
        if (!AdminToken) {
            console.log('re call login');
            await LoginJT.run(header)
            AdminToken = await Redis.get('Admin-Token' + vipuser)
        }
        // let AdminToken = await Redis.get('Admin-Token')
        // if (!AdminToken) {
        //     console.log('re call login');
        //     await LoginJT.run()
        //     AdminToken = await Redis.get('Admin-Token')
        // }
        return {
            token: AdminToken ? AdminToken.replace(/^"(.*)"$/, '$1') : null,
            t: new Date().getTime(),
            s: generateString(32),
        }
    }
}

module.exports = GenerateHeader
