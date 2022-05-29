'use strict'

const Env = use('Env')
const GenerateHeader = use('App/Libs/GenerateHeader')
const axios = require('axios')

class JTController {

    async getTest({ request, response }) {

        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = {
            tabKey: "订单导入列表"
        }
        try {
            const { data } = await axios.post('https://vip.jtexpress.co.th/taiguo-vip-interface/api/getTableLists.do', configheader)
            return response.json(data)
        } catch (error) {
            return 'err'
        }
    }
}

module.exports = JTController
