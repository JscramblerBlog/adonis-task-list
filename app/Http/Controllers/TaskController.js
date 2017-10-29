'use strict'

class TaskController {

  static get inject () { 
    return ['App/Model/Task', 'App/Model/User']  
  }

  constructor (Task, User) { 
    this.Task = Task
    this.User = User
  }

  * index(request, response) {
    const tasks = yield this.Task.all() 
    yield response.sendView('tasks.index', { tasks: tasks.toJSON() })
  }

  * create(request, response) {
    const isLoggedIn = yield request.auth.check()

    if (!isLoggedIn) {
      response.redirect('/login')
    }

    yield response.sendView('tasks.create')
  }

  * store(request, response) {
    const isLoggedIn = yield request.auth.check()

    if (!isLoggedIn) {
      response.redirect('/login')
    }

    let task = request.only('title', 'description');

    const newTask = new this.Task({
      title: task.title,
      description: task.description,
      user_id: request.currentUser.id
    })

    yield newTask.save()

    response.redirect('/tasks')
  }

  * show(request, response) {
    const task = yield this.Task.find(request.param('id'))

    const owner = yield this.User.find(task.user_id)

    if (task) {
      yield response.sendView('tasks.show', { task: task.toJSON(), owner })
      return
    }

    response.send('Sorry, cannot find the selected found')
  }

  * edit(request, response) {
    yield response.sendView('tasks.edit')
  }

  * update(request, response) {
    const isLoggedIn = yield request.auth.check()

    if (!isLoggedIn) {
      response.redirect('/login')
    }
  }

  * destroy(request, response) {
    const isLoggedIn = yield request.auth.check()

    if (!isLoggedIn) {
      response.redirect('/login')
    }

    const task = yield this.Task.findBy('id', request.param('id'))
    yield task.delete()
  }

}

module.exports = TaskController
