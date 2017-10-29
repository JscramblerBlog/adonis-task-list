'use strict'

// const Task = use('App/Model/Task') 

class TaskController {

  static get inject () { 
    return ['App/Model/Task']  
  }

  constructor (Task) { 
    this.Task = Task
  }

  * index(request, response) {
    const tasks = yield this.Task.all() 
    yield response.sendView('tasks.index', { tasks: tasks.toJSON() })
  }

  * create(request, response) {
    yield response.sendView('tasks.create')
  }

  * store(request, response) {
    let task = request.only('title', 'description');

    const newTask = new this.Task({
      title: task.title,
      description: task.description,
      user_id: request.currentUser
    })

    yield newTask.save()
  }

  * show(request, response) {
    const task = yield this.Task.find(request.param('id'))

    if (task) {
      yield response.sendView('tasks.show', { task: task.toJSON() })
      return
    }

    response.send('Sorry, cannot find the selected found')
  }

  * edit(request, response) {
    yield response.sendView('tasks.edit')
  }

  * update(request, response) {
    //
  }

  * destroy(request, response) {
    //
  }

}

module.exports = TaskController
