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
        const { ids, startDate, endDate, page, pageSize, size, idType, signFlag, goodsName, orderStatus, printFlag, isMult } = request.body
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = {
            ids,
            startDate,
            endDate,
            page,
            pageSize,
            size,
            idType,
            signFlag,
            goodsName,
            orderStatus,
            printFlag,
            isMult,
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
        const { ids } = request.body
        if (!ids) {
            return response.json({
                success: false,
                message: 'กรุณาส่งหมายเลขออเดอร์ (หากมีมากกว่า1 ให้ใช้เครื่องหาย "," )',
            })
        }
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = ids
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
        const { ids, templet } = request.body
        if (!ids || !templet) {
            return response.json({
                success: false,
                message: 'กรุณาส่งหมายเลขออเดอร์ และ templet',
            })
        }
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId()
        configheader.parameter = { ids, templet }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/printOrder.do`, configheader)
            return response.json(data)
        } catch (error) {
            return 'err'
        }
    }

    // validate Example
    // const rules = {
    //     username: 'required',
    //     game: 'required',
    //     dateFrom: 'required|dateFormat:MM/DD/YYYY',
    //     dateTo: 'required|dateFormat:MM/DD/YYYY',
    //   }
  
    //   let pageIndex = request.post().page
  
    //   if (!pageIndex) {
    //     pageIndex = 1
    //   }
    //   const validation = await validate(request.all(), rules)
    //   if (validation.fails()) {
    //     return response.json({
    //       success: false,
    //       message: 'plases check input data',
    //     })
    //   }
}

module.exports = JTController
