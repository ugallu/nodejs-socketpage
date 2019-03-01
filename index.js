var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');

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


app.get('/', 
(req, res) =>{
  res.sendFile(__dirname + "/index.html");
});

app.get('/test', 
(req, res) =>{
  res.sendFile(__dirname + "/test.html");
});

io.on('connection', function(socket){
  socket.on('data', function(msg){
    console.log("Got data:" + msg);
    socket.broadcast.emit('browser-data', msg);
  });
});

http.listen(4444, function(){
  console.log('listening on *:4444');
});
