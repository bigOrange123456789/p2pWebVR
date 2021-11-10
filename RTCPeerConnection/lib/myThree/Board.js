import {
    TextureLoader,
    Object3D,
    SpriteMaterial,
    Sprite,

    BoxGeometry,
    MeshBasicMaterial,
    Mesh,

    SphereGeometry,
    CylinderGeometry,
    Vector2,
    Vector3,
    Raycaster,
    Texture,
    PointsMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Points
} from '../three/build/three.module.js'
export {Board}
class Board{
    constructor() {
        this.root=new Object3D()
        this.spheres=[]
        this.indexs=[]
        window.scene.add(this.root)
        this.init()
    }
    radiographic(){//射线检测
        var scope=this
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        document.addEventListener( 'mousemove', (event)=>{
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );//鼠标移动事件
        function click(){
            var flag=false;//没有点击到
            raycaster.setFromCamera( mouse, window.c )
            check(scope.spheres,(intersect)=>{//检测是否点击到 球形光标
                intersect.object.sprite.visible=true
                scope.div.style.display=""
                scope.div.back.style.display=""
                for(i=0;i<scope.div.card.length;i++){
                    var card=scope.div.card[i]
                    console.log(i,intersect.object.number,i===intersect.object.number)
                    if(i===intersect.object.number)card.style.display=""
                    else card.style.display="none"
                }
                for(var i=0;i<scope.spheres.length;i++){//将其它提示牌都隐藏
                    if(scope.spheres[i]!==intersect.object)
                        scope.spheres[i].sprite.visible=false
                    scope.spheres[i].visible=!scope.spheres[i].sprite.visible
                }
            },()=>{
                //mark_1
                check(scope.indexs,(intersect)=>{
                    var p=intersect.object.myPosition
                    window.c.position.set(p[0],p[1],p[2])
                    window.c.rotation.set(p[3],p[4],p[5])
                    scope.div.style.display="none"
                })
            })
            function check(arr,cb1,cb2){
                var intersects = raycaster.intersectObjects( arr )
                if(intersects.length!==0){
                    cb1(intersects[0])
                    flag=true
                } else if(cb2)cb2()
            }
            return flag
        }
        window.addEventListener('click',click,false)
        document.addEventListener( 'touchstart', ()=>{
            var x0=mouse.x
            var y0=mouse.y

            var i0=-10,j0=-50
            var interval=setInterval(()=>{
                i0+=10
                if(i===10){
                    i0=-10;
                    j0+=10
                }

                mouse.x=x0+i
                mouse.y=y0+j
                if(click())return//如果点击到就不用再点击了
                if(j0===50)clearInterval(interval)
            },10)

        }, false )
        //document.addEventListener( 'touchend', click, false )
        //alert(window.innerWidth+","+window.innerHeight)
        //alert("new4")
    }
    indexMark(){
        //尺寸，坐标，场景
        function Mark(size, position, scene, text){
            var material = new MeshBasicMaterial({color: 0xff0000});
            var cylinder = new CylinderGeometry(3*size, 3*size, 1*size, 18, 3);
            var mark_1 = new Mesh(cylinder, material);
            scene.add(mark_1);

            mark_1.rotateX(Math.PI/2);
            mark_1.position.x = position.x;
            mark_1.position.y = position.y+5*size;
            mark_1.position.z = position.z;
            var box = new BoxGeometry(1*size, 5*size, 1*size);
            var mark_2 = new Mesh(box, material);
            mark_2.position.x = position.x;
            mark_2.position.y = position.y;
            mark_2.position.z = position.z;

            scene.add(mark_2);

            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.font = "30px Arial ";

            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(0,0);//(10,30);
            ctx.lineTo(250,0);
            ctx.lineTo(250,50);
            ctx.lineTo(0,50);
            ctx.lineTo(0,0);
            ctx.closePath()
            ctx.fillStyle = "white";  //填充颜色
            ctx.fill();  //填充

            ctx.lineWidth=5;//描边
            ctx.strokeStyle = "yellow";  //描边颜色
            ctx.stroke();  //描边


            ctx.fillStyle = "black";

            ctx.fillText(text, 0, 40);
            //console.log(text.length);
            ctx.globalAlpha = 1;

            //将画布生成的图片作为贴图给精灵使用，并将精灵创建在设定好的位置
            let texture = new Texture(canvas);
            texture.needsUpdate = true;
            //创建精灵，将该材质赋予给创建的精灵
            let spriteMaterial = new PointsMaterial({
                map: texture,
                //sizeAttenuation: true,
                size: 40*size,
                transparent: true,
                opacity: 1,
            });
            //创建坐标点，并将材质给坐标
            let geometry = new BufferGeometry();
            let vertices = [0, 0, 0];
            geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
            let sprite = new Points(geometry, spriteMaterial);
            sprite.position.set(position.x-8*size, position.y+4*size, position.z);
            scene.add(sprite);
            return mark_1
        }
        var m1=Mark(1, new Vector3(-5,3,-33), this.root," 1. 线路高压风险");//1.1
        var m2=Mark(1, new Vector3(10,3,-20), this.root," 2. 地面湿滑风险");//1.2
        var m3=Mark(1, new Vector3(158,3,-22), this.root," 3. 易燃易爆风险");//1.3
        var m4=Mark(1, new Vector3(150,3,-31), this.root," 4. 高空坠物风险");//2.1
        setInterval(()=>{
            if(m1.scale.x===1){
                m1.scale.set(0.5,0.5,0.5)
                m2.scale.set(0.5,0.5,0.5)
                m3.scale.set(0.5,0.5,0.5)
                m4.scale.set(0.5,0.5,0.5)
            }else {
                m1.scale.set(1,1,1)
                m2.scale.set(1,1,1)
                m3.scale.set(1,1,1)
                m4.scale.set(1,1,1)
            }
        },500)
        this.indexs=[m1,m2,m3,m4]
        m1.myPosition=[38.05305256876272,-0.39369056562386123,-10.680588554295602,-0.7519624562446477,-0.37460816974847244,-0.32972912516318015]
        m2.myPosition=[95.09704074453218,-3.786554973303227,-24.07925454679748,0.47105791953795534,-1.490086541048294,0.4697406002615658]
        m3.myPosition=[84.63132688745536,-12.037532687676078,-15.69532599751333,0.13115055120279115,-1.4830952410421432,0.13065223079137392]
        m4.myPosition=[289.76770514539044,-12.276449047863833,-30.58358789543938,-2.813620009660064,0.9836349554368536,2.8655513662195067]
    }
    init(){
        this.htmlDiv()

        var scope=this
        var buttons=document.getElementsByClassName("myButton")
        console.log(buttons)
        for(var i=0;i<buttons.length;i++){
            buttons[i].myid=i
            buttons[i].onclick=function(){
                var p=scope.indexs[this.myid].myPosition
                window.c.position.set(p[0],p[1],p[2])
                window.c.rotation.set(p[3],p[4],p[5])
                scope.div.style.display="none"
            }
        }
        this.radiographic()//添加射线检测
        this.indexMark()//添加索引标签

        this.add('./img/1gaoya.png', 39.24085908881188,  -2.273604517174581, -12.952945470925924).number=0
        this.add('./img/2huadao.png', 104.66579018041459,  -3.43530338711232,  -24.768933136069272).number=1
        this.add('./img/3huozai.png', 93.64061801348208, -11.386359957154818, -13.976492720528451).number=2
        this.add('./img/4luowu.png', 285.84295321540884, -10.62537764382058,  -26.75882643179238).number=3
        //用于测试
        //window.add=()=>{scope.add('./img/sprite.png',window.c.position.x,window.c.position.y,window.c.position.z)}
    }
    htmlDiv(){
        var width=window.innerWidth
        var height=window.innerHeight

        var div=document.createElement('div')
        div.style.cssText=//'font-size:'+size+'px;'//字体大小 //+'width:'+100+'px;height:'+100+'px;'//按钮大小 //+'color:'+color+';'//字体颜色 //+'background:'+background+';'//按钮颜色
            +'vertical-align:middle;'
            +'text-align:center;'
            +'line-height:50px;'
            +'border-radius: 6px;'
            +'position:fixed;'//到窗体的位置
            +'left:'+0+'px;'//到部件左边距离
            +'top:'+0+'px;'; //到部件右边 距离
        document.body.appendChild(div)
        image("./img/a.png",width/3,(width/3)/6,width/2-(width/3)/2,0,div)
        //高压 路滑 爆炸 坠物
        div.card=[]
        div.card.push(image("./img/01gaoya.png",height*0.5,height*0.5,0,height*0.3,div))
        div.card.push(image("./img/02huadao.png",height*0.5,height*0.5,0,height*0.3,div))
        div.card.push(image("./img/03huozai.png",height*0.5,height*0.5,0,height*0.3,div))
        div.card.push(image("./img/04luowu.png",height*0.5,height*0.5,0,height*0.3,div))

        var back=image("./img/back.png",0.1*height*0.5, 0.05*height*0.5,0.901*height*0.5,height*0.3 ,div)
        back.onclick=()=>{
            console.log("back")
            setTimeout(()=>{
                for(var i=0;i<div.card.length;i++)
                    div.card[i].style.display="none"
                back.style.display="none"
                div.style.display="none"
            },1)
        }
        div.back=back
        this.div=div
        div.style.display="none"
        window.board_div=div
        function image(src,w,h,x,y,parent){
            var img=new Image();
            img.onload=function(){
                if(typeof (window.image_num)==="undefined")window.image_num=0;
                window.image_num++;
            }
            img.src=src;
            img.width=w;
            img.height=h;
            img.style.cssText='display:block;'+
                'position:absolute;'+//位置可变
                'left:'+x+'px;'+//到部件左边距离
                'top:'+y+'px;'; //到部件右边 距离
            parent.appendChild(img);

            return img;
        }

    }
    add(url,x,y,z){
        if(window.isMobile){//if(true){//
            const geometry = new SphereGeometry( 0.4, 8, 8 );
            const red = new MeshBasicMaterial( { color: 0xff0000 } );
            const sphere = new Mesh( geometry, red );

            const geometry2 = new SphereGeometry( 8, 8, 8 );
            geometry2.side=2
            const red2 = new MeshBasicMaterial({
                transparent: true,
                opacity: 0,//1,//
            });
            red2.side=2
            const sphere2 = new Mesh( geometry2, red2 );
            //sphere.position.set(x,y,z)
            sphere2.position.set(x,y,z)
            sphere2.add( sphere )
            this.root.add( sphere2 )
            setInterval(()=>{//小球闪烁功能的实现
                if(sphere.scale.x===1)sphere.scale.set(0.5,0.5,0.5)
                else sphere.scale.set(1,1,1)
            },500)
            this.spheres.push(sphere2)

            const map = new TextureLoader().load( url );
            const material = new SpriteMaterial( { map: map } );
            const sprite = new Sprite( material );
            sprite.position.set(x,y,z)
            sprite.scale.set(1,1,1)
            sprite.visible=false;
            this.root.add( sprite );
            sphere2.sprite=sprite
            return sphere2
        }else{
            const geometry = new SphereGeometry( 0.4, 8, 8 );
            const red = new MeshBasicMaterial( { color: 0xff0000 } );
            const sphere = new Mesh( geometry, red );
            sphere.position.set(x,y,z)
            this.root.add( sphere )
            if(window.isMobile)this.root.add( sphere2 )
            setInterval(()=>{//小球闪烁功能的实现
                if(sphere.scale.x===1)sphere.scale.set(0.5,0.5,0.5)
                else sphere.scale.set(1,1,1)
            },500)
            window.sphere=sphere
            this.spheres.push(sphere)

            const map = new TextureLoader().load( url );
            const material = new SpriteMaterial( { map: map } );
            const sprite = new Sprite( material );
            sprite.position.set(x,y,z)
            sprite.scale.set(1,1,1)
            sprite.visible=false;
            this.root.add( sprite );
            window.sprite=sprite
            sphere.sprite=sprite
            return sphere
        }
    }
}
