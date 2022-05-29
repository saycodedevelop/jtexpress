'use strict'

const Env = use('Env')
const GenerateHeader = use('App/Libs/GenerateHeader')
const axios = require('axios')
const WEBSITE_URL = Env.get('THIRDPIRTY_URL')
class JTController {
    async getTest({ request, response }) {
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = {
            tabKey: '订单导入列表',
        }
        try {
            const { data } = await axios.post(
                `${WEBSITE_URL}/taiguo-vip-interface/api/getTableLists.do`,
                configheader
            )
            return response.json(data)
        } catch (error) {
            return response.json({
                success: false,
                message: error,
            })
        }
    }
    async getOrder({ request, response }) {
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = {
            endDate: '2022-05-29 20:04:04',
            ids: '',
            page: 1,
            pageSize: 20,
            startDate: '2022-05-28 00:00:00',
            idType: '1',
            signFlag: '',
            goodsName: '',
            orderStatus: '',
            printFlag: '',
            isMult: '',
            size: 20,
        }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/getOrders.do`, configheader)
            return response.json(data)
        } catch (error) {
            return response.json({
                success: false,
                message: error,
            })
        }
    }

    async getTracking({ request, response }) {
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = 860969356553
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/trackingList.do`, configheader)
            return response.json(data)
        } catch (error) {
            return response.json({
                success: false,
                message: error,
            })
        }
    }

    async getPrint({ request, response }) {
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = { ids: "860969354512", templet: "4" }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/printOrder.do`, configheader)
            return response.json(data)
        } catch (error) {
            return 'err'
        }
    }
}

module.exports = JTController
