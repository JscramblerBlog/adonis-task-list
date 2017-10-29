'use strict'

const Task = use('App/Model/Task') 

class TaskController {

  * index(request, response) {
    const tasks = yield Task.all() 
    yield response.sendView('tasks/index', { tasks: tasks.toJSON() })
  }

  * create(request, response) {
    //
  }

  * store(request, response) {
    //
  }

  * show(request, response) {
    //
  }

  * edit(request, response) {
    //
  }

  * update(request, response) {
    //
  }

  * destroy(request, response) {
    //
  }

}

module.exports = TaskController
