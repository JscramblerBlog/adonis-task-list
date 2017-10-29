**Article Title:** Build authentication, email, website and API with Adonis 3

**Description:**

Adonis.js is a powerful fullstack framework built from Node.js and ES6 generator functions. Adonis takes inspiration from Laravel and Ruby On Rails to provide an opinionated web development framework for Node.js. In this tutorial we will generate a Node.js server that talks to a MySQL database to render content in the browser. Using Adonis' built in tools we will also configure our application to authenticate users and send emails.

**Ideas to Present in Article:**

- Introduction to Adonis.js, what it does and why the tool was developed in the first place
- Generate a new Adonis.js application and install dependencies
- Configure our database and generate our API models
- Define and develop routes for Creating, Updating and Deleting records from the database
- Add authentication scaffold
- Send emails from the application using a webhook
- Conclusion


# Build authentication, email, website and API with Adonis 3
 
![Introduction to Adonis Node.js framework](https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F36670640%2F210609116707%2F1%2Foriginal.jpg?w=800&rect=16%2C0%2C2142%2C1071&s=d3c933b0c65f21cb8e1a828d3500aac1)
 
## Introduction
 
We’re going to build a Task app application. For anyone learning a new framework this is a great way to dive into the concepts and build a functional prototype. The application will Create, Read, Update and Delete (CRUD) tasks that will be stored in a MySQL database. We’ll expose JSON endpoints for our tasks and have authentication so that only authorized users can post tasks. Additionally, we will send emails to users once a new task is created.
 
## Installation and setup
 
![](https://s16.postimg.org/aaoetxi7p/install_cli.gif)
 
First up we need to install the Adonis command line tool and install dependencies through npm or yarn, whichever you prefer.
 
```
$ npm i -g adonis-cli
$ adonis new adonis-task-list
$ cd adonis-task-list
$ npm i 
$ npm run serve:dev
```
 
There commands will generate a new Adonis application on our local machine and start a web server on `http://localhost:3333`. You can open your web browser to that address and see our starter application.
 
![](https://i.imgur.com/yzT8s50.png)
 
As outlined in [the documentation](https://adonisjs.com/docs/3.2/directory-structure) an Adonis app will have the following directory structure:

```
├── app
│   ├── Commands
│   ├── Http
│   ├── Listeners
│   ├── Model
├── bootstrap
├── config
├── database
│   ├── migrations
│   └── seeds
├── providers
├── public
├── resources
│   └── views
├── storage
```

For developers familiar with [Laravel 5](https://laravel.com/) this structure is immediately recognizable, particularly the app, config, database, storage and resources directories. If you are not familiar with Laravel know that Adonis follows and Model View Controller (MVC) pattern first pioneered and popularized in web servers by Ruby On Rails.

## Create a local database

We will define a Task database model that will correspond to a MySQL table. You will need to have MySQL set up on your local machine. 

```
$ mysql -uroot -p
> create database adonistasklist;
```

If you do not have MySQL configured on your machine or prefer to use another database such as Postgres or SQLite that is totally cool.

Configure .env variables:

```
HOST=localhost
PORT=3333
APP_KEY=n96M1TPG821EdN4mMIjnGKxGytx9W2UJ
NODE_ENV=development
CACHE_VIEWS=false
SESSION_DRIVER=cookie
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=XXXXXXX
DB_DATABASE=adonistasklist
```

Install the [mysql npm package](https://github.com/mysqljs/mysql): `npm i --save mysql`

Ace is the command line tool for every Adonis package and it is available by default. We can use ace to generate models, migrations, controllers and more. For a full list of the available commands run `./ace --help`

Now that our database is created and connected generate a model and a migration file using the ace CLI:

```
$ ./ace make:model Task
create: app/Model/Task.js
$ ./ace make:migration tasks --create=tasks
create: database/migrations/1509056291034_tasks.js
$ ./ace migration:run
✔ Database migrated successfully in 737 ms
```

If you view the database you created with a MySQL tool such as [SQLPro](https://www.sequelpro.com/) you’ll be able to see that the database includes a table called tasks that includes columns for `id`, `created_at` and `updated_at`. These fields are defined in the migration file we created. In our application we’d like tasks to have a title and a description. Additionally, a particular task will belong to a user. So we’ll add that field now and set up the rest of the user logic in one moment.

**database/migrations/XXXXX_tasks.js**

```
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
```

Migrations in Adonis use [Knex.js](http://knexjs.org/#Schema-Building) query builder so you can refer to that documentation.

We can also specify that a Task belongs to a user:

**app/Model/Task.js**
```
'use strict'

const Lucid = use('Lucid')

class Task extends Lucid {
	user () {
		return this.belongsTo('App/Model/User')
	}
}

module.exports = Task
```

Next we’ll run the `refresh` command that will rollback our migrations and set up our database anew with the `user_id`, `title` and `description` columns we just added to the tasks table.

```
$ ./ace migration:refresh
```

## Add authentication

Authentication is a massive topic that whole companies are built around. Adonis provides [multiple modes of authentication](https://adonisjs.com/docs/3.2/authentication) out of the box. In this tutorial we are going to set up session authentication through default ace commands:

```
$ ./ace auth:setup
create: app/Model/Token.js
create: database/migrations/1509056843032_create_users_table.js
create: database/migrations/1509056843033_create_tokens_table.js
create: app/Model/User.js
```

This command generates a users table and user model that we'll use as a starting point for our application. The tokens model and tokens table are for storing the session information for a particular user. A user will remained logged in for the duration of their session and a session token will be associated with a user. Check out the files in **app/Model** and you'll see that a user has many Tokens and a token belongs to a user. If you are not familiar with SQL database relationships, Ruby On Rails has an excellent guide that covers the concepts [here](http://guides.rubyonrails.org/association_basics.html)

## Seed database

Adonis has built in capabilities for seeding data. We want to create some users and tasks so that when we fire up our server we don't see blank data. Adonis uses [chance.js](http://chancejs.com/) under the hood to mock out information. We can call chance methods in our database factories. The Adonis docs on seeds and factories is available [here](https://adonisjs.com/docs/3.2/seeds-and-factories)

First we call our factories from the database seeder in **database/seeds/Database.js**:

```
const Factory = use('Factory')

class DatabaseSeeder {

  * run () {
    yield Factory.model('App/Model/User').create(5)
    yield Factory.model('App/Model/Task').create(5)

  }

}

module.exports = DatabaseSeeder
```

If you are not familiar with the concept of datbase factories they are essentially blueprints for creating instances of database records. As you can see in the code above we call the model factories to create five users and five tasks. These model factories are defined in **database/factory.js** and that file can look like so:

```
Factory.blueprint('App/Model/User', (fake) => {
  return {
    username: fake.username(),
    email: fake.email(),
    password: fake.password()
  }
})

Factory.blueprint('App/Model/Task', (fake) => {
  return {
    title: fake.sentence(),
    description: fake.paragraph(),
    user_id: 1
  }
})
```

Here we are using a chance.js to populate random sentences, usernames, emails, passwords and paragraphs. These will all be unique database records that we can populate our database with. If you are brand new to the concept of database seeding and model factories Laravel has some great [documentation on the topic](https://laravel.com/docs/5.5/database-testing#writing-factories).

In order to create our users table and the corresponding database records we must run the following commands.

```
$ ./ace migration:reset 
$ ./ace migration:run
$ ./ace db:seed
```

Reset will drop the tables and clear the database. The run command will create all of the tables from scratch and the db:seed command will generate the records that we defined above.

To check that it worked head into Sequel Pro and we’ll see five users and five tasks that have a user id of one and other various values.

## Rendering our seeded data to the screen

### Define route resource 

So now we've got a web server running and records in the database but it doesn't do us much good unless we can rendor this information to a webpage. In order to do that we're going to need to define some routes and controllers.

Adonis, similar to other MVC frameworks, has the concept of [resourceful routes](https://adonisjs.com/docs/3.2/routing#_resourceful_routes). It is common to need to create, list, show, update and delete a record and can be cumbersome to define all of these actions separetly. By embracing convention over configuration we can define all of these actions within one line in the **app/Http/routes.js** file:

```
Route.resource('tasks', 'TaskController')
```

After adding this line, run `./ace route:list` from the command line and we'll see all the routes defined for our application:

```
┌────────┬───────────┬─────────────────┬────────────────────────┬─────────────┬───────────────┐
│ Domain │ Method    │ URI             │ Action                 │ Middlewares │ Name          │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ GET|HEAD  │ /               │ Closure                │             │ /             │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ GET|HEAD  │ /tasks          │ TaskController.index   │             │ tasks.index   │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ GET|HEAD  │ /tasks/create   │ TaskController.create  │             │ tasks.create  │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ POST      │ /tasks          │ TaskController.store   │             │ tasks.store   │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ GET|HEAD  │ /tasks/:id      │ TaskController.show    │             │ tasks.show    │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ GET|HEAD  │ /tasks/:id/edit │ TaskController.edit    │             │ tasks.edit    │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ PUT|PATCH │ /tasks/:id      │ TaskController.update  │             │ tasks.update  │
├────────┼───────────┼─────────────────┼────────────────────────┼─────────────┼───────────────┤
│        │ DELETE    │ /tasks/:id      │ TaskController.destroy │             │ tasks.destroy │
└────────┴───────────┴─────────────────┴────────────────────────┴─────────────┴───────────────┘
```

### Define controller 

Now our route endpoints are defined, but if we fire up the dev server and head to `localhost:3333/tasks` we see an error that "Cannot find module TaskController". To create a task controller run:

```
$ ./ace make:controller Task --resource 
```

This command generates a file in **app/Http/Controllers/TaskController.js** that stubs out the various methods we defined above. The methods will be blank after we generate the command. Take the liberty of filling them out. We're going to use [Lucid](https://adonisjs.com/docs/3.2/lucid) which is Adonis' implementation of ActiveRecord. Essentially it is an ORM so we don't have to write raw SQL queries to fetch our data. 

```
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
```

## Authentication continued
Make an auth controller:

```
$ ./ace make:controller Auth 
```

Thank you to [Auth0 post](https://auth0.com/blog/creating-your-first-app-with-adonisj-and-adding-authentication/) covering the topic
 
 
 
