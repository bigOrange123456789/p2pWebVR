import {
	Vector3,
	Matrix4,
	Color,
	Vector4,
	FileLoader,
	LoadingManager,
	Object3D,
	InstancedMeshEx,
  } from './three/build/three';
import { GLTFLoaderEx } from './three/examples/jsm/loaders/GLTFLoaderEx.js';
import { DRACOLoader } from '../lib/three/examples/jsm/loaders/DRACOLoader.js';
import {ZipLoader } from './ziploader.js';
import {SLMSceneMeta } from './SLMSceneMeta.js';

var SLMLoader = function(options)
{
	var scope = this;

	this.MaxColorIdStep = (options && options.MaxColorIdStep !== undefined) ? options.MaxColorIdStep : 40;

	this.EnablePicking = (options && options.EnablePicking !== undefined) ? options.EnablePicking : false;

	this.sceneMetas = [];

	this.totalElementCount = 0;

	this.pickingIdToSceneMeta = {};

	this.sceneTasks= [];
	this.GetTotalElementCount = function()
	{
		return this.totalElementCount;
	}

	this.AddScene = function(slmSceneMeta)
	{
		this.sceneMetas.push(slmSceneMeta);

		this.totalElementCount += slmSceneMeta.GetElementCount();

		for (var i = 0; i < slmSceneMeta.elementPickingIds.length; ++i)
		{
			this.pickingIdToSceneMeta[slmSceneMeta.elementPickingIds[i]] = this.sceneMetas[this.sceneMetas.length - 1];
		}
	}

	this.GetMetaFromPickingId = function(elementPickingId)
	{
		return this.pickingIdToSceneMeta[elementPickingId];
	}

	this.GetElementDesc = function(elementPickingId)
	{
		return this.pickingIdToSceneMeta[elementPickingId].GetElementDesc(elementPickingId);
	}

	this.GetElementMatrix = function(elementPickingId)
	{
		return this.pickingIdToSceneMeta[elementPickingId].GetElementMatrix(elementPickingId);
	}

	this.GetElementGroupMatrix = function(elementPickingId)
	{
		return this.pickingIdToSceneMeta[elementPickingId].GetElementGroupMatrix(elementPickingId);
	}

	this.GetElementBoundsCenter = function(elementPickingId)
	{
		var elemDesc = this.GetElementDesc(elementPickingId);
		var elementSrcId = elemDesc.sId;

		var meta = this.GetMetaFromPickingId(elementPickingId);
    	var center = new Vector3(meta.srcMeshGeoInfo[elementSrcId].c[0], meta.srcMeshGeoInfo[elementSrcId].c[1], meta.srcMeshGeoInfo[elementSrcId].c[2]);

    	center.applyMatrix4(this.GetElementMatrix(elementPickingId));

    	return center;
	}

	this.GetElementProperty = function(elementPickingId)
	{
		return this.pickingIdToSceneMeta[elementPickingId].GetElementProperty(elementPickingId);
	}

	// Geometry interaction
	this.RotateAroundPoint = function(elementPickingId, pointWoldPosition, axis, radian)
	{
		var mat0 = new Matrix4();
		mat0.multiply(this.GetElementMatrix(elementPickingId)).multiply(this.GetElementGroupMatrix(elementPickingId));

		var xAxis = axis.normalize();

		var trans0 = new Matrix4().makeTranslation(pointWoldPosition.x, pointWoldPosition.y, pointWoldPosition.z);
		var rot = new Matrix4().makeRotationAxis(xAxis, radian);
		var trans1 = new Matrix4().makeTranslation(-pointWoldPosition.x, -pointWoldPosition.y, -pointWoldPosition.z)

		var mat1 = new Matrix4();
		mat1.multiply(trans0).multiply(rot).multiply(trans1);

		var finalMat = new Matrix4();
		finalMat.multiply(mat1).multiply(mat0);

		var elemDesc = this.GetElementDesc(elementPickingId);
		elemDesc.mesh.setInstanceMatrixAt(elemDesc.gId, elemDesc.iId, finalMat);

		elemDesc.mesh.instanceMatrices[elemDesc.gId].needsUpdate = true;
	}

	this.RotateElement = function(elementPickingId, axis, radian)
	{
		var mat0 = new Matrix4();
		mat0.multiply(this.GetElementMatrix(elementPickingId)).multiply(this.GetElementGroupMatrix(elementPickingId));

		var center = this.GetElementBoundsCenter(elementPickingId);

		var xAxis = axis.normalize();

		var trans0 = new Matrix4().makeTranslation(center.x, center.y, center.z);
		var rot = new Matrix4().makeRotationAxis(xAxis, radian);
		var trans1 = new Matrix4().makeTranslation(-center.x, -center.y, -center.z)

		var mat1 = new Matrix4();
		mat1.multiply(trans0).multiply(rot).multiply(trans1);

		var finalMat = new Matrix4();
		finalMat.multiply(mat1).multiply(mat0);

		var elemDesc = this.GetElementDesc(elementPickingId);
		elemDesc.mesh.setInstanceMatrixAt(elemDesc.gId, elemDesc.iId, finalMat);

		elemDesc.mesh.instanceMatrices[elemDesc.gId].needsUpdate = true;
	}

	this.TranslateElement = function(elementPickingId, translation)
	{
		var mat0 = new Matrix4();
		mat0.multiply(this.GetElementMatrix(elementPickingId)).multiply(this.GetElementGroupMatrix(elementPickingId));

		var trans0 = new Matrix4().makeTranslation(translation.x, translation.y, translation.z);

		var mat1 = new Matrix4();
		mat1.multiply(trans0)

		var finalMat = new Matrix4();
		finalMat.multiply(mat1).multiply(mat0);

		var elemDesc = this.GetElementDesc(elementPickingId);
		elemDesc.mesh.setInstanceMatrixAt(elemDesc.gId, elemDesc.iId, finalMat);

		elemDesc.mesh.instanceMatrices[elemDesc.gId].needsUpdate = true;
	}

	this.EncodeElementPickingId = function(elementPickingId, isPicked)
	{
	  // Maximum count: 256 * 256 * 256 / 40
	  var idColor = new Color(elementPickingId * this.MaxColorIdStep);
	  return new Vector4(idColor.r, idColor.g , idColor.b, isPicked ? 1.0 : 0.0);
	}

	this.DecodeElementPickingId = function(pickedId)
	{
		var elementPickingId = pickedId / this.MaxColorIdStep;

		return elementPickingId;
	}

	this.PushSceneTask = function(params)
	{
		this.sceneTasks.push(params);
	}

	this.BuildScene = function()
	{
		for (var i = 0 ; i < this.sceneTasks.length; ++i)
		{
			var sceneBuilder = new SLMSceneBuilder(this);
			sceneBuilder.BuildScene(this.sceneTasks[i]);
		}
	}

	this.LoadScene = function(scenes, singleSceneCallback, allScenesCallback, isSync)
	{
		function eachSceneCallback(slmScene, sceneTag)
		{
			if (singleSceneCallback)
			{
				singleSceneCallback(slmScene, sceneTag);
			}

			scope.multiSceneCounter++;

			if (scope.multiSceneCounter >= scope.multiScenes.length)
			{
				if (allScenesCallback)
				{
					allScenesCallback();
				}

				scope.BuildScene();
			}
		}

		if (Array.isArray(scenes))
		{
			this.multiScenes = scenes;
			this.multiSceneCounter = 0;

			for (var i = 0 ; i < scenes.length; ++i)
			{
				var slmSceneParser = new SLMSceneParser(this);

				slmSceneParser.load(scenes[i], eachSceneCallback, '', isSync);
			}
		}
		else
		{
			this.multiScenes = [scenes];
			this.multiSceneCounter = 0;

			var slmSceneParser = new SLMSceneParser(this);

			slmSceneParser.load(scenes, eachSceneCallback, '', isSync);
		}
	}
}

var SLMSceneBuilder = function(sceneMgr)
{
	var scope = this;

	this.sceneMgr = sceneMgr;

	function InstanceNode(gltfScene, iMatrix, structDesc, geoInfo, propInfo)
	{
		var slmSceneMeta = new SLMSceneMeta(scope.sceneMgr, {geoInfo: geoInfo, propInfo: propInfo});
		scope.sceneMgr.AddScene(slmSceneMeta);//注释掉这句似乎对渲染效果没有影响

		var instanceMatrixMap = iMatrix;
		var structDescription = structDesc;

		var instanceRoot = new Object3D();//根对象，其它的解析后的实例化网格都会被添加到这里
		gltfScene.add(instanceRoot);
		var rootGroupNode = gltfScene.children[0];
		//var meshNodeList = (gltfScene.children.length === structDescription.length) ? gltfScene.children : rootGroupNode.children;
		var isSelfContained = scope.sceneMgr.EnablePicking;
		//开始 //meshNodeList.length === structDescription.length

		//console.log("gltfScene",gltfScene.children[0].children)
		console.log("gltfScene",gltfScene)

		var m1=gltfScene.children[0].children[0];
		var m2=processMesh(m1,structDescription[0],slmSceneMeta,rootGroupNode.matrix,instanceMatrixMap,isSelfContained)
		instanceRoot.add(m2)// if (isSelfContained)
		m1.visible = false;

		test(1)
		function test(meshIndex) {
			loadSubZip("assets/models/JinAo/output"+meshIndex+".zip", (gltf)=>{
				var group=gltf.scene.children[0];
				var myMeshEx1=group.children[0];
				instanceRoot.add(myMeshEx1)
				var myMeshEx2=processMesh(myMeshEx1,structDescription[meshIndex],slmSceneMeta,rootGroupNode.matrix,instanceMatrixMap,isSelfContained)
				instanceRoot.add(myMeshEx2)// if (isSelfContained)
				myMeshEx1.visible = false;
				if(meshIndex+1<structDescription.length)test(meshIndex+1)
			})
		}
		//完成
	}
	function processMesh(//对自定义的MeshEx对象逐个处理
		node,//MeshEx
		groupStruct,//大mesh结构
		slmSceneMeta,
		parentMatrix,//父节点的世界变换矩阵
		instanceMatrixMap,//存储了所有构件的实例化矩阵
		isSelfContained//实例化对象是否包含原本的个体
	){
		var groups = [];
		var instanceCountList = [];
		var materialList = [];

		var clonedMaterial = node.material.clone();


		for (var i = 0; i < groupStruct.length ; ++i)
		{//遍历所有的实例组对象 //逐组加载
			var instanceCount = instanceMatrixMap[groupStruct[i].n].it.length + (isSelfContained ? 1 : 0);
			//instanceCount：实例化对象的构件个数
			//instanceMatrixMap[组].it ：
			instanceCountList.push(instanceCount);
			materialList.push(clonedMaterial);
			groups.push({
				start: groupStruct[i].s,
				count: groupStruct[i].c,
				instanceCount: instanceCount,
				name: groupStruct[i].n
			});
		}
		{
			var instancedMesh = new InstancedMeshEx(node.geometry, materialList, 1, instanceCountList);
			//自定义的用于实例化的对象 InstancedMeshEx
			instancedMesh.geometry.clearGroups();

			var instanceCounter = 0;

			for (var groupIndex = 0; groupIndex < groups.length ; ++groupIndex)
			{
				var group = groups[groupIndex];
				var instance = instanceMatrixMap[group.name].it;
				var instancedElemIds = instanceMatrixMap[group.name].id;
				//if (instance.length > 0)//如果是采用了实例化的对象
				{//将网格添加到场景中
					instanceCounter++;

					instancedMesh.geometry.addGroupInstanced(group.start * 3, group.count * 3, groupIndex, groupIndex);

					var totalInstanceLength = instance.length + (isSelfContained ? 1 : 0);
					for (var subInstanceIndex = 0; subInstanceIndex < totalInstanceLength; subInstanceIndex++)
					{
						var mat4 = null;

						var backupMat = new Matrix4();

						var elementId = 0;
						var instanceMatrix = new Matrix4();
						if (isSelfContained && subInstanceIndex === instance.length)
						{
							mat4 = instanceMatrix.multiply(parentMatrix);
							// Source element
							elementId = parseInt(group.name);
						} else {
							var mat = instance[subInstanceIndex];
							instanceMatrix.set(
								mat[0], mat[1], mat[2], mat[3],
								mat[4], mat[5], mat[6], mat[7],
								mat[8], mat[9], mat[10], mat[11],
								0, 0, 0, 1);
							backupMat.set(
								mat[0], mat[1], mat[2], mat[3],
								mat[4], mat[5], mat[6], mat[7],
								mat[8], mat[9], mat[10], mat[11],
								0, 0, 0, 1);
							mat4 = instanceMatrix.multiply(parentMatrix);
							// Instanced element
							elementId = instancedElemIds[subInstanceIndex];
						}

						instancedMesh.setInstanceMatrixAt(groupIndex, subInstanceIndex, mat4);

						slmSceneMeta.SetElementDesc(elementId, {mesh: instancedMesh, gId: groupIndex, iId: subInstanceIndex, sId: group.name});
						slmSceneMeta.SetElementMatrix(elementId, backupMat.clone());
						slmSceneMeta.SetElementGroupMatrix(elementId, parentMatrix.clone());
					}

				}
			}
			if (instanceCounter > 0)
			{//这里基本上一定会被执行
				return instancedMesh;//instanceRoot.add(instancedMesh);//instancedMesh是重构后的网格
			}
		}
	}//完成processMesh()

	this.BuildScene= function(task)//SLMSceneBuilder下
	{
		console.log("task",task)
		InstanceNode(task.gltfScene, task.iMatrix, task.structDesc, task.geoInfo, task.propInfo);
	}
}

function SLMSceneParser(sceneMgr)
{
	var scope = this;
	this.sceneMgr = sceneMgr;
	this.finishCallback = null;
	var loadingManager = new LoadingManager();
	loadingManager.setURLModifier((url, path) =>
	{
		return (path || '') + url;
	});
	loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal )
	{
		//console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	};
	function loadJsonList(targetScene, urls, mananger, callback)
	{
		var dataList = [];
		var counter = 0;
		var urlList = urls;

		function addLoad(data)
		{
			dataList.push(data);

			counter++;

			//console.log(data);
			if (counter < urlList.length)
			{
				loadUrl(urlList[counter], loadingManager);
			}
			else
			{
				if (callback)
				{
					callback(targetScene, dataList);
				}
			}
		}

		function loadUrl(url, manager)
		{
			if (url)
			{
				var loader = new FileLoader(manager);
				loader.load(url , function(data)
				{
					addLoad(JSON.parse(data));
				}, null, function()
				{
				addLoad(null);
				});
			}
			else
			{
				addLoad(null);
			}
		}

		loadUrl(urlList[counter], loadingManager);
	}
    function loadScene(configJson)
	{
		const loader = new GLTFLoaderEx(loadingManager);
		loader.setCrossOrigin('anonymous');
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( 'lib/draco/' );
		//loader.setDRACOLoader( dracoLoader );
		const blobURLs = [];
		loader.load(configJson.fileUrl, (gltf) => {//解析模型资源
			const scene = gltf.scene || gltf.scenes[0];
			blobURLs.forEach(URL.revokeObjectURL);//此句被注释对程序无影响 //这里blobURLs貌似就是一个空数组
			if (configJson.matrixDesc && configJson.structDesc)
			{
				loadJsonList(scene, [configJson.matrixDesc, configJson.structDesc, configJson.geoInfo, configJson.propInfo], loadingManager, function(targetScene, dataList)
				{
					//only(0)
					function only(k){
						window.structdesc=dataList[1];
						targetScene.children[0].children=[targetScene.children[0].children[k]]
						dataList[1]=[dataList[1][k]]
					}
					scope.sceneMgr.PushSceneTask(
						{
							gltfScene: targetScene,
							iMatrix: dataList[0],
							structDesc: dataList[1],
							geoInfo: dataList[2],
							propInfo: dataList[3]
						}
					);
					if (scope.finishCallback)
						scope.finishCallback(scene, scope.sceneTag);
				});
			}
		},
		function(xhr) {}, null);
	}

	this.load = function(url, finishCallback, sceneTag)
	{
		this.finishCallback = finishCallback;
		this.sceneTag = sceneTag;
		return new Promise((resolve, reject) => {
			if (url.toLowerCase().endsWith('.zip'))
			{
				new Promise( function( resolve, reject ) {
					if ( url.match( /\.zip$/ ) ) {//如果url里面有“.zip”字段
						//加载资源压缩包
						new ZipLoader().load( url , function ( xhr )
						{//updateProgressBar(( xhr.loaded / xhr.total * 100 ).toFixed(1), 'loading...');
						}).then( function( zip )//解析压缩包
						{
							loadingManager.setURLModifier( zip.urlResolver );
							var geoInfos = zip.find('geoinfo.json');//几何信息
							var propInfos = zip.find('properties.json');//资源信息

							resolve({//查看文件是否存在？以及路径
								fileUrl: zip.find( /\.(gltf|glb)$/i )[0],
								matrixDesc: zip.find('smatrix.json')[0],
								structDesc: zip.find('structdesc.json')[0],
								geoInfo: geoInfos.length > 0 ? geoInfos[0]:null,
								propInfo: propInfos.length > 0 ? propInfos[0]:null
							});
						} );

					} else
					{
						resolve( url );
					}

				} ).then( function ( configJson )
				{
					loadScene({
						fileUrl: configJson.fileUrl,
						matrixDesc: configJson.matrixDesc,
						structDesc: configJson.structDesc,
						geoInfo: configJson.geoInfo,
						propInfo: configJson.propInfo,
						isFromZip: true});

					/*
					fileUrl: "blob:./output.glb"
					geoInfo: "blob:./geoinfo.json"
					isFromZip: true
					matrixDesc: "blob:./smatrix.json"
					propInfo: null
					structDesc: "blob:./structdesc.json"
					*/
				} );
			}
			else
			{
				loadScene({fileUrl: url});
			}
		});
	}

}
function loadSubZip (url, back) {//assets\models\SAM_Review_1\output1.zip
	var loader=new LoadingManager()
	new Promise( function( resolve, reject ) {
		//加载资源压缩包
		new ZipLoader().load( url).then( ( zip )=>{//解析压缩包
			loader.setURLModifier( zip.urlResolver );//装载资源
			resolve({//查看文件是否存在？以及路径
				fileUrl: zip.find( /\.(gltf|glb)$/i )[0]
			});
		} );
	} ).then( function ( configJson ) {
		new GLTFLoaderEx(loader).load(configJson.fileUrl, (gltf) => {//解析模型资源
			if(back)back(gltf)
		});
	} );
}
function myParse(gltf,json){

}
export { SLMLoader }
