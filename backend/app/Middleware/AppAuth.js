'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Env = use('Env')
const JT_APP_KEY = Env.get('JT_APP_KEY')
const Redis = use('Redis')

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


    if (JT_APP_KEY != request.header('Authorization')) {
      return response.json({
        success: false,
        message: 'Authorization Not Match',
      })
    }

    if (!request.header('vip-username') || !request.header('vip-auth')) {
      return response.json({
        success: false,
        message: 'invalid vip username or auth vip',
      })
    }
    await Redis.set('vip-username-' + request.header('vip-username'), JSON.stringify(request.header('vip-username')), 'EX', 3600);
    await Redis.set('vip-auth-' + request.header('vip-username'), JSON.stringify(request.header('vip-auth')), 'EX', 3600);

    await next()
  }
}

module.exports = AppAuth
