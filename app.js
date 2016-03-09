var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");
var moment = require("moment");
var PUNCHOUT = -1;

//moment().format();
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
    });
}

function loadSync(file) {
    return JSON.parse(fs.readFileSync(file));
};

var users = [];
var jobs = [];

var punchIns = [];




punchIns = loadSync('punchIns.txt');
users = loadSync('users.txt');
jobs = loadSync('jobs.txt');





var tasks = [
    {
        tId: 001,
        tDes: "Warehouse"
},
    {
        tId: 002,
        tDes: "Driving"
},
    {
        tId: 003,
        tDes: "Installation"
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

function getNextJobId() {
    var max = 0;
    for (var i in jobs) {
        var x = jobs[i].uJid;
        if (x > max) {
            max = x;
        }
    }
    return max + 1;
};

function getUserJobs(userId) {
    var cUserJobs = [];
    for (var i in jobs) {
        if (userId === jobs[i].jNumber) {
            cUserJobs.push(jobs[i]);
        }
    }
    return cUserJobs;
};

function getUserPunch(userId) {
    var cUserPunch = [];
    for (var i in punchIns) {
        if (userId === punchIns[i].userid) {
            cUserPunch.push(punchIns[i]);
        }
    }
    return cUserPunch;
};


function getTodaysPunches(userId) {
    var userPunches = getUserPunch(userId);
    var cUserPunch = [];
    for (var i in userPunches) {
        var current = new Date().setHours(0, 0, 0, 0);
        var punchDate = new Date(userPunches[i].timestamp).setHours(0, 0, 0, 0);
        if (current === punchDate) {
            cUserPunch.push(userPunches[i]);
        }
    }
    return cUserPunch;
}

function getTodaysHours(userId) {
    var firstPunch = getPunchIn(userId);
    if (firstPunch === 0) {
        return 0;
    }
    var timeNow = getPunchOut(userId); //returns current or final time
    if (timeNow === 0){
        timeNow = new Date().getTime();
    }
    return (timeNow - firstPunch) / 3600000;

};

function getPunchIn(userId) {
    var todaysHours = getTodaysPunches(userId);
    //loop through the array created by calling getTodaysPunches 
    if (todaysHours.length === 0) {
        return 0;
    }
    var firstPunch = todaysHours[0].timestamp; //find the minimum time
    return firstPunch;

}

function getPunchOut(userId) {
    var todaysHours = getTodaysPunches(userId);
    for (var i in todaysHours) {
        if (todaysHours[i].taskid == PUNCHOUT) {
            return todaysHours[i].timestamp;
        }
    }
    return 0;
}

// login page stuff
app.get('/login', function (req, res) {
    res.render('login', {
        'user': req.session.user
    });

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


//signup page stuff
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

//display dashboard
app.get('/dashboard', function (req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    res.render('dashboard', {
        'user': req.session.user,
        'cUserPunch': getTodaysPunches(req.session.user.id),
        'currentHours': getTodaysHours(req.session.user.id),
        'getPunchIn': getPunchIn(req.session.user.id),
        'getPunchOut':getPunchOut(req.session.user.id)
    });
    console.log(req.session.user);
    //console.log(cUserPunch);
});


//show the jobs page
app.get('/jobs', function (req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    res.render('jobs', {
        'user': req.session.user,
        'cUserJobs': getUserJobs(req.session.user.id)

    });
});

//create a new job and store it in the jobs.txt file
app.post('/createJob', function (req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    var newJob = {
        uJid: getNextJobId(),
        jNumber: req.session.user.id,
        jName: req.body.jName,
        jStreet: req.body.jStreet,
        jContact: req.body.jContact
    };
    console.log(jobs);
    jobs.push(newJob);
    save("jobs.txt", jobs, function () {
        console.log("Successfully saved new job!");
    });
    res.redirect('/dashboard');
});


// show the punch-in page 
app.get('/punchIn', function (req, res) {
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }
    getUserJobs(req.session.user.id);
    res.render('punchIn', {
        'cUserJobs': getUserJobs(req.session.user.id),
        'tasks': tasks,
        'user': req.session.user
    });
});

//record and save punch-in data to the punchIns.txt file
app.post('/punch', function (req, res) {
    var d = new Date();
    var newPunch = {
        taskid: req.body.tasks,
        jobid: req.body.jobs,
        userid: req.session.user.id,
        timestamp: d.getTime(),
        prettyTime: moment(d).format('MMMM Do YYYY, h:mm:ss a')
    };
    punchIns.push(newPunch);
    save("punchIns.txt", punchIns, function () {
        console.log("Successfully saved new punches!");
    });
    res.redirect('/dashboard');
});

//render the login page when a user logs out
app.get('/logout', function (req, res) {
    res.render('login');
});

//end the current session when a pushes the logout button
app.post('/logout', function (req, res) {
    delete req.session.user;
    res.redirect('/login');
    return
});


app.use(express.static('public'));
app.listen(3000);


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