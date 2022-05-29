'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Env = use('Env')
const JT_APP_KEY = Env.get('JT_APP_KEY')
class AppAuth {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, response }, next) {
    // call next to advance the request
    if (!request.header('Authorization')) {
      return response.json({
        success: false,
        message: 'Authorization Not Found',
      })
    }


    if (JT_APP_KEY!=request.header('Authorization') ) {
      return response.json({
        success: false,
        message: 'Authorization Not Match',
      })
    }

    await next()
  }
}

module.exports = AppAuth
