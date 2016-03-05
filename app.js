var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");


var app = express();
app.use(session({
    secret: "s;ldkf;a"
}));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

var storedJobs = [];
var storedUsers = [];
var punchIns = [];
var users = [];

function save(file, data, callback) {
    fs.writeFile(file, JSON.stringify(data), function (err, data) {
        if (err) {
            console.log(err);
        }
        callback();
    });
}

function load(file, callback) {
    fs.readFile(file, function (err, data) {
        if (err) {
            console.log(err);
        }
        callback(JSON.parse(data));
    })
}

function loadSync(file) {
    return JSON.parse(fs.readFileSync(file));
};

punchIns = loadSync('punchIns.txt');
users = loadSync('users.txt');


var tasks = [
    {
        tId: 001,
        tDes: "Warehouse"
},
    {
        tId: 002,
        tDes: "Driving"
}
];

var jobs = [
    {
        jNumber: 001,
        jName: "Google",
        jAddress: "2880 30th St."

    },
    {
        jNumber: 002,
        jName: "Harrison",
        jAddress: "41 Baker Ave."

    }
];




function findUser(username, password) {
    for (var i in users) {
        if (username === users[i].username && password === users[i].password) {
            return users[i];
        }
    }
};


function getNextUserId() {
    var max = 0;
    for (var i in users) {
        var x = users[i].id;
        if (x > max) {
            max = x;
        }
    }
    return max + 1;
};


//var isRepeat = false;
//    for (var i = 0; i < users.length; i++) {
//        if (users[i].username === req.body.username) {
//            isRepeat = true;
//        } else {
//            console.log("Noooooooo");
//        }
//    }
//    if (!isRepeat && req.body.username !== "") {
//        users.push(new User(users.length, req.body.uname, req.body.cPword, 0, []));
//    } else {
//        console.log("You're doing it wrong");
//    }
//    saveStudents();
//};



app.get('/punchIn', function (req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    res.render('punchIn', {
        'jobs': jobs,
        'tasks': tasks,
        'users': users
    });
});

app.get('/dashboard', function (req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    res.render('dashboard', {
        'users': users,
        'punchIns': punchIns,
    });
});

app.get('/login', function (req, res) {
    res.render('login');

});



app.post('/login', function (req, res) {
    var vUser = findUser(req.body.uname, req.body.pass);
    if (!vUser) {
        res.redirect('/login');
    } else {
        req.session.user = vUser;
        res.redirect('/dashboard');
    }
});

app.post('/logout', function (req, res) {
    var cUser = req.session.user;
    cUser = !req.session.user;
    res.redirect('/login')
});

app.get('/signUp', function (req, res) {
    res.render('signUp')
});

app.post('/signUp', function (req, res) {
    var newUser = {
        username: req.body.uname,
        id: getNextUserId(),
        password: req.body.pass
    };
    users.push(newUser);
    save("users.txt", users, function () {
        console.log("Successfully saved new user!");
    });
    res.redirect('/login');
});



app.post('/punch', function (req, res) {
    var d = new Date();
    var newPunch = {
        taskid: req.body.tasks,
        jobid: req.body.jobs,
        userid: req.session.user.id,
        timestamp: d.getTime(),
        prettyTime: d.toDateString() + d.toTimeString()
    };
    punchIns.push(newPunch);
    save("punchIns.txt", punchIns, function () {
        console.log("Successfully saved new punches!");
    });
    res.redirect('/dashboard');
});

app.use(express.static('public'));
app.listen(3000);