const express= require('express');
const mysql = require('mysql');

const login = require('./logger/logging')
const app = express();
app.use(express.json());
app.use(login );

// create connections ...
const db = mysql.createConnection({
  host :"localhost",
  user:"root",
  password:"",
  database:"agriculture"
});
// connect to database
 db.connect((err)=>{
   if(err){
     throw err;
   }
   console.log('Connection to DB done ! ');
 });

 // create DB 
 app.get('/createdb',(req,res)=>{
   let sql ="CREATE DATABASE agriculture";
   db.query(sql,(err,result)=>{
     if(err) throw err;
     console.log("result");
     res.send("Database Created ! ");
   });
 });

 // Create Table 
 app.get("/createposttable",(req,res)=>{
   let sql = "CREATE TABLE IF NOT EXISTS posts (id int AUTO_INCREMENT, temperature int, humidity int, timestamp VARCHAR(255), PRIMARY KEY(id))";
   db.query(sql,(err,result)=>{
    if(err) throw err;
    console.log("result");
    res.send("Table Created ! ");
  });
 });
 
 // Add Row 
 app.get("/addrow/:temperature/:humidity",(req,res)=>{
  let sql = "INSERT INTO posts (temperature, humidity, timestamp ) VALUES (?,?,?)";
  var values = [req.params.temperature,req.params.humidity,Date.now()];
  db.query(sql,values,(err,result)=>{
    if(err) throw err;
    console.log("inserted");
    res.send(values);
  })
 });

 // Get ALL Data 
 app.get("/getAllData",(req,res)=>{
  let sql ="SELECT * FROM posts";
   let query = db.query(sql,(err,result)=>{
     if(err) throw err;
     console.log("All Data Fetched ! \n"+result);
     res.send(result);
   });

 });




  app.listen(3000,()=> console.log("app working on 3000 ... "));

