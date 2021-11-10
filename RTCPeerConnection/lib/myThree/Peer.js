class Peer{//对 _Peer 对象进行封装
    constructor(opt) {
        var scope=this
        var _myPeer=new _Peer(opt)
        var waitingUser=[]

        this.peers=_myPeer.peers
        this.send=(data,target)=>{
            if(data &&
                typeof data.length!=="undefined"){
                if(data.length>43690){
                    console.log('数据包过大')
                }
            }
            if(typeof target==="undefined")
                for(var i in _myPeer.peers){
                    if(_myPeer.peers[i].readyState==='open'){
                        if(_myPeer.peers[i].bufferedAmount+data.length>43690*300){
                            console.log('缓存不足')
                        }else{
                            //console.log('缓存充足')
                            _myPeer.peers[i].send(data)
                        }
                    }else console.log(i+" is close")
                }
            else if(_myPeer.peers[target])
                _myPeer.peers[target].send(data)
            else
                console.log("target does not exist")
        }
        this.receive=(message,sourceId)=> {
            /*var data=JSON.parse(message.data)
            if(data.type==='timeStamp'){
                var reply={
                    type:'timeStamp_reply',
                    time:data.time
                }
                this.send(JSON.stringify(reply),sourceId)
            }else if(data.type==='timeStamp_reply'){
                var delay=performance.now()-data.time
                _myPeer.peers[sourceId].delay=delay
                console.log('delay of '+sourceId+' is '+delay)
            }*/
        }
        //this.connect=id=>_myPeer.connect(id)
        //以下是重新函数
        _myPeer.addUser=idOther=>{
            //console.log('_myPeer.idle()',_myPeer.idle())
            if(_myPeer.idle())
                _myPeer.connect(idOther)
            else
                waitingUser.push(idOther)
        }
        _myPeer.finish=()=>{
            if(waitingUser.length>0){
                _myPeer.connect(waitingUser.splice(0,1)[0])
            }
            //waitingUser.push(idOther)
        }
        _myPeer.openCallback=id=>{
            console.log(id+' is opened!')
            _myPeer.peers[id].onmessage=(data)=>{scope.receive(data,id)}
            var data={type:'timeStamp',time:performance.now()}
            _myPeer.peers[id].send(
                JSON.stringify(data)
            )
        }
        //以下是添加函数
        //_myPeer.
    }
}
class _Peer{
    constructor(opt) {
        this.myId=''
        this.otherId=''//这个为空表示处于空闲状态，否则处于忙碌状态
        this.socket =this.initSocket(opt.socketURL)
        this.peerConn=null
        this.peers={}
        this.openCallback=id=>console.log(id+' is opened!')
        this.addUser=idOther=> console.log("another user id is:",idOther)
        this.finish=()=>console.log('完成了一个协商')
    }
    initSocket(socketURL){
        var scope=this
        var socket = io.connect(socketURL,{transports:['websocket','xhr-polling','jsonp-polling']})
        socket.on('id',  id=> {
            scope.myId=id
            console.log("your id is:",id)
        })
        socket.on('addUser',  idOther=> {
            setTimeout(()=>scope.addUser(idOther),500)//这里加延迟的原因？
            //scope.addUser(idOther)
        })
        socket.on('connect0',  (id)=> {//收到一个请求
            if(scope.peers[id]
                &&(scope.peers[id].readyState==='connecting'||scope.peers[id].readyState==='open')//已经打开或正在建立
            ){
                // connecting 正在建立连接
                // open 连接已经建立
                // closing 正在关闭连接（此时不能再向缓冲区中添加数据）
                // closed 连接已经关闭或尝试建立连接失败
                console.log('这一链接已经建立:'+id)
                //return
            }
            scope.otherId=id
            scope.createPeerConnection('answer')
        })
        socket.on('message', data=> {//用于接收SDP和candidate
            if(data.targetType==='answer')
                scope.signalingMessageCallback(data.message)
            else//offer
                scope.signalingMessageCallback(data.message)
        })
        return socket
    }
    sendMessage(message,targetType) {//用于发送offer、answer、candidate
        this.socket.emit('message', {
            message:message,
            targetId0:this.otherId,
            targetType:targetType
        })//用于发送SDP和candidate
    }
    idle(){//判断是否空闲
        console.log('this.otherId',this.otherId)
        console.log('this.peer',this.peers[this.otherId])

        return this.otherId===''||this.peers[this.otherId]
    }
    connect(id){
        if(!this.idle()){
            console.log('The previous connection has not been completed')
        }else if(this.peers[id]
            &&(scope.peers[id].readyState==='connecting'||scope.peers[id].readyState==='open')
        ){
            console.log('This connection has been established:'+id)
        }else{
            this.otherId=id
            this.createPeerConnection('offer')//准备offer
            this.socket.emit('connect0', {
                offerId:this.myId,
                answerId:this.otherId
            })//准备answer
        }
    }
    signalingMessageCallback(message) {//分析收到的消息
        var scope=this
        if (message.type === 'offer') {//这个消息是发送给offer的sdp
            this.peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {}, scope.logError)
            this.peerConn.createAnswer(desc =>{
                scope.peerConn.setLocalDescription(desc).then(function() {
                    var obj=scope.peerConn.localDescription
                    obj.targetId0=scope.otherId
                    scope.sendMessage(obj,'answer')
                }).catch(scope.logError)
            }, scope.logError)
        } else if (message.type === 'answer') {//这个消息是发送给answer的sdp
            this.peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {}, scope.logError)
        } else if (message.type === 'candidate') {
            this.peerConn.addIceCandidate(new RTCIceCandidate({
                candidate: message.candidate,
                sdpMLineIndex: message.label,
                sdpMid: message.id
            }))
        }
    }
    createPeerConnection(type){
        var typeOther
        if(type==='offer')typeOther='answer'//自己是offer一方
        else typeOther='offer'//自己是answer一方

        var scope=this
        var peerConn = new RTCPeerConnection({//创建一个新的RTCPeerConnection对象。
            'iceServers': [{//没有这个配置就无法实现主机间的通信
                'urls': 'stun:stun.l.google.com:19302'//TURN服务器
            }]
        })
        peerConn.onicecandidate =
            //是收到 icecandidate 事件时调用的事件处理器.。
            //当一个 RTCICECandidate 对象被添加时，这个事件被触发。
            function(event) {
            if (event.candidate) {
                //console.log("on candidate : send candidate")
                scope.sendMessage({//向对方发送自己的candidate
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate,
                },typeOther)
            } else {
                //console.log('on candidate : End of candidates.')
            }
        }
        if(type==='offer'){
            peerConn.ondatachannel = function(event) {
                //收到datachannel 事件时调用的事件处理器。
                //当一个 RTCDataChannel 被添加到连接时，这个事件被触发
                scope.onDataChannelCreated(event.channel)//offer方接收channel
            }
        }else{//type==='answer'
            scope.onDataChannelCreated(peerConn.createDataChannel('photos'))//answer方创建channel

            peerConn.createOffer().then(function(offer) {
                //生成一个offer，它是一个带有特定的配置信息寻找远端匹配机器（peer）的请求。
                // 这个方法的前两个参数分别是方法调用成功以及失败的回调函数，可选的第三个参数是用户对视频流以及音频流的定制选项（一个对象）。
                return peerConn.setLocalDescription(offer)
            }).then(() => {
                scope.sendMessage(peerConn.localDescription,'offer')
            }).catch(scope.logError)
        }
        this.peerConn=peerConn
    }

    onDataChannelCreated(channel) {
        var scope=this
        channel.peerId=this.otherId
        channel.onopen = ()=>{
            scope.peers[channel.peerId]=channel
            scope.openCallback(channel.peerId)
            scope.finish()
        }
        channel.onmessage=message=>console.log("message",message)
        channel.onclose=()=>{//当接收到close事件时候的事件处理器。当底层链路被关闭的时候会触发该事件。
            console.log('通道产生了中断',
                channel.bufferedAmount,
                channel.bufferedAmount>43690,
                channel.bufferedAmount-43690)
            //这里scope.peers[channel.peerId].readyState为'closed' 已关闭
            //alert(scope.peers[channel.peerId].readyState)
            //alert(channel.bufferedAmount)
            delete scope.peers[channel.peerId]
            scope.peers[channel.peerId]=true

            //有点中断可以底层自动重连，有的中断只能通过以下代码重连
            setTimeout(()=>{//对于关闭的通道应该重新连接
                scope.otherId=channel.peerId
                scope.createPeerConnection('offer')//准备offer
                scope.socket.emit('connect0', {
                    offerId:scope.myId,
                    answerId:scope.otherId
                })
            },100)

        }
    }
    logError(err) {
        console.log('连接失败',err)
        this.otherId=''//这个为空表示处于空闲状态
        this.finish()
    }
}
export {Peer}
