var express = require("express");
var app = express();
var crypto = require("crypto");
var mongoose = require("mongoose")
var fs = require("fs");
var path = require('path');
var bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sessionIDs = [];

function connectToMongo() {
    mongoose.connect('mongodb://localhost/eventwhere');
    var UserSchema = mongoose.Schema({
        name: String,
        birthdate: Date,
        email: String,
        isAdmin: Boolean,
        isVIP: Boolean,
        passwordHash: String,
        salt: String,
        iterations: Number
    });
    var UserModel = mongoose.model('Userv1', UserSchema);

    var EventSchema = mongoose.Schema({
        name: String,
        dateBegin: Date,
        dateEnd: Date,
        useDateEnd: Boolean,
        picture: String,
        isPromoted: Boolean,
        latitude: Number,
        longitude: Number,
        location: String,
        host: Number 
    });
    var EventModel = mongoose.model("Eventv1", EventSchema);
}

function hashPassword(password) {
    var salt = crypto.randomBytes(128).toString('base64');
    var iterations = 10000;
    var hash = crypto.pbkdf2(password, salt, iterations);

    return {
        salt: salt,
        hash: hash,
        iterations: iterations
    };
}

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/html/index.html'))
})

app.post('/api/login', function(req, res){
    var data = req.body;
    var usr = UserModel.find({email: data['uc-email']});
    var pswdh = usr.passwordHash;
    var paswd = data['uc-password'];
    var sid = usr.email+"*"+crypto.randomBytes(128).toString('base64');
    if(pswdh == crypto.pbkdf2(paswd, usr.salt, urs.iterations)){
        sessions.push({sid: sid, time: Date.now, user: {email: usr.email, phash: usr.passwordHash}});
        res.json({status: 'succesfull', sid: sid});
    }else{
        res.json({status: 'failed'})
    }
});

app.post('/api/register', function(req, res){
    var bd = req.body;
    var hased = hashPassword(bd['uc-r-password']);
    var newUser = new UserModel({name: bd['uc-r-nick'], birthdate: bd['uc-r-birthdate'], email: bd['uc-r-email'], isAdmin: false, isVIP: false, passwordHash: hased.hash, salt:hased.salt, iterations: hased.iterations});
    newUser.save();
})

app.get('/api/createAdmins', function(req, res){
    UserModel.findOneAndUpdate({name: 'IDECm'}, {isAdmin: true, isVIP: true});
    res.send("Done");  
})

app.listen(3000, function(){
    connectToMongo();
    console.log('running');
})