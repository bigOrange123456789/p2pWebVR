export {P2P}
class P2P{
    //sceneName=JinYue&useP2P=false&roomNumber=1;
    constructor(){//每个房间的人数最好不要超过10个
        this.useP2P= "true"===window.location.href.split("useP2P=")[1].split("&")[0]
        if(!this.useP2P)return
        this.roomNumber=window.location.href.split("roomNumber=")[1].split("&")[0]
        this.saveData= {}

        var scope=this;
        var connection = new RTCMultiConnection();
        connection.socketURL = "http://110.40.255.87:9001/"
        //connection.socketURL = "http://localhost:9001/";
        //connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';//服务器地址
        connection.session = {
            data: true// 文本或文件通信
        };
        connection.onopen = function(event) {//猜测是完全建立时的响应
            //setInterval(()=>{
                //connection.send({arr:[1,.2],str:'hello everyone'});
            //},3000)
        };
        connection.onmessage = function(event) {
            console.log(event.userid + ' said: ' + event.data);
            if(event.data.arr)console.log(event.data.arr)
            if(event.data.str)console.log(event.data.str)
            //scope.receive(event)
            scope.onmessage(event)
        };
        this.roomID='room'+Math.floor(Math.random()*this.roomNumber)
        connection.openOrJoin(
            scope.roomID
        );
        scope.connection=connection
    }
    onmessage(event){
        if(!this.useP2P)return
        console.log("接收了：")
        if(event.data)
        if(event.data.type==="data"){
            this.receive(event.data.idData,event.data.array)
        }else if(event.data.type==="need"){//
            var array=this.saveData[event.data.idData]
            if(array){
                this.send({//当前用户的userid会自动被传输
                    type:"data",//类别有两种 data数据和need请求
                    idData:event.data.idData,
                    array:array
                    },event.userid)
            }
        }else{//用于测试
            console.log(event)
        }
    }
    send(data,idTarget){//没有建立连接似乎并不影响发送数据？
        if(!this.useP2P)return
        console.log("2发送了:",data)
        this.connection.send(data)
        //this.connection.send(data,idTarget)
    }
    //下面为暴露给外界的接口
    need(idData){
        if(!this.useP2P)return
        this.send({//当前用户的userid会自动被传输
            type:"need",//类别有两种 data数据和need请求
            idData:idData
        })
    }
    receive(idData,array){//收到数据
        console.log("receive",idData,array)
    }
    save(id,array){
        if(!this.useP2P)return
        this.saveData[id]=array
    }
}
