'use strict'
const Redis = use('Redis')

class Status {
  static async isAgentLogin(page) {
    const loginFailed = await page.$('#txtCode')

    if (loginFailed) {
      return false
    } else {
      return true
    }
  }

  // static async isElementAgentInfo(page) {
  //   const isElement = await page.$('#lblaUserName')
  //   if (isElement) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  // static async isSubAccount(request) {
  //   let isSubAccount = await Redis.hget(
  //     request.header('ufa-key'),
  //     'isSubAccount'
  //   )
  //   // covert string to boolean
  //   isSubAccount = isSubAccount == 'true'
  //   return isSubAccount
  // }

  // static async isSubAgent(request) {
  //   let isSubAgent = await Redis.hget(
  //     request.header('ufa-key'),
  //     'isSubAgent'
  //   )
  //   // covert string to boolean
  //   isSubAgent = isSubAgent == 'true'
  //   return isSubAgent
  // }
}

module.exports = Status
