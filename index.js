var express = require('express');
var things = require('./things.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var movies = require('./movies.js');

// connecting db
mongoose.connect('mongodb://localhost/my_db');
var app = express();

app.set('view engine', 'pug');
app.set('views','./views');

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

// defining schema
var personSchema = mongoose.Schema({
   name: String,
   age: Number,
   nationality: String
});
var Person = mongoose.model("Person", personSchema)

app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }
});

// example of using external routes
app.use('/things', things);

//Use the Router on the sub route /movies
app.use('/movies', movies);


// example of a simple get request
app.get('/hello', function(req, res){
   res.send("Hello World!");
});

// example of using a pug view
app.get('/first_template', function(req, res){
   res.render('first_view');
});

// example of using a dynamic pug view
app.get('/dynamic_view', function(req, res){
   res.render('dynamic', {
      name: "TutorialsPoint", 
      url:"http://www.tutorialspoint.com"
   });
});

// example of using a post request
app.post('/hello', function(req, res){
   res.send("You just called the post method at '/hello'!\n");
});

// example of a composed pug view
app.get('/components', function(req, res){
    res.render('content');
});

// for parsing post url payload
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// for handling uploads
app.use(upload.array()); 
app.use(express.static('public'));

// simple form
app.get('/forms', function(req, res){
   res.render('form');
});

// processing  a simple form
app.post('/forms', function(req, res){
   console.log(req.body);
   res.send("recieved your request!");
});

app.get('/person', function(req, res){
   res.render('person');
});

// storing into database
app.post('/person', function(req, res){
   var personInfo = req.body; //Get the parsed information
   console.log(personInfo);

   if(!personInfo.name || !personInfo.age || !personInfo.nationality){
      res.render('show_message', {
         message: "Sorry, you provided worng info", type: "error"});
   } else {
      var newPerson = new Person({
         name: personInfo.name,
         age: personInfo.age,
         nationality: personInfo.nationality
      });
		
      newPerson.save(function(err, Person){
         if(err)
            res.render('show_message', {message: "Database error", type: "error"});
         else
            res.render('show_message', {
               message: "New person added", type: "success", person: personInfo});
      });
   }
});

// data retreival
app.get('/people', function(req, res){
   Person.find(function(err, response){
      res.json(response);
   });
});	

var Users = [];

// simple authentication system
app.get('/signup', function(req, res){
   res.render('signup');
});

app.post('/signup', function(req, res){
   if(!req.body.id || !req.body.password){
      res.status("400");
      res.send("Invalid details!");
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id){
            res.render('signup', {
               message: "User Already Exists! Login or choose another user id"});
         }
      });
      var newUser = {id: req.body.id, password: req.body.password};
      Users.push(newUser);
      req.session.user = newUser;
      res.redirect('/protected_page');
   }
});
function checkSignIn(req, res, next){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
      var err = new Error("Not logged in!");
      console.log(req.session.user);
      next(err);  //Error, trying to access unauthorized page!
   }
}
app.get('/protected_page', checkSignIn, function (req, res){
   res.render('protected_page', {id: req.session.user.id})
});

app.get('/login', function(req, res){
   res.render('login');
});

app.post('/login', function(req, res){
   console.log(Users);
   if(!req.body.id || !req.body.password){
      res.render('login', {message: "Please enter both id and password"});
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id && user.password === req.body.password){
            req.session.user = user;
            res.redirect('/protected_page');
         }
      });
      res.render('login', {message: "Invalid credentials!"});
   }
});

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   res.redirect('/login');
});

app.use('/protected_page', function(err, req, res, next){
console.log(err);
   //User should be authenticated! Redirect him to log in.
   res.redirect('/login');
});



app.listen(3000);