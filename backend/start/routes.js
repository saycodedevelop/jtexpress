'use strict'


/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')
Route.group(() => {
  Route.post('/list', 'JTController.getTest')
  Route.post('/order/fee', 'JTController.getFee')
  Route.post('/order/list', 'JTController.getOrder')
  Route.post('/order/check', 'JTController.checkOrder')
  Route.post('/order/create', 'JTController.createOrder')
  Route.post('/order/cancel', 'JTController.cancelOrder')
  Route.post('/order/chart', 'JTController.chartOrder')
  Route.post('/tracking', 'JTController.getTracking')
  Route.post('/print', 'JTController.getPrint')
  Route.post('/order/areacode', 'JTController.getAreacode')
}).prefix('v1/jt').middleware(['appAuth'])

// Route.group(() => {
//   Route.get('/info', 'AgentController.getInfo')
// })
//   .middleware(['ufaKey'])
//   .prefix('v1/agent')

// // member
// Route.group(() => {
//   Route.get('/', 'MemberController.getMemberList')
//   Route.post('/', 'MemberController.createMember')
//   Route.post('/copy/:copyUsername', 'MemberController.copyMember')
//   Route.get('/find/:username', 'MemberController.findMember')
//   Route.post('/transaction/game', 'ReportController.getTransactionGame')
//   Route.get('/:username', 'MemberController.getMemberInfo')
//   Route.put('/:username', 'MemberController.setMemberInfo')
// })
//   .middleware(['ufaKey'])
//   .prefix('v1/members')

// // transfer
// Route.group(() => {
//   Route.post('/deposit/:username', 'TransferController.deposit')
//   Route.post('/withdraw/:username', 'TransferController.withdraw')
//   Route.get('/cashout/:username', 'TransferController.cashOut')
// })
//   .middleware(['ufaKey'])
//   .prefix('v1/transfer')
