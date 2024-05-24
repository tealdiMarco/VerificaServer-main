const jwt = require("jsonwebtoken");
const fs = require("fs");

let tokenAdministration = function (){
    this.payload = "";
    this.token = "";
    this.valoreCookie = "";
    this.privateKey = fs.readFileSync("keys/private.key","UTF8");
}

tokenAdministration.prototype.createToken = function (user){
    this.token = jwt.sign({
        _id:user._id,
        user:user.username,
        mail:user.email,
        nat:user.nat,
        exp:Math.floor(Date.now()/1000 + 10)
        },
        this.privateKey);
    console.log("Token creato correttamente: " + this.token);
}

tokenAdministration.prototype.ctrlTokenLocalStorage = function (req,callback){
    const token = req.headers["token"];
    console.log(token);
    if(token != "null"){
        jwt.verify(token, this.privateKey, function (err,data){
            // console.log(data);   // data è il payload del token
            if(!err)
                this.payload = data;
            else
                this.payload = {err_exp:true, message: "Token scaduto o corrotto"};
            callback(this.payload);
        });
    }else{
        this.payload = {err_exp:true, message: "Token inesistente"};
        callback(this.payload);
    }
}

tokenAdministration.prototype.ctrlToken = function (req,callback){
    this.payload="";
    this.token=readCookie(req,"token");
    let errToken = {codeErr:-1,message:""};
    if(this.token=="")   // accesso non eseguito, token inesistente
        errToken = {codeErr:403,message:"Token inesistente"};
    else{
        try{
            this.payload=jwt.verify(this.token,this.privateKey);
            console.log("Token OK!");
        }catch(err) {
            errToken = {codeErr: 403, message: "Token scaduto o corrotto"};
        }
    }
    callback(errToken);
}

tokenAdministration.prototype.readCookie = function (req,name){
    this.valoreCookie="";
    if(req.headers.cookie){
        let cookies=req.headers.cookie.split("; ");
        console.log(cookies);
        for(let i=0;i<cookies.length;i++){
            cookies[i]=cookies[i].split("=");
            if(cookies[i][0]==name){
                this.valoreCookie=cookies[i][1];
                console.log(this.valoreCookie);
                break;
            }
        }
    }
    return this.valoreCookie;
}

module.exports = new tokenAdministration();