var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');

var UserModel = require('./db')

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false
}));

// just to handle post message parsing
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/my_database';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/login', function(req, res){
  if(req.session.userId) return res.redirect("/");
  res.sendFile(__dirname + "/login.html");
});

app.get('/register', function(req, res){
  if(req.session.userId) return res.redirect("/");
  res.sendFile(__dirname + "/register.html");
});

app.post('/register', (req, res, next)  => {
  if(req.body.email && req.body.pwd){
    var userData = {
      email: req.body.email,
      password: req.body.pwd
    }

    UserModel.create(userData, function (error, user) {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        console.log("register ok, set session id");
        req.session.userId = user._id;
        return res.redirect("/register");
      }
    });
  } else res.redirect("/register");
});

app.post('/login', (req, res, next)  => {
  if(req.body.email && req.body.pwd){

    UserModel.authenticate(req.body.email, req.body.pwd, function (error, user) {
      if (error || !user) {
        console.log(error);
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/');
      }
    });
    }
    else res.redirect("/login");
});

app.get('/', 
(req, res) =>{
  if(!req.session.userId) res.redirect("/login");
  else res.sendFile(__dirname + "/index.html");
});

app.get('/logout', 
(req, res) =>{
  delete req.session.userId
  res.redirect("/login");
});

io.on('connection', function(socket){
  socket.on('data', function(msg){
    socket.broadcast.emit('browser-data', msg);
  });
});

http.listen(3010, function(){
  console.log('listening on *:3010');
});
