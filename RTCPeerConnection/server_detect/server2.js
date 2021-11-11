//localhost:8080
require('http').createServer(function (request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    request.on('data', function (data) {//接受请求
        try{
            data=data.toString()
            //console.log(data)
            var result=JSON.parse(data)
            console.log(result.userID)
            var name0="detection/" +result.userID+"#"+Math.random()
            if(result.p2pPrint&&result.p2pPrint.version)
                name0=name0+result.p2pPrint.version
            saveJson(
                name0 +".json",
                result)
        }catch (e) {
            console.log(1,e)
        }
    });
    request.on('end', function () {//返回数据
        response.write("finish");//发送字符串
        response.end();
    });
}).listen(9999, '0.0.0.0', function () {
    console.log("Listening port: 9999");
});
function saveJson(name,json0) {
    var fs=require('fs')
    try{
        fs.writeFile(name, JSON.stringify(json0 , null, "\t") , function(){});
    }catch (e) {
        console.log(2,e)
    }
}
