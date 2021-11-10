
var open = require("open");
try{
    for(var i=0;i<5;i++)
    open(
        //'http://localhost:8080/test.html?testTime=5',
        'http://100.66.196.213:8080/test.html?testTime=5&needDetection=true',
        "chrome");//open("http://www.google.com", "chrome");
}catch (e) {
    console.log(e,'无法打开网址')
}
