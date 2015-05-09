// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var socket   = require('socket.io');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch', cookie: { maxAge: 600000} })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
	app.use(express.static('public/'));
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
//app.listen(port);


function sendMessage(message, socket, elementID, webState,callback){
    exec.execFile('../remote',
                ['-m', message],
                function (error, stdout, stderr) {
                    console.log("The message is: " + message);
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if( stdout.indexOf("RECIVED:") > -1 && callback == true){
                        var state = stdout.split('RECIVED: ')[1].split('.')[0];
                        console.log("Sending Message Back To Client");
                        socket.emit(
                            "callbackButton",
                            {
                                webstate: webState,
                                message: "received",
                                operation: message,
                                state: state,
                                switchID: elementID

                            });
                    }

                    else if(stdout.indexOf("NO REPLY") > -1 && callback == true) {
                        console.log('NO REPLY' + elementID + ' ' + webState);
                    
                        socket.emit(
                            "failed", 
                            {   
                                webstate: webState,
                                switchID: elementID
                            });
                    
                    }

                    if (error !== null && callback == true) {
                        console.log('exec error: ' + error );
                    
                        socket.emit(
                            "callbackError", 
                            {
                                webstate: webState,
                                error: error,
                                switchID: elementID

                            });
                    
                    }

                    
                });
}




server = app.listen(port);
io = socket.listen(server);


//var io = socket.listen(app.listen(port));
io.sockets.on('connection', function (socket) {
    socket.on('send', function (data) {

        sendMessage(data.message, socket, data.switchID, data.webstate, true);

    });
});
console.log('The magic happens on port ' + port);
