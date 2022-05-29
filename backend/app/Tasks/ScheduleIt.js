'use strict'

const Task = use('Task')

class ScheduleIt extends Task {
  static get schedule () {
    return '* 1 * * * *'
  }

  async handle () {
    this.info('Task ScheduleIt handle')
  }
}

module.exports = ScheduleIt

// console.log('imhere');

// const schedule = require('node-schedule');

// const job = schedule.scheduleJob('42 * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });