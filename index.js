var express = require('express');
var things = require('./things.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var mongoose = require('mongoose');

// connecting db
mongoose.connect('mongodb://localhost/my_db');
var app = express();

app.set('view engine', 'pug');
app.set('views','./views');


// defining schema
var personSchema = mongoose.Schema({
   name: String,
   age: Number,
   nationality: String
});
var Person = mongoose.model("Person", personSchema)

// example of using external routes
app.use('/things', things);

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

// example of a middleware function
app.use(function(req, res, next){
   console.log("A new request received at " + Date.now());
   next();
});



app.listen(3000);