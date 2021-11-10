import { Viewer } from './viewer.js';
import {P2P} from "../lib/myThree/P2P.js";
import {Detection} from "../lib/myThree/Detection.js";
class App
{
  constructor (el)
  {
    try{
      window.p2p=new P2P()
    }catch(e){
      console.log(e)
    }
    window.detection=new Detection()
    window.time0=performance.now()

    this.el = el;
    this.viewer = null;
    this.viewerEl = null;

    if (this.viewer) this.viewer.clear();
    this.createViewer();
    var parseUrlParams = function(){
      var urlParams = window.location.href;
      var vars = {};
      var parts = urlParams.replace(/[?&]+([^=&]+)=([^&]*)/gi,
          function (m, key, value) {
              vars[key] = decodeURIComponent(value);
          });
      return vars;
    }

    var paramJson = parseUrlParams();
    var scenes = 'assets\\models\\SAM_Review_1.zip';

    if (paramJson.scene)
    {
      scenes = 'assets\\models\\' + paramJson.scene + ".zip";
    }
    //var scenes = 'assets\\models\\mtltest.zip';
    this.viewer.load(scenes);
  }
  createViewer()
  {
    this.viewerEl = document.createElement('div');
    this.viewerEl.classList.add('viewer');
    this.el.appendChild(this.viewerEl);
    this.viewer = new Viewer(this.viewerEl);
    return this.viewer;
  }
}

var app = null;
document.addEventListener('DOMContentLoaded', () => {
  app = new App(document.body);
});
