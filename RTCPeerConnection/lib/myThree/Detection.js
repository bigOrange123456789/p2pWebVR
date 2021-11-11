export {Detection}
class Detection {//需要服务器
    constructor() {
        this.needDetection= window.param.needDetection
        if(!this.needDetection)return
        this.date=[
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours(),
            new Date().getSeconds(),
            new Date().getMilliseconds()
        ]
        this.userID=0;//prompt("请输入您的学号：")
        this.time0=performance.now()
        this.timeSum0=0//无转发加载时间
        this.count0=0//无转发加载次数
        this.timeSum1=0//有转发
        this.count1=0
        this.close=false
        var scope=this

        this.testTime=window.param.testTime;//测试时间
        this.frameCount=0;//记录帧数量
        function testFrame(){
            scope.frameCount++
            requestAnimationFrame(testFrame);
        }testFrame()
        setTimeout(()=>{
            scope.finish()
        },scope.testTime*1000)
    }
    add(id,way){//资源编号,资源获取途径
        if(!this.needDetection)return
        //console.log(id,way)
        if(this.close)return
        if(way===0){//0表示这个通过无转发
            this.timeSum0+=(performance.now()-this.time0)
            this.count0++
        }else{//1表示这个通过有转发
            this.timeSum1+=(performance.now()-this.time0)
            this.count1++
        }
        /*this.record.push([
            id,//资源编号
            way,//资源获取途径
            performance.now()-this.time0//资源获取时间
        ])*/
    }
    finish(){
        if(!this.needDetection)return
        console.log(
            "count0:",this.count0,
            "count1:",this.count1
        )
        this.close=true
        var data={
            param:window.param,
            userID:this.userID,
            timeSum0:this.timeSum0,//直接通过服务器获取的资源
            count0:this.count0,
            url:window.location.href,//config
            date:this.date,//测试日期
            frameCount:this.frameCount,//测试所用的帧数
            testTime:this.testTime//测试时间
        }
        if(window.param.useP2P){
            data.p2pConn = Object.keys(window.p2p.myPeer.peers).length
            data.p2pPrint=window.p2p.myPeer.print
            //data.socketID = window.p2p.myPeer._myPeer.myId
            //alert('Object.keys(window.p2p.myPeer.peers).length')
            //alert(Object.keys(window.p2p.myPeer.peers).length)
            //alert(data.p2pConn)
            data.timeSum1=this.timeSum1//通过P2P获取的资源
            data.count1=this.count1
        }
        var oReq = new XMLHttpRequest();
        oReq.open("POST", window.param.dectionURL, true);
        oReq.responseType = "arraybuffer";
        oReq.onload = function () {//接收数据
            var unitArray=new Uint8Array(oReq.response) //网络传输基于unit8Array
            var str=String.fromCharCode.apply(null,unitArray)//解析为文本
            console.log(str)
            alert("测试完成，感谢您的配合！")
            //window.opener = null;//为了不出现提示框
            //window.close();//关闭窗口//完成测试，关闭窗口
        };
        console.log(JSON.stringify(data))
        oReq.send(JSON.stringify(data));//发送请求
    }
}
