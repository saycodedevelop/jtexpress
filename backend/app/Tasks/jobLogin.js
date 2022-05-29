'use strict'

const Task = use('Task')

class Good extends Task {
  static get schedule () {
    return '*/1 * * * * *'
  }

  async handle () {
    //   console.log('xx');
      this.info('Task ScheduleIt handle')
  }
}

module.exports = Good