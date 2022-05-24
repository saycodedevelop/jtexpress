'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Redis = use('Redis')
class UfaKey {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ request, response }, next) {
    // call next to advance the request
    if (!request.header('ufa-key')) {
      return response.json({
        success: false,
        message: 'not ufa key',
      })
    }

    // check token in redis
    const token = await Redis.keys(request.header('ufa-key'))
    if (!token[0]) {
      return response.json({
        success: false,
        message: 'token not match',
      })
    }

    await next()
  }
}

module.exports = UfaKey
