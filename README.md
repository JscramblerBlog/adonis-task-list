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

Adonis.js is an MVC framework for Node.js. It is actively built and maintained. The 4.0 release is fast approaching but in this tutorial we will build with the latest stable version 3.0.
 
In this tutorial we’re going to build a task application where guests can view all tasks and click in to view an individual task. We will add authentication functionality using Adonis' built in tools and design patterns. After adding authentication users will be able to register with their email and password, logout and create new tasks.

Adonis has built in connections for many SQL databases including Postgres and SQLite. In this tutorial we will store our tasks, users and sessions in MySQL on our local machines. Adonis borrows heavily from the Laravel PHP framework and borrows concepts from Ruby On Rails. If you are familiar with either of these tools and/or know Node.js ES6 features Adonis will be a breeze to learn!

If you are new to ES6 or MVC frameworks that is okay. We'll take this one step at a time.

> tl;dr - Source code is [on github](https://github.com/connor11528/adonis-task-list)
 
## Installation and application setup
 
![](https://s16.postimg.org/aaoetxi7p/install_cli.gif)
 
Adonis.js comes with a command line interface (CLI) for scaffolding new projects. We're going to install the Adonis CLI, create a new project and install the projects with npm. If you do not have Node.js installed on your machine go do that. Node.js is a prerequisite for this tutorial.
 
```
$ npm i -g adonis-cli
$ adonis new adonis-task-list
$ cd adonis-task-list
$ npm i 
$ npm run serve:dev
```
 
These commands add the `adonis` command to your terminal that can generate new Adonis applications. There is a `serve:dev` command in the project's **package.json** file that starts a web server on `http://localhost:3333`. When we run these commands we will see the Adonis.js welcome page at that address:
 
![](https://i.imgur.com/yzT8s50.png)

The home (`/`) route is defined in **app/Http/routes.js**:

```
const Route = use('Route')

Route.on('/').render('welcome')
```

This call renders the welcome page that is defined in **resources/views/welcome.njk**. Adonis by default uses the [Nunjucks](https://mozilla.github.io/nunjucks/) library from Mozilla for HTML templating and stores the web application's views in the **resources/views** directory. 

I encourage you to check out the [official documentation](https://adonisjs.com/docs/3.2/directory-structure) on Adonis application structure. The general layout is as follows:

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

We're not going to cover what ever single file and folder does in this code but at a high level this is what you need to know about the Adonis app structure:

The **app** folder holds our [Controllers](http://adonisjs.com/docs/3.2/controllers), [Models](http://adonisjs.com/docs/3.2/lucid), [Middleware](http://adonisjs.com/docs/3.2/middleware) and [Routes](http://adonisjs.com/docs/3.2/routing).

The **config** folder combined with the **.env** file is where we define our configuration for connecting to the database and our methods of authentication.

The **database** holds the orders for setting up our database, called [Migrations](http://adonisjs.com/docs/3.2/migrations). Additionally, this folder holds instructions for seeding the database with initial data using [Model Factories](http://adonisjs.com/docs/3.2/seeds-and-factories#_about_factories)

The **resources** folder holds our Nunjucks templates and layouts for the content that renders to the browser.

## Initial templating

Now that we've generated our application, we can update the welcome page template:

**resources/views/welcome.njk**

```
{% extends 'master' %}

{% block content %}
  <section class="hero">
  <div class="hero-body">
    <div class="container">
      <h1 class="title">
        Welcome to the website
      </h1>
      <h2 class="subtitle">
        A solution for creating tasks, built with Adonis.js
      </h2>
    </div>
  </div>
</section>
{% endblock %}
```

On the first line of welcome.njk we're making a call that this file extends a master file. We've made some updates to the welcome file but we'd also like to add a navbar and the [Bulma](https://bulma.io/) CSS library for our views. Head into the master.njk file to make some changes

**resources/views/master.njk**

```
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

  <title>Task List - Adonis.js</title>

  <link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:400,200,300,600,700,900' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.0/css/bulma.css">
  <link rel="icon" href="/assets/favicon.png" type="image/x-icon">
  <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
  <div class='container'>
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class='navbar-item' href='/'>Task Listr</a>
      </div>
      <div class='navbar-menu'>
        <div class='navbar-start'>
          <a class='navbar-item' href='/tasks'>Tasks</a>
          
          {% if currentUser %}
            <a class='navbar-item' href='/tasks/create'>Create task</a>
          {% endif %}
        </div>
        <div class='navbar-end'>
          {% if not currentUser %}
            <a class='navbar-item' href='/login'>Login</a>
            <a class='navbar-item' href='/register'>Register</a>
          {% else %}
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                {{ currentUser.username }}
              </a>
              <div class="navbar-dropdown">
                <a class="navbar-item" href='/logout'>
                  Logout
                </a>
              </div>
            </div>
          {% endif %}
        </div>
      </div>
    </nav>

    <main>
      {% block content %}{% endblock %}
    </main>
  </div>

</body>
</html>
```

How our application works so far is that we hit the home route which makes a call to render the welcome view. The welcome view extends the master layout so the full page renders. There is quite a bit going on in the above master file so let's break it down:

- `{% block content %}{% endblock %}`: This line denotes where views will render. Our welcome view calls the master template and renders its content in this section within the `<main>` html tags. When we route to new templates that extend the master layout this section will be updated though the rest of the page, such as the head and navbar will stay the same.

- `{% if not currentUser %}`: currentUser is a [session based helper](http://adonisjs.com/docs/3.2/authentication#_session_based) for checking whether there is a user logged in and who they are. 

- `class="navbar-item has-dropdown is-hoverable"`: These are Bulma specific styles for creating a navbar with hoverable dropdown functionality. You can view the Bulma nav docs [here](https://bulma.io/documentation/components/navbar/#transparent-navbar).

## Create a local database

Before we get any further we need to set up a database for storing tasks and users. We will define a Task database model that will correspond to a MySQL table. You will need to have MySQL set up on your local machine. 

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

Next up, install the [mysql npm package](https://github.com/mysqljs/mysql): `npm i --save mysql`

We've done some generic setup to connect our Adonis app to MySQL. Every Adonis application ships with an interactive shell command lin tool called [Ace](http://adonisjs.com/docs/3.2/interactive-shell). We can use ace to generate models, migrations, controllers and more. For a full list of the available commands check out `./ace --help`.

We're going to use Ace to generate a task model and a migration file. These commands will specify our database columns and data instance behaviors. Adonis ships with a powerful ORM called [Lucid](http://adonisjs.com/docs/3.2/lucid) to help model our data. The advantage of this approach is that we can write Javascript that translates into database queries instead of setting up everything using SQL.

```
$ ./ace make:model Task
create: app/Model/Task.js
$ ./ace make:migration tasks --create=tasks
create: database/migrations/1509056291034_tasks.js
$ ./ace migration:run
✔ Database migrated successfully in 737 ms
```

If we view the database you created with a MySQL tool such as [Sequel Pro](https://www.sequelpro.com/) we can see that the database includes a table called tasks that includes columns for `id`, `created_at` and `updated_at`. These fields are defined in the migration file we created. In our application we’d like tasks to have a title and a description. Additionally, a particular task will belong to a user. So we’ll add that field now and set up the rest of the user logic in one moment.

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
```

This task controller contains all the logic for creating, reading and deleting tasks. We also include some logic for access control using authorization. For instance, we only want authenticated users to be able to create tasks. We ran some commands that generated a user model and authentication logic but we have not fully set it up. We'll do that in the next section.

## Authentication continued

> Please note that there is an [Adonis blueprint](https://github.com/RomainLanz/adonis-starter) that sets up authentication scaffolding out of the box. 

> Additionally, Prosper's [Auth0 blog post](https://auth0.com/blog/creating-your-first-app-with-adonisj-and-adding-authentication/) covers more details on Adonis authentication

First, let's define some routes for registering, logging in, showing the forms and logging out:

```
Route.get('/login', 'AuthController.showLogin')
Route.post('/login', 'AuthController.login')

Route.get('/register', 'AuthController.showRegister')
Route.post('register', 'AuthController.register')

Route.get('/logout', 'AuthController.logout')
```

Next we need to set up a controller to handle these routes:

```
$ ./ace make:controller Auth 
```

Then we need to define the controller to render views and take datbase actions:

```
'use strict'

const User = use('App/Model/User')
const Hash = use('Hash')

class AuthController {

  * showLogin(request, response) {
    yield response.sendView('auth.login')
  }

  * login(request, response) {
    const email = request.input('email')
        const password = request.input('password')

        const attemptUser = yield User.findByOrFail('email', email)

        // Attempt to login with email and password
        const authCheck = yield request.auth.login(attemptUser)
        if (authCheck) {
            return response.redirect('/')
        }

        yield response.sendView('auth.login')
  }

  * showRegister(request, response) {
    yield response.sendView('auth.register')
  }

  * register(request, response) {
    const user = new User()
        user.username = request.input('username')
        user.email = request.input('email')
        user.password = yield Hash.make(request.input('password'))

        yield user.save()

        yield response.sendView('auth.register')
    
  }

    * logout(request, response) {
        yield request.auth.logout()

        return response.redirect('/')
    }
}

module.exports = AuthController
```

Now we can define the views for registering and loging in users:

**resources/views/auth/login.njk**

```
{% extends 'master' %}

{% block content %}
  <h1>Login</h1>

    <form method="POST" action="/login">

      {{ csrfField }}


      <input type='email' placeholder='Email' name='email' class='input'>

      <input type='password' placeholder='Password' name='password' class='input'>

      {% if error %}
      <div class="notification is-danger">
      {{ error }}
    </div>
    {% endif %}

      <input type='submit' value='Submit'>

  </form>
{% endblock %}
```

**resources/views/auth/register.njk**

```
{% extends 'master' %}

{% block content %}
  <h1>Register</h1>

  <form method="POST" action="/register">

    {{ csrfField }}
    <input type='text' placeholder='Username' name='username' class='input'>

    <input type='email' placeholder='Email' name='email' class='input'>

    <input type='password' placeholder='Password' name='password' class='input'>

    <input type='submit' value='Submit'>

  </form>
{% endblock %}
```
 
## Task views 

Now that we have all of our routes, controllers and authentication set up we can add the views for showcasing tasks:

**resources/views/tasks/create.njk**

```
{% extends 'master' %}

{% block content %}
  <div class="content">
    <h1>Create task</h1>

    <form method='POST' action='/tasks'>
      {{ csrfField }}
      <input type='text' name='title' placeholder='Title of task' class='input'>

      <textarea name='description' placeholder='Description of task' class='input'></textarea>

      <input type='submit' value='Submit'>
    </form>

  </div>
{% endblock %}
```

**resources/views/tasks/index.njk**

```
{% extends 'master' %}

{% block content %}
  <div>
    <h1 class='title'>Tasks</h1>

    {% for task in tasks %} 
      <div class="content">
        <h2>
          {{ linkTo('tasks.show', task.title, { id: task.id }, '_blank') }}
        </h2> 
        <p> {{ task.description }} </p>
      </div>
    {% endfor %}
  </div>
{% endblock %}
```

**resources/views/tasks/show.njk**

```
{% extends 'master' %}

{% block content %}
  <div class="content">
    <h1>{{ task.title }}</h1>

    <p> {{ task.description }} </p>

    <p>task created by: <b>{{ owner.username }}</b></p>
  </div>
{% endblock %}
```

## Conclusion 

In this tutorial we've set up a Node.js server that talks to a MySQL database. We can create, delete and showcase tasks. Additionally, we can register and authorize users and define access control based on the current user's authentication status.

Adonis.js is a powerful framework for building Node.js applications. While it is not as popular as other Node.js web servers like Koa and Express, Adonis provides more power within the confines of an opinionated tech stack. Check out the [source code](https://github.com/connor11528/adonis-task-list) on github and definitely consider Adonis for future Node projects!

 
