var express = require("express");
var https = require("https");
var fs = require("fs");

var fileKey = fs.readFileSync("Key/privateKey.pem");
var fileCert = fs.readFileSync("Key/certificate.pem");



let bodyParser = require("body-parser");
let cors = require("cors");
let mongoFunctions = require("./mongoFunctions");
let tokenAdministration = require("./tokenAdministration");
let bcrypt = require("bcrypt");


var app = express();
let port = 6969;

//HTTPS -> DATI CRIPTATI & CARTIFICA IL SITO

//Login sicuro -> quando invio password la invio criptata per 2 motivi (cripto password per privacy, evito intercettazioni )
// no sql injection3

var httpsServer = https.createServer({"key":fileKey,"cert":fileCert},app)

httpsServer.listen(port,()=>{
    console.log(`# Server Avviato in https://localhost:${port}`);
});

// Intercetta parametri passati in formato url-encoded
app.use(bodyParser.urlencoded({extended:true}));
// Intercetta parametri passati in formato json
app.use(bodyParser.json());
app.use(cors());

app.use(function (req,res,next){
    let d=new Date();
    console.log(d.toLocaleTimeString() + " >>> " + req.method + ": " + req.originalUrl);
    if(Object.keys(req.query).length != 0)
        console.log("Parametri GET: " + JSON.stringify(req.query));
    if(Object.keys(req.body).length != 0)
        console.log("Parametri POST: " + JSON.stringify(req.body));
    next();
});

app.get("/",function (req,res){
    res.send("Server funzionante"); 
});

app.post("/api/login",function (req,res){
    let query = {username:req.body.username};
    mongoFunctions.find("people","people",query,function (err,data){
        if(err.codeErr == -1){
            if(data.length == 0)
                error(req,res,{codeErr:401,message:"Errore login. Username inesistente!"});
            else{
                if(bcrypt.compareSync(req.body.password,data[0].password)){
                    tokenAdministration.createToken(data[0]);
                    res.send({msg:"Login OK",token:tokenAdministration.token});
                }else
                    error(req,res,{codeErr:401,message:"Errore login. Password errata!"});
            }
        }else
            error(req,res,err);
    });
});

app.post("/api/loginCookie",function (req,res){
    let query = {user:req.body.username};
    mongoFunctions.findLogin(req,"studenti","users",query,function (err,data){
        if(err.codeErr == -1){
            console.log("Login OK");
            console.log(data);
            tokenAdministration.createToken(data);
            res.cookie("token",tokenAdministration.token,{maxAge:90000000,secure:true,httpOnly:true});
            res.send({msg:"Login OK"});
        }else
            error(req,res,err);
    });
});

app.get("/api/getStudents",function (req,res){
    tokenAdministration.ctrlTokenLocalStorage(req, payload => {
        console.log(payload);
        if(!payload.err_exp){   // token ok
            mongoFunctions.find("studenti","studenti",{},function (err,data){
                if(err.codeErr == -1){
                    tokenAdministration.createToken(payload);
                    res.send({data:data,token:tokenAdministration.token});
                }else
                    error(req,res,err);
            });
        }else{
            console.log(payload.message);
            error(req,res,{codeErr:403,message:payload.message});
        }
    });
});

app.get("/api/getStudentsCookie",function (req,res){
    tokenAdministration.ctrlToken(req, (errToken) => {
        if(errToken.codeErr==-1){   // token ok
            mongoFunctions.find("studenti","studenti",{},function (err,data){
                if(err.codeErr == -1){
                    tokenAdministration.createToken(tokenAdministration.payload);
                    res.cookie("token",tokenAdministration.token,{maxAge:90000000,secure:true,httpOnly:true});
                    res.send({data:data});
                }else
                    error(req,res,err);
            });
        }else{
            error(req,res,errToken);
        }
    });
});

app.post("/api/register",function (req,res){
    bcrypt.hash(req.body.pwd,10,function (err,hash){
        if(err){
            console.log(err);
            res.status(500).send("Errore durante la codifica della password");
        }else{
            let query = {mail:req.body.mail,pwd:hash};
            mongoFunctions.inserisci("studenti","users",query,function (err,data){
                if(err.codeErr == -1){
                    console.log("Registrazione OK");
                    console.log(data);
                    tokenAdministration.createToken(data);
                    res.send({msg:"Registrazione OK",token:tokenAdministration.token});
                }else
                    error(req,res,err);
            });
        }
    });
});

function error(req,res,err){
    res.status(err.codeErr).send(err.message);
}