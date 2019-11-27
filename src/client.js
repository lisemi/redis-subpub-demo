
var redis = require("redis"),
    RDS_PORT = 6380,
    RDS_HOST = 'redis_ip',
    RDS_PWD  = '123456',
    RDS_OPTS = {},
    sub = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

var subscribeKey = "__keyevent@1__:expired";  

sub.auth(RDS_PWD, function(err){
    if(err){
        console.error('Password authenticate fail.')
        process.exit(4);
    }
    console.log('Password authenticate successes.');
});

sub.once("connect", function(err) {
    if(err){
        console.error('Connection to the redis is failed.')
        process.exit(4);
    }
    console.log('Connection to the redis is successed.');
});

sub.on('ready', function(err){
    if(err){
        console.error("Redis isn't ready.")
        process.exit(4);
    }
    console.log('Redis is ready.');
});

// select db1
sub.select(1, function(err) {
    if(err) {
        console.log("select db1 failed. err:" + err);
        process.exit(4);
    }
});

// listen `pmessage` channel infomation
sub.on("pmessage", (pattern, channel, message) => {
    sampleOnExpired(pattern, channel, message);
});
sub.psubscribe(subscribeKey);

var sampleOnExpired = function(pattern, channel, key) {

    let body = key.split("-");
    if(body.length < 3) return;

    let func = body[1]; 

    body.shift(); body.shift();  // delete uuid and function
    let params = body.join(","); // get key/value parameters

    func = func.split(".");      // segmentation path and function
    if(func.length !== 2) {
        console.error("Bad params for task:", func.join("."), "-", params);
        return;
    }
    let path = func[0];
    func = func[1];

    console.log("get the subscribe : ", path, "-", func, "-", params);

    process.nextTick(function() {
        try {
            // Todo... execute function
            console.log('you can to do something in here.');
        } catch(e) {
            console.error("Failed to call function", path, "-", func, "-", params);
            console.error(e.stack);
        }
    });
};





