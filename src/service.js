const uuidv1 = require('uuid/v1');
var schedule = require('node-schedule')
var redis = require("redis"),
    RDS_PORT = 6380,
    RDS_HOST = 'redis_ip',
    RDS_PWD  = '123456',
    RDS_OPTS = {},
    redis_s = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);

redis_s.auth(RDS_PWD, function(err){
    if(err){
        console.error('Password authenticate fail.')
        process.exit(4);
    }
    console.log('Password authenticate successes.');
});

redis_s.on('connnet', function(err){
    if(err){
        console.error('Connection to the redis is failed.')
        process.exit(4);
    }
    console.log('Connection to the redis is successed.');
});

redis_s.on('ready', function(err){
    if(err){
        console.error("Redis isn't ready.")
        process.exit(4);
    }
    console.log('Redis is ready.');

    let rule_time = new schedule.RecurrenceRule();
    let time_sec = [1,6,11,16,21,26,31,36,41,46,51,56];
    rule_time.second = time_sec;
    console.log("start scheduleJob...");
    schedule.scheduleJob(rule_time, function(){
        let message = {"name":"lili","age":"18"};
        //console.log(message);
        sampleTaskMaker(message, "/home/sampson/project1.func1", 30);
    });
});

redis_s.on('end',function(err){
	console.log('end');
});


var sampleTaskMaker = function(message, func, timeout) {
    message = JSON.stringify(message);
    //console.log("Received a new task:", func, message, "after " + timeout + ".");
    
    let key = uuidv1().replace(/-/g, "") +   //change "-" to ""
        "-" + func + "-" + message;
    let content = uuidv1();
    //console.log(key);

    redis_s.select(1, function(err){
        if(err) process.exit(4);
        redis_s.multi()
            .set(key, content)
            .expire(key, timeout)
            .exec(function(err) {
                if(err) {
                    console.error("Failed to publish EXPIRE EVENT for " + content);
                    console.error(err);
                    return;
                }
            });
        redis_s.get(key, (err, data) => {
            console.log('err:' + err + ' data:' +  data);
        })
    })
};

