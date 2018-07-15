const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
const con = require('./config/db');
var cors = require('cors');
var multer  = require('multer');
const passportSetup = require('./config/passport-setup');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({credentials: true, origin: 'http://localhost'}));
app.use(cookieSession({
maxAge:24*60*60*1000,
keys:['mysecret']
}));
app.use(passport.initialize());
app.use(passport.session());

//Passport Configuration




var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({storage: storage});

app.post('/upload',(req, res)=>{
res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  

  var upload = multer({
    storage: storage
  }).single("file")
  upload(req, res, function(err) {
    if(err){
      console.log(err);
    res.send(false);  
    }else{
      mime = req.file.mimetype;
      full_name = req.file.filename+"."+mime.slice(6, mime.length);
 let stmt = `INSERT INTO storage(name)
            VALUES(?)`;
let todo = [full_name];
 
// execute the insert statment
con.query(stmt, todo, (err, results, fields) => {
  if (err) {
    return console.error(err.message);
  }
  // get inserted id
  console.log('Todo Id:' + results.insertId);
});
    res.send(true);
    }
    
  });
   });

app.get('/', (req,res)=>{
res.send("hello work");
    
});

app.get('/google', passport.authenticate('google',{
    scope:['profile']
}));

app.get('/google/redirect',passport.authenticate('google'), (req, res) => {
// var encoded = req.cookies.session;
// var bytes = base64.decode(encoded);
// var text = utf8.decode(bytes);
// console.log(text);
//         console.log('Cookies2: ', req.cookies)
 res.redirect('http://localhost/meark_front/index.html#/dashboard');
   
});

app.get('/logout',(req, res)=>{
    req.logout();
    res.send(true);
});

app.get('/get_image',(req, res)=>{
let sql = `SELECT * FROM storage`;
con.query(sql, (error, results, fields) => {
  if (error) {
    return console.error(error.message);
  }
  console.log(results);
  res.send(results);
});
 

});

app.post('/insert_details',(req, res)=>{
  console.log(req.body);
   heading = req.body.filename;
   let stmt = `INSERT INTO storage(UID, name)
            VALUES(?,?,?)`;
let todo = [req.user.id, heading];
 // execute the insert statment
con.query(stmt, todo, (err, results, fields) => {
  if (err) {
    return console.error(err.message);
  }
  // get inserted id
  console.log('Todo Id:' + results.insertId);
  res.send(true);
});
});
app.listen(4000, () => console.log('listening to port'));
