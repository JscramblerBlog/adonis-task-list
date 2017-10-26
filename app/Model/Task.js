'use strict'

const Lucid = use('Lucid')

class Task extends Lucid {
	user () {
		return this.belongsTo('App/Model/User')
	}
}

module.exports = Task
