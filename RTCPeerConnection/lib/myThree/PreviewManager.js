import {MoveManager} from './MoveManager.js';
class PreviewManager{
    //myMoveManager;
    constructor(camera){
        window.MoveManager=MoveManager;
        //自动漫游路径
        var roamPath = //x         y      z      angel       time  展板编号  展板初始旋转(单位是90度)
            [
                [0,0,0,0,0,0,80],
                [
                    -175.73960223965133,
                    95.11348685582311,
                    -86.8954547893198,
                    -2.075098561615198,
                    -1.0455399448723508,
                    -2.1386131811034006,
                    40
                ],
                [
                    0,
                    80,
                    -30,
                    -2.075098561615198,
                    -1.0455399448723508,
                    -2.1386131811034006,
                    30
                ],
                /*[
                    51.253596141233885,
                    20.882728315214933,
                    31.365400815476647,
                    -0.6331476951579518,
                    -0.04745786869989127,
                    -0.03480442059247643,
                    30
                ],*/
                [
                    308.2068565421858,
                    7.149334462394259,
                    -38.646677597726885,
                    2.9967097063821644,
                    1.1414646082446573,
                    -3.009699291404491,
                    40
                ],
                [
                    406.5279206150515,
                    -19.096927223709248,
                    -46.288709474554466,
                    2.729180655431183,
                    1.2716574368531888,
                    -2.7456041224801266,
                    40
                ],
                [
                    150,
                    -50,
                    -80,
                    2.729180655431183,
                    1.2716574368531888,
                    -2.7456041224801266,
                    30
                ],
                [
                    -111.91957398067876,
                    -130.08143055080296,
                    -107.29699759938026,
                    2.2778064967897245,
                    -0.9116546376802771,
                    2.3949777567689488,
                    40
                ],
                /*[
                    41.996806018661765,
                    19.015569339209502,
                    -59.86656212247878,
                    -1.5600904495710384,
                    -0.7304345314448786,
                    -1.5547509524299499,
                    40
                ],
                [
                    61.77293250129644,
                    2.6964473215080886,
                    -58.81306357186747,
                    -1.4378660059186799,
                    -0.9134285500500002,
                    -1.403454502012842,
                    40
                ],*/
                [
                    84.5404003899865,
                    -5.394831460051256,
                    -59.659901578942225,
                    -3.0474135088147367,
                    -0.24669423237847668,
                    -3.1185299937369657,
                    40
                ],
                [
                    86.89625556682655,
                    -5.168332280059367,
                    -9.296195695134935,
                    -0.5374243261845169,
                    -1.3483046661385338,
                    -0.5265145131782933,
                    80
                ],
                [
                    154.34364415762414,
                    -3.9529678061822113,
                    -9.419370542489418,
                    -0.17882517442319773,
                    0.2522429439884353,
                    0.04508190819259827,
                    80
                ],
                [
                    147.28032350417843,
                    -3.449006717199394,
                    -17.633792269979253,
                    -1.5050587817907648,
                    1.0276101573519463,
                    1.494046318819792,
                    80
                ],
                [
                    127.42974114565517,
                    -12.365618920591828,
                    -19.2232266357129,
                    -1.8911092669780496,
                    1.2324050254809065,
                    1.908967536916471,
                    80
                ],
                [
                    120.37539385083313,
                    -12.948235633786934,
                    -12.889955508660297,
                    -0.8588715156671196,
                    1.4416483068864012,
                    0.8547326478427477,
                    80
                ],
                [
                    78.69563536145994,
                    -12.449483744542327,
                    -13.050468691128698,
                    -2.1351509105819173,
                    1.3665158728316376,
                    2.144689107142644,
                    80
                ],
                [
                    71.5185609733091,
                    -11.24654483008693,
                    -16.305935337199692,
                    -1.028077007122636,
                    0.34042082652588185,
                    0.5055900789392798,
                    80
                ],
                [
                    71.30781022180679,
                    -9.214422612950774,
                    -22.331174291381444,
                    -1.1287461167414423,
                    0.22756238302662476,
                    0.4448125084306466,
                    80
                ],
                [
                    69.11042677523078,
                    -11.928234534698138,
                    -28.04177898345748,
                    -2.6130632644825407,
                    -1.1086452415117634,
                    -2.659962223009758,
                    80
                ],
                [
                    293.4252428218626,
                    -14.748276323162326,
                    -31.316222804600816,
                    3.116601216601892,
                    0.5434843188478509,
                    -3.1286670754561055,
                    80
                ],
                [
                    289.3336345326508,
                    -14.70731783597429,
                    -26.395139183081827,
                    0.753268510709509,
                    1.5395090101050415,
                    -0.7530242557479097,
                    80
                ],
                [
                    285.3047383649307,
                    -11.693569659039149,
                    -25.719882039499847,
                    -2.040193397654212,
                    1.1742884529451474,
                    2.073539008734841,
                    80
                ],
                [
                    288.50908731165725,
                    -10.019689660962424,
                    -25.083070167852224,
                    -2.7716778879622765,
                    0.412299796972689,
                    2.9874411397430536,
                    80
                ]
            ]

        //console.log(camera)
        //console.log(camera)
        roamPath[0]=[
            camera.position.x,
            camera.position.y,
            camera.position.z,
            camera.rotation.x,
            camera.rotation.y,
            camera.rotation.z,
            80]
        var scope=this;
        //scope.myVideoManager=myVideoManager;
        scope.myMoveManager=new MoveManager(camera,roamPath);

        window.myPathSave=[]
        window.s=scope.save;
        window.d=scope.download;
    }
    save(){
        var c=window.c
        var p=c.position
        //var r=c.rotation
        var arr=[
            p.x,p.y,p.z,
            c.rotation.x,
            c.rotation.y,
            c.rotation.z,
            80
        ]
        console.log(arr)
        window.myPathSave.push(arr)
    }
    download(){
        var str=JSON.stringify(window.myPathSave , null, "\t")
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(new Blob([str], { type: 'text/plain' }));
        link.download ="path.json";
        link.click();
    }
    //#cameraImg1;
    //#cameraImg2;
}
export {PreviewManager};
