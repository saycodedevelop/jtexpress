'use strict'

const Task = use('Task')
const LoginJT = use('App/Libs/LoginJT')

class ScheduleIt extends Task {
  static get schedule() {
    // return '1 * * * * *'
    return '* 1 * * * *'
  }

  async handle() {
    // this.info('Task ScheduleIt handle')
   console.log('it working every hour');
   const res =  await LoginJT.run()
   console.log(res);

  }
}

module.exports = ScheduleIt
