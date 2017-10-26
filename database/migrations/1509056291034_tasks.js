'use strict'

const Schema = use('Schema')

class TasksTableSchema extends Schema {

  up () {
    this.create('tasks', (table) => {
      table.increments()
      table.timestamps()
      table.string('user_id')
      table.string('title')
      table.text('description')
    })
  }

  down () {
    this.drop('tasks')
  }

}

module.exports = TasksTableSchema
