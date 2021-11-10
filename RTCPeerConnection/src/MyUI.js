export {MyUI}
class MyUI{
    constructor() {
        function Text(str,color,size,parentNode){//文本
            if (typeof(parentNode) == "undefined") parentNode = document.body;
            this.parentNode=parentNode;
            this.str=str;
            this.color=color;
            this.size=size;
            this.element=h1(str,color,size,parentNode);
            function h1(str,color,size,parentNode){
                var oText=document.createElement('h1');
                oText.innerHTML=str;
                oText.style.cssText=
                    //'color:skyblue;'+
                    'color:'+color+';'+//文字颜色
                    //'background:#aff;'+//背景颜色
                    'font-size:'+size+'px;'+//文字大小
                    //'width:60px;height:40px;'+//文本大小
                    'font-weight:normal;'+
                    //+'padding-top:50px;'//距离上一个对象的距离
                    'position:fixed;'+//到窗体的位置
                    'left:'+0+'px;'+//到部件左边距离
                    'top:'+0+'px;'; //到部件右边 距离
                parentNode.appendChild(oText);
                return oText;
            }
        }
        function Button(str,color1,color2,color3,size,radius,w,h,x,y,cb) {
            if(typeof (w)=="undefined")w=100;
            if(typeof (h)=="undefined")h=50;
            var parentNode = document.body;
            this.element=p(str,color1,color2,color3,size,radius,w,h,parentNode);
            function p(html,color1,color2,color3,size,radius,width,height,parentNode){
                var oButton=document.createElement('p');//按钮
                oButton.innerHTML=html;
                oButton.style.cssText='font-size:'+size+'px;'//字体大小
                    +'width:'+width+'px;height:'+height+'px;'//按钮大小
                    +'background:'+color1+';'//字体颜色
                    +'color:white;'//按钮颜色
                    +'vertical-align:middle;'
                    +'text-align:center;'
                    +'line-height:'+height+'px;'
                    +'border-radius: '+radius+'px;'
                    +'border: 2px solid '+color1+';'
                    +'position:fixed;'//到窗体的位置
                    +'left:'+(window.innerWidth-width)+'px;'//到部件左边距离
                    +'top:'+0+'px;'; //到部件右边 距离
                //+'cursor:pointer;'
                oButton.style.left=x+'px';
                oButton.style.top=y+'px';
                oButton.style.cursor='hand';
                oButton.onmouseover=function(){
                    oButton.style.cursor='hand';
                    oButton.style.backgroundColor = color3;
                    oButton.style.color = color1;
                }
                oButton.onmouseout=function(){
                    oButton.style.cursor='normal';
                    oButton.style.backgroundColor = color1;
                    oButton.style.color = 'white';
                }
                oButton.onmousedown = function() {
                    oButton.style.backgroundColor = color2;
                    oButton.style.color = 'black';
                }
                oButton.onmouseup = function() {
                    oButton.style.backgroundColor = color3;
                    oButton.style.color = 'white';
                }
                parentNode.appendChild(oButton);
                if(cb)oButton.onclick=()=>{
                    cb(oButton)
                }
                return oButton;
            }
        }
        Button.prototype=Text.prototype={
            reStr:function(str){
                this.element.innerHTML=str;
            },
            rePos:function (x,y) {
                this.element.style.left=x+'px';
                this.element.style.top=y+'px';
            },
            addEvent:function(event){
                this.element.onclick=event;
            },
        }

        this.Button=Button
        this.viewPoint=[
            {name:"控制室",
                x: -10.957505143780658,
                y: -12.001639088997345,
                z: -24.363887399413905,
                _x: -2.937102882769497,
                _y: -0.06989515706927263,
                _z: -3.127110008044409},
            {name:"通信仪表",
                x: 47.89543311988286,
                y: -4.200915032091384,
                z: -17.62130598279283,
                _x: -1.7847718807288722,
                _y: -0.9368473872438446,
                _z: -1.8342357994345964},
            {name:"废水泵房",
                x: -18.653838414700704,
                y: -1.0939797275681649,
                z: -16.767116951834723,
                _x: -1.303070641990801,
                _y: -0.06801507735753005,
                _z: -0.24286697483328912,},
            {name:"通风机房",
                x: 280.26276427998505,
                y: -0.926761828733615,
                z: -5.979526289138611,
                _x: -0.6492818178254066,
                _y: -0.09191950196358863,
                _z: -0.06956286507314725,
            },
            {name: "更衣室",
                x: 38.05305256876272,
                y: -0.39369056562386123,
                z: -10.680588554295602,
                _x: -1.0159850557521561,
                _y: -0.11935722963150866,
                _z: -0.18982080428384068,}
        ]
    }
}
