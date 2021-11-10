export {P2P}
import {Peer} from "./Peer.js";
//经过测试：
//      1个发送方多个接收方没有问题，但是多个发送方似乎会有问题
class P2P{
    //sceneName=JinYue&useP2P=false&roomNumber=1;
    constructor(){//每个房间的人数最好不要超过10个
        this.useP2P= window.param.useP2P
        console.log('执行了P2P的代码',this.useP2P)
        if(!this.useP2P)return
        this.warehouse= {}//已有的数据
        this.needPack={}//需要的数据包编号，这个存储结构应该换成堆栈
        //this.myPeer=new Peer({socketURL:window.param.socketURL})
        this.myPeer=new Peer({socketURL:"http://101.34.166.68:8888/"})
        this.myPeer.receive=this.receive0
        this.accept=null
        this.againQuest()
    }
    againQuest(){
        var scope=this
        var index=0
        var arr
        setInterval(()=>{
            //console.log(scope.myPeer.peers)
            for(var ii=0;ii<10;ii++)
            for(var i in scope.myPeer.peers)
                if(scope.myPeer.peers[i].readyState==='open') {
                    arr= Object.keys(scope.needPack)
                    if(arr.length===0)return
                    if(index>=arr.length)index=0
                    var id = arr[index]
                    while(window.loaded[id]&&arr.length>0){
                        delete scope.needPack[id]
                        arr= Object.keys(scope.needPack)
                        if(index>=arr.length)index=arr.length-1
                        id = arr[index]
                        //console.log('需要加载的数据包个数:',arr.length,id)
                    }
                    if(arr.length>0){
                        scope.request(id)
                        index++
                    }
                }
        },1)
    }
    test(){
        var scope=this
        this.testID=0
        setInterval(()=>{
            var id = Object.keys(scope.warehouse)[scope.testID]
            var array = Object.values(scope.warehouse)[scope.testID]
            scope.testID++
            if(scope.testID>=Object.values(scope.warehouse).length)scope.testID=0
            scope.send({
                type:"data",
                idData:id,
                array:array
            })
            console.log(Object.values(scope.warehouse).length,scope.testID)
        })
    }
    request(idData){
        if(!this.useP2P)return
        if(window.loaded[idData]) return//如果该数据包已经被加载
        if(idData){//idData不能没有定义
            //console.log("请求资源",idData)
            this.needPack[idData]=true
            this.send({
                type:"request",
                idData:idData
            })
        }
    }

    store(idData,array){//存储数据
        if(!this.useP2P)return
        if(array){
            this.warehouse[idData]=array
            //console.log('已经收到的数据包个数为:',Object.values(this.warehouse).length)
            /*this.send({//将收到的数据进行广播
                type:"data",
                idData:idData,
                array:array,
            })
            */
        }
    }

    send(data){
        if(!this.useP2P)return
        /*{
			type:"data",
			idData:meshIndex,
			array:myGLTFLoaderEx.myArray,
		}*/

        this.myPeer.send(JSON.stringify(data))
    }
    receive0(event,sourceId){
        var scope=window.p2p//就是this
        var pack=JSON.parse(event.data)
        console.log('收到：',
            pack.idData,
            '加载情况为：',
            window.loaded[pack.idData])
        if(scope.accept){
            try{
                if(pack.type==='data'){
                    console.log('收到P2P数据')
                    scope.store(pack.idData,pack.array)
                    scope.accept(pack.idData,pack.array)
                }else if(pack.type==='request'){
                    if(scope.warehouse[pack.idData])
                        scope.send({
                            type:"data",
                            idData:pack.idData,
                            array:scope.warehouse[pack.idData]
                        })
                }
            }catch(e){
                console.log('p2p数据包解析错误：',data.idData,data.array)
            }

        }

    }
}
