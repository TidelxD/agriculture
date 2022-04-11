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
   let sql = "CREATE TABLE IF NOT EXISTS sensors (id int AUTO_INCREMENT, temperature float, humidity float,soilmoaster float,windSpeed float ,timestamp VARCHAR(255), PRIMARY KEY(id))";
   db.query(sql,(err,result)=>{
    if(err) throw err;
    console.log("result");
    res.send("Table Created ! ");
  });
 });
 
 // Add Row 
 app.get("/addrow/:temperature/:humidity/:soilmoaster/:windSpeed",(req,res)=>{
  let sql = "INSERT INTO sensors (temperature, humidity, timestamp,soilmoaster,windSpeed ) VALUES (?,?,?,?,?)";
  var values = [req.params.temperature,req.params.humidity,"04-09-2022 13:51",req.params.soilmoaster,req.params.windSpeed];

  db.query(sql,values,(err,result)=>{
    if(err) throw err;
    console.log("inserted");
    res.send(values);
  })
 });

 // Get ALL Data 
 app.get("/getAllData",(req,res)=>{
  let sql ="SELECT * FROM sensors";
   let query = db.query(sql,(err,result)=>{
     if(err) throw err;
     console.log("All Data Fetched ! ");
     var sum = 0;
    var resultArray = [];
        for(var i in result) {
          if(result.hasOwnProperty(i)){
            resultArray.push(result[i]);
            sum+=result[i]['temperature']
            console.log("temperature: "+sum);
          }
          
        } 
       console.log( "\n temperature moy: "+sum/resultArray.length) 
     res.send(result);
   });

 });


 app.get("/temp_moy",(req,res)=>{
    let sql ="SELECT sum(temperature)/count(*) FROM sensors ";

       db.query(sql,(err,result)=>{
          if(err) throw err;
           console.log("Result is: "+result[0]['sum(temperature)/count(*)']);
           res.send("result is: "+result[0]['sum(temperature)/count(*)']);
       });  

 });
 app.get("/getLastData",(req,res)=>{
  let sql ="SELECT * FROM sensors ORDER BY DESC limit 1 ";

     db.query(sql,(err,result)=>{
        if(err) throw err;
         console.log("Result is: "+result[0]['sum(temperature)/count(*)']);
         res.send("result is: "+result[0]['sum(temperature)/count(*)']);
     });  

});




  app.listen(3000,()=> console.log("app working on 3000 ... "));

