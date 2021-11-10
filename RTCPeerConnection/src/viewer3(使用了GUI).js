import {
  Box3,
  DirectionalLight,
  SpotLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRendererEx,
  sRGBEncoding,
  Object3D,
} from '../lib/three/build/three';

import Stats from '../lib/three/examples/jsm/libs/stats.module.js';
//import {OrbitControls} from '../lib/three/examples/jsm/controls/OrbitControls.js';
import {PlayerControl} from '../lib/myThree/PlayerControl.js';
import { GUI } from 'dat.gui';
import { SLMLoader } from '../lib/SLMLoader';
import {PreviewManager} from '../lib/myThree/PreviewManager.js';
import{MyUI} from "./MyUI.js"
//import {MoveManager} from "../lib/myThree/MoveManager";
export class Viewer
{
  constructor (el, options)
  {
    this.el = el;
    this.options = options;

    this.lights = [];
    this.content = null;

    this.gui = null;

    this.prevTime = 0;

    this.stats = new Stats();
    this.stats.dom.height = '48px';
    [].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

    this.scene = new Scene();
    window.scene=this.scene;

    const fov = 60;
    this.defaultCamera = new PerspectiveCamera(fov, el.clientWidth / el.clientHeight, 0.1, 700);
    this.activeCamera = this.defaultCamera;
    this.scene.add(this.defaultCamera);

    //window.canvas=document.createElement('canvas');
    //window.ctx2d = window.canvas.getContext('2d');
    this.renderer = window.renderer = new WebGLRendererEx({
      antialias: false,//抗锯齿
      preserveDrawingBuffer: false,//每帧进行缓存
      alpha:false//透明渲染
    });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor(0xffffff);//(0xcccccc);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(el.clientWidth, el.clientHeight);

    /*
    this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = -10;
    this.controls.screenSpacePanning = true;
    */

    this.el.appendChild(this.renderer.domElement);

    this.slmLoader = new SLMLoader(
        {
          EnablePicking: true,
          renderer: this.renderer,
          scene: this.scene,
          el: this.el
        }
    );

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
    window.addEventListener('resize', this.resize.bind(this), false);

    this.setupScene();
    window.renderer=this.renderer
    window.a=this.analysis
    window.startAllPoint=this.startAllPoint

    this.showgui = true;
    if (this.showgui)
    {
      this.addGUI();
    }
  }

  animate(time)
  {
    requestAnimationFrame(this.animate);

    //this.controls.update();
    this.stats.update();

    this.render();

    this.prevTime = time;
  }

  render()
  {
    this.renderer.render(this.scene, this.activeCamera);
  }
  resize()
  {
    const {clientHeight, clientWidth} = this.el.parentElement;

    this.defaultCamera.aspect = clientWidth / clientHeight;
    this.defaultCamera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
  }

  load(scenes, finishCallback)
  {
    var scope = this;
    this.slmLoader.LoadScene(scenes, function(slmScene, _tag)
    {
      console.log('get scene: ' + _tag);
      scope.addSceneModel(slmScene);
    }, function()
    {
      console.log('all scene loaded');
      if (finishCallback)
      {
        finishCallback();
      }
    });
  }
  addSceneModel(sceneModel)
  {
    if (!this.sceneRootNode)
    {
      this.sceneRootNode = new Object3D()
      this.uniformScene(sceneModel, 50)
      this.scene.add(this.sceneRootNode)
    }
    this.sceneRootNode.add(sceneModel)
  }

  uniformScene(sceneModel, _uniforSize)
  {
    // Uniform model
    var uniformSize = _uniforSize ? _uniforSize : 20;
    var objBox3 = new Box3().setFromObject(sceneModel);

    var centerOffset = new Vector3();
    centerOffset.x = -(objBox3.min.x + objBox3.max.x) * 0.5;
    centerOffset.y = -(objBox3.min.y + objBox3.max.y) * 0.5;
    centerOffset.z = -(objBox3.min.z + objBox3.max.z) * 0.5;

    var maxSize = Math.max((objBox3.max.x - objBox3.min.x), Math.max((objBox3.max.y - objBox3.min.y), (objBox3.max.z - objBox3.min.z)));
    var scale = uniformSize / maxSize;

    this.sceneRootNode.scale.x = scale;
    this.sceneRootNode.scale.y = scale;
    this.sceneRootNode.scale.z = scale;

    this.sceneRootNode.translateX(centerOffset.x * scale);
    this.sceneRootNode.translateY(centerOffset.y * scale);
    this.sceneRootNode.translateZ(centerOffset.z * scale);
  }

  setupScene()
  {
    this.setCamera();
    this.addLights();
    window.content = this.content;
  }

  setCamera()
  {
    /*
    this.controls.reset();
    this.controls.target = new Vector3(0.0, -5.0, 0.0);
    this.controls.enabled = true;
    this.controls.saveState();
    c.position.set(134.6,328.2,-21.02861120589466)
    c.rotation.set(-1.5707963064903674,-9.997938418828124e-7,-1.5504904)
    */

    if(this.isMobile())
      this.defaultCamera.position.set(132.75817000392195,356.7419288565205,-466.723963464357)
    else
      this.defaultCamera.position.set(135.24233238260777,109.30062057928643,-146.112628831086)
    this.defaultCamera.rotation.set(-2.4842976482841435,-0.006133772730281253,-3.1368587975753)

    //this.defaultCamera.lookAt(new Vector3());
    window.c=this.defaultCamera;
    //this.activeCamera = this.defaultCamera;
    new PlayerControl(this.activeCamera)

    //开始设置自动漫游
    window.myMoveManager = new PreviewManager(window.c).myMoveManager;
    //window.myMoveManager.stopFlag = false;
    //完成自动漫游设置
  }
  addLights ()
  {
    var directionalLight  = new DirectionalLight(0xFFFFFF, 2.5);
    //directionalLight.rotation.set(Math.PI/2,0,0)
    //0.5,1.2,0.5
    directionalLight.position.set(0.5,1.2,0.5);//0.5,1.2,10.5
    this.scene.add(directionalLight);
    var directionalLight2  = new DirectionalLight(0xFFFFFF, 1);
    directionalLight2.position.set(0.5,1.2,-10.5);//0.5,1.2,10.5
    this.scene.add(directionalLight2);

    const spotLight = new SpotLight( 0xffffff );
    this.scene.add( spotLight );
    setInterval(()=>{
      spotLight.position.copy(this.defaultCamera.position)
    },100)
  }

  addGUI()
  {
    //const gui = this.gui = new GUI({autoPlace: false, width: 260, hideable: true});
    const gui = this.gui = new GUI({autoPlace: true, width: 260, hideable: false});
    window.gui=gui

    const perfFolder = gui.addFolder('Performance');
    const perfLi = document.createElement('li');
    this.stats.dom.style.position = 'static';
    perfLi.appendChild(this.stats.dom);
    perfLi.classList.add('gui-stats');
    perfFolder.__ul.appendChild( perfLi );

    const guiWrap = document.createElement('div');
    this.el.appendChild( guiWrap );
    guiWrap.classList.add('gui-wrap');
    guiWrap.appendChild(gui.domElement);
    gui.open();

    //var parent=document.getElementsByClass("gui-wrap")
    //getElementByid(id);
    var parent=document.getElementsByClassName("gui-stats")[0].parentElement;
    parent.style.opacity=0.7;
    //添加视角切换
    var viewPoint=[
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
    window.viewPoint=viewPoint;
    for(var i=0;i<viewPoint.length;i++){
      var obj = document.createElement('div');
      obj.innerHTML=viewPoint[i].name
      obj.style.color = 'black';
      obj.myid=i
      parent.appendChild(obj)
      obj.onclick=function(){
        var n=this.myid
        var c=window.c
        var p=window.viewPoint[n]
        var myMove=new window.MoveManager(c,[
          [
            c.position.x,
            c.position.y,
            c.position.z,
            c.rotation.x,
            c.rotation.y,
            c.rotation.z,
            30
          ],
          [p.x,p.y,p.z,p._x,p._y,p._z,10]
        ])
        myMove.isLoop=false
        myMove.stopFlag=false
        window.myMoveManager.stopFlag=true
        document.getElementById("autoPath").innerHTML="自动漫游"
        //c.position.set(p.x,p.y,p.z)
        //c.rotation.set(p._x,p._y,p._z)
      }
    }
    //添加自动漫游
    var obj2 = document.createElement('div');
    obj2.innerHTML="自动漫游"
    obj2.style.color = 'red';
    obj2.id="autoPath"
    obj2.stopFlag=window.myMoveManager.stopFlag
    parent.appendChild(obj2)
    obj2.onclick=function(){
      this.stopFlag=!this.stopFlag;
      window.myMoveManager.stopFlag=this.stopFlag
      if(this.stopFlag)this.innerHTML="打开自动漫游"
      else this.innerHTML="关闭自动漫游"
    }

    var ui=new MyUI()
    var width=window.innerWidth
    var height=window.innerHeight
    new ui.Button("主视角", "#D4D80B", '#09AAB9', '#01DFD7',
        (width/10)/6, 150,
        width/10, (width/10)/4,
        0,height- (width/10)/2,(b)=>{
          console.log("dianji")
        });
    //开始添加视角切换
    viewPoint=[
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
    for(var i=0;i<viewPoint.length;i++)
      new ui.Button(viewPoint[i].name, "#3498DB", '#2980B9', '#01DFD7',
          (width/10)/6, 150,
          width/10, (width/10)/4,
          (i+1)*width/10,height- (width/10)/2,(b)=>{
            var n=b.myid
            console.log(b)
            console.log(n)
            var c=window.c
            var p=viewPoint[n]
            var myMove=new window.MoveManager(c,[
              [
                c.position.x,
                c.position.y,
                c.position.z,
                c.rotation.x,
                c.rotation.y,
                c.rotation.z,
                30
              ],
              [p.x,p.y,p.z,p._x,p._y,p._z,10]
            ])
            myMove.isLoop=false
            myMove.stopFlag=false
            window.myMoveManager.stopFlag=true
            document.getElementById("autoPath").innerHTML="自动漫游"
          }).element.myid=i
    //完成添加视角切换

    var b=new ui.Button("自动漫游", "#FF98DB", '#F980B9', '#01DFD7',
        (width/10)/6, 150,
        width/10, (width/10)/4,
        6*width/10,height- (width/10)/2,(b)=>{
          window.myMoveManager.stopFlag=b.stopFlag
          if(b.stopFlag)b.innerHTML="自动漫游-关"
          else b.innerHTML="自动漫游-开"
          b.stopFlag=!b.stopFlag;
        });
    b.stopFlag=window.myMoveManager.stopFlag
  }

  startAllPoint(){
    /*var min=[-30,-23,-80],
        max=[334,17,35],
        step=[10,10,10];
    */
    var min=[-30,-23,-80],
        max=[335,20,35],
        step=[5,5,5];
        //step=[0.1,0.1,0.1];

    var scope=this
    console.log(scope)
    //Up and down, left and right, front and
    // rear 0,0,0

    /*
    //Up and down, left and right, front and
    //rear right
    c.rotation.set(0,0,0)
    c.rotation.set(0,Math.PI/2,0);
    c.rotation.set(0,Math.PI,0);
    c.rotation.set(0,3*Math.PI/2,0);

    c.rotation.set(Math.PI/2,0,0)
    c.rotation.set(-Math.PI/2,0,0)*/

    var c=window.c
    c.position.set(min[0],min[1],min[2])
    c.rotation.set(0,0,0)
    myStart("a",()=>{
      c.rotation.set(0,Math.PI/2,0)
      myStart("b",()=>{
        c.rotation.set(0,Math.PI,0)
        myStart("c",()=>{
          c.rotation.set(0,3*Math.PI/2,0)
          myStart("d",()=>{
            c.rotation.set(Math.PI/2,0,0)
            myStart("e",()=>{
              c.rotation.set(-Math.PI/2,0,0)
              myStart("f",()=>{
                console.log("finish:all")
              })
            })
          })
        })
      })
    })
    function myStart(name,cb) {
      var position=window.c.position
      window.a(name+";"+position.x+","+position.y+","+position.z+";.json")
      window.c.position.x+=step[0]
      if(window.c.position.x>max[0]){
        window.c.position.x=min[0]
        window.c.position.y+=step[1]
        if(window.c.position.y>max[1]){
          window.c.position.y=min[1]
          window.c.position.z+=step[2]
          if(window.c.position.z>max[2]){
            console.log("finish:",name)
            c.position.set(min[0],min[1],min[2])
            cb()
            return
          }

        }
      }
      requestAnimationFrame(()=>myStart(name,cb))
    }
  }
  analysis(name){
    var canvas=renderer.domElement;
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    context.drawImage(canvas, 0, 0);

    var data=context.getImageData( 0, 0, canvas.width, canvas.height).data
    var result={}
    for(var i=0;i<data.length/4;i++){
      var r=data[4*i]
      var g=data[4*i+1]
      var b=data[4*i+2]
      var id=(r*256+g)*256+b
      if(result[id])result[id]++
      else result[id]=1
    }

    var str=JSON.stringify(result , null, "\t")
    var link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
    link.download =name?name:"test.json";
    link.click();

    return result;
  }
  isMobile() {
    var userAgentInfo = navigator.userAgent;
    //alert(userAgentInfo)
    var mobileAgents = [ "Android", "iPhone", "SymbianOS", "Windows Phone", "iPad","iPod"];
    var mobile_flag = false;
    //根据userAgent判断是否是手机
    for (var v = 0; v < mobileAgents.length; v++) {
      if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
        mobile_flag = true;
        break;
      }
    }
    return mobile_flag
  }
}
