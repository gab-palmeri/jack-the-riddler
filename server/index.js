'use strict';

const express = require('express');

//useful for passport setup
const userDao = require('./daos/userDao');
const UserService = require('./services/UserService');
const usInstance = new UserService(userDao);

//routers for the http requests
const UserRouter = require('./routers/UserRouter');
const RiddleRouter = require('./routers/RiddleRouter');

//useful packages
const passport = require("passport");
const LocalStrategy = require('passport-local');
const morgan = require('morgan');
const session = require('express-session');

class Server {

	#app;
	#port;

	constructor() {
        
		this.#app = new express();
		this.#port = 3001;

		this.passportSetup();
		this.middlewareSetup();
		this.routesSetup();
		
    }

	passportSetup() {

		//passport configuration
		passport.use(new LocalStrategy(
			function(email, password, done) {
				usInstance.authenticateUser(email, password).then((user) => {

					if (!user)
					return done(null, false, { message: 'Incorrect email and/or password.' });
					
					return done(null, user);
				})
			}
		));
			
		//Serialize user, including his ID
		passport.serializeUser((user, done) => {
			done(null, user.id);
		});

		//Deserialize user, obtaining his infos
		passport.deserializeUser((id, done) => {
			userDao.getUserById(id).then(user => done(null, user)).catch(err => done(err, null));
		});

	}

	middlewareSetup() {
		const cors = require("cors");
		const corsOptions = {
			origin: 'http://localhost:3000',
			credentials: true
		}

		//middleware setup
		this.#app.use(express.json());
		this.#app.use(morgan('dev'));
		this.#app.use(cors(corsOptions));

		this.#app.use(session({
			secret: 'the riddle secret',
			resave: false,
			saveUninitialized: false 
			}));

		this.#app.use(passport.initialize());
		this.#app.use(passport.session());

	}

	routesSetup() {

		const userRouter = new UserRouter();
		this.#app.use('/api/user', userRouter.getRouter());

		const riddleRouter = new RiddleRouter();
		this.#app.use('/api/riddle', riddleRouter.getRouter());
	}

	startServer() {
		this.#app.listen(this.#port, () => {

			console.log(`Server listening at http://localhost:${this.#port}`);
		});
	}


}


const server = new Server();
server.startServer();