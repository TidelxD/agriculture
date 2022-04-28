const express= require('express');
const mysql = require('mysql');

const login = require('./logger/logging')
const { checkToken } = require('./auth/token_validation')

const app = express();

// method for JWT 
const { sign } = require('jsonwebtoken');

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

 // Create sensors Table 
 app.get("/createposttable",(req,res)=>{
   let sql = "CREATE TABLE IF NOT EXISTS sensors (id int AUTO_INCREMENT, temperature float, humidity float,soilmoaster float,windSpeed float , x float, y float , timestamp VARCHAR(255), PRIMARY KEY(`id`,`timestamp`) )";
   db.query(sql,(err,result)=>{
    if(err) throw err;
    console.log("result");
    res.send("Table sensors Created ! ");
  });
 });
 // Create actutors Table 
 app.get("/createacttable",(req,res)=>{
  let sql = "CREATE TABLE IF NOT EXISTS actutors (id int AUTO_INCREMENT, type int, x float,y float,state float,timestamp VARCHAR(255), PRIMARY KEY(id))";
  db.query(sql,(err,result)=>{
   if(err) throw err;
   console.log("result");
   res.send("Table actutors Created ! ");
 });
});

 // ********************************** Creating ending ************************** // 
 
 // Add Row in sensors 
 app.get("/addSensorsrow/:temperature/:humidity/:soilmoaster/:windSpeed/:x/:y",checkToken,(req,res)=>{
  let sql = "INSERT INTO sensors (temperature, humidity, timestamp,soilmoaster,windSpeed,x,y ) VALUES (?,?,?,?,?,?,?)";
  var values = [req.params.temperature,req.params.humidity,"04-09-2022 13:51",req.params.soilmoaster,req.params.windSpeed,req.params.x,req.params.y];

  db.query(sql,values,(err,result)=>{
    if(err) throw err;
    console.log("inserted");
    res.send(values);
  })
 });



 // Get ALL Data from sensors
/* app.get("/getAllData",checkToken,(req,res)=>{
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

 });*/

// Calculate temperature moyen
 app.get("/temp_moy",checkToken,(req,res)=>{
    let sql ="SELECT sum(temperature)/count(*) FROM sensors ";

       db.query(sql,(err,result)=>{
          if(err) throw err;
           console.log("Result is: "+result[0]['sum(temperature)/count(*)']);
           res.send("result is: "+result[0]['sum(temperature)/count(*)']);
       });  

 });

 // Getting last Data
 app.get("/getLastDataSensors",checkToken,(req,res)=>{
  let sql ="SELECT * FROM sensors ORDER BY id DESC LIMIT 1";

     db.query(sql,(err,result)=>{
        if(err) throw err;
         console.log("Result is: "+result[0]);
         res.send(result);
     });  

});

/******************************************* ACTUTORS ******************************************************** */

 // Add Row in actutors
 app.get("/addActutorsrow/:type/:x/:y/:state",checkToken,(req,res)=>{
  let sql = "INSERT INTO actutors (type, x, y,state,timestamp) VALUES (?,?,?,?,?)";
  var values = [req.params.type,req.params.x,req.params.y,req.params.state,Date.now()];

  db.query(sql,values,(err,result)=>{
    if(err) throw err;
    console.log("inserted");
    res.send(values);
  });
 });


 // Getting Data for spesific actutor
 app.get("/getSpecActutors/:id",checkToken,(req,res)=>{
  let sql ="SELECT * FROM actutors WHERE id ="+req.params.id;

     db.query(sql,(err,result)=>{
        if(err) throw err;
         console.log("id is: "+req.params.id);
         res.send(result[0]);
     });  

}); 

// Update Actutor State with insert query
app.get("/UpdateStateIns/:id/:type/:x/:y/:state",checkToken,(req,res)=>{
  let sql = "INSERT INTO actutors (id,type, x, y,state) VALUES (?,?,?,?,?)";
  var values = [req.params.id,req.params.type,req.params.x,req.params.y,req.params.state];

  db.query(sql,values,(err,result)=>{
    if(err) throw err;
    console.log("inserted");
    res.send(values);
  });

});



// Update Actutor State with insert query 
app.get("/UpdateState/:id/:state",checkToken,(req,res)=>{
  let sql = "UPDATE users SET state="+req.params.state+" WHERE id="+req.params.id;
  db.query(sql,(err,result)=>{
   if(err) throw err;
    console.log("update id is: "+req.params.id);
    res.send(result);
});  


});



// *********************************************** USERS **************************************************//

 // method for crypt and compare the passwords

const { hashSync, genSaltSync, compareSync } = require("bcrypt");
 // Create User 
 app.get("/creatuser/:username/:password",(req,res)=>{
  
  let sql = "INSERT INTO users (username, password) VALUES (?,?)";
  const salt =  genSaltSync(10);
  req.params.password = hashSync(req.params.password,salt);
  var values = [req.params.username,req.params.password];
  
  db.query("SELECT * FROM users WHERE username ="+req.params.username,(err,result)=>{
    if(err) throw err;
    if(result){
        return res.json({
          success: 0,
          data: "this username already used by another account !"
        });

    }
    db.query(sql,values,(err,result)=>{
      if(err) throw err;
      console.log("inserted");
      res.send(result);
    });
   
  });
  
 });

 // Get User by username
 app.get("/login/:username/:password",(req,res)=>{

  let sql ="SELECT * FROM users WHERE username ="+req.params.username;
  
  db.query(sql,(err,result)=>{

    if(err) throw err; 

    if (!result[0]) {
      return res.json({
        success: 0,
        message: "Invalid email or password"
      });
    }
   

   const results = compareSync(req.params.password, result[0].password);
    if(results){
       result.password = undefined;
      const jsontoken = sign({ results: result }, "qwe1234"); 
      return res.json({
        success: 1,
        message: "login successfully",
        token : jsontoken,
        username : req.params.username
      });

    }else {
      return res.json({
        success: 0,
        message: "Invalid email or password"
      });
    } 
    
   
  });
  
 });



  app.listen(3000,()=> console.log("app working on 3000 ... "));



