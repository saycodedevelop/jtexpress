'use strict'

const Env = use('Env')
const GenerateHeader = use('App/Libs/GenerateHeader')
const axios = require('axios')
const WEBSITE_URL = Env.get('THIRDPIRTY_URL')

class JTController {

    async checkOrder({ request, response }) {
        const { reciver, cod, tel, address, remark } = request.body
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = `${reciver}\n\n${cod}\n\n${tel}\n\n${address}\n\n***${remark}\n\n-End-`
        // return  configheader.parameter
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/analysisOrder.do`, configheader)
            if (data.data.orders[0].errorMsg) {
                return response.json({
                    success: false,
                    message: data.data.orders[0].errorMsg,
                })
            }
            // will create order and return tracking
            return response.json(data)
        } catch (error) {
            return response.json({
                success: false,
                message: error,
            })
        }
    }

    async createOrder({ request, response }) {
        const data = request.body
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = data.order
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/insertOrder.do`, configheader)
            if (data.data) {
                return response.json({
                    success: true,
                    message: data.data,
                })
            }
            // will create order and return tracking
            console.log(data);
            return response.json(data)
        } catch (error) {
            console.log(error);
            return response.json({
                success: false,
                message: error,
            })
        }
    }


    async cancelOrder({ request, response }) {
        const data = request.body
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = { ids: data.ids }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/cancelOrder.do`, configheader)
            if (data.data) {
                return response.json({
                    success: false,
                    message: data.data,
                })
            }
            // will create order and return tracking
            console.log(data);
            return response.json(data)
        } catch (error) {
            console.log(error);
            return response.json({
                success: false,
                message: error,
            })
        }
    }

    async chartOrder({ request, response }) {
        const { queryTimeSimplify, queryType } = request.body
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = {
            queryTimeSimplify,
            queryType,
        }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/getChartData.do`, configheader)
            return response.json(data)
        } catch (error) {
            return response.json({
                success: false,
                message: error,
            })
        }
    }

    async getTest({ request, response }) {
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = {
            tabKey: '??????????????????',
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
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
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
                message: '?????????????????????????????????????????????????????????????????? (????????????????????????????????????1 ???????????????????????????????????????????????? "," )',
            })
        }
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
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


    async getFee({ request, response }) {
        const { receiverAreaId, senderCityId, type, weight } = request.body
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = { receiverAreaId, senderCityId, type, weight }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/getFee.do`, configheader)
            return response.json(data)
        } catch (error) {
            return 'err'
        }
    }

    async getPrint({ request, response }) {
        const { ids, templet } = request.body
        if (!ids || !templet) {
            return response.json({
                success: false,
                message: '?????????????????????????????????????????????????????????????????? ????????? templet',
            })
        }
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = { ids, templet }
        try {
            const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/printOrder.do`, configheader)
            return response.json(data)
        } catch (error) {
            return 'err'
        }
    }



    async getAreacode({ request, response }) {
        const { ids } = request.body
        if (!ids) {
            return response.json({
                success: false,
                message: '?????????????????????????????????????????????????????????????????? ????????? templet',
            })
        }
        const configheader = await GenerateHeader.gennerateTimeAndUniqeId(request.headers())
        configheader.parameter = { ids, templet: 7 }
        // try {
        const { data } = await axios.post(`${WEBSITE_URL}/taiguo-vip-interface/api/printOrder.do`, configheader)

        if (!data.success) {
            return response.json({ success: false, message: "?????????????????????????????????????????? tracking ????????????????????????" })
        }
        const res = await this.decodePdf(data.data.pdf)
        const preResult = res.split("Order#:")
        const preResult2 = preResult[0].split(" ")
        const resultPosition = preResult2.length
        const areanumber = preResult2[resultPosition - 2]
        return response.json({ success: true, areanumber })
    }
    async decodePdf(urlpdf) {
        const promise = new Promise((resolve, reject) => {
            const textract = require('textract');
            textract.fromUrl(urlpdf, (err, data) => {
                resolve(data);
            });
        })
        return promise
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
