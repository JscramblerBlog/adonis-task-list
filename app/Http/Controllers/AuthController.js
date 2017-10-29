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

        const loginMessage = {
            success: 'Logged-in Successfully!',
            error: 'Invalid Credentials'
        }

        const attemptUser = yield User.find({email})

        // Attempt to login with email and password
        const authCheck = yield request.auth.login(attemptUser)
        if (authCheck) {
            return response.redirect('/')
        }

        yield response.sendView('auth.login', { error: loginMessage.error })
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

        var registerMessage = {
            success: 'Registration Successful! Now go ahead and login'
        }

        yield response.sendView('auth.register', { registerMessage : registerMessage })
		
	}

    * logout(request, response) {
        yield request.auth.logout()

        return response.redirect('/')
    }
}

module.exports = AuthController
