import {
	Vector3,
	Matrix4,
	Color,
	Vector4,
	FileLoader,
	LoadingManager,
	Object3D,
	InstancedMeshEx,
  } from '../lib/three/build/three';
import { GLTFLoaderEx } from '../lib/three/examples/jsm/loaders/GLTFLoaderEx.js';
import { DRACOLoader } from '../lib/three/examples/jsm/loaders/DRACOLoader.js';
import {ZipLoader } from './ziploader.js';

var SLMSceneMeta = function(slmSceneMgr, options)
{
	this.slmSceneMgr = slmSceneMgr;
	this.baseElementPickingId = slmSceneMgr.GetTotalElementCount();
	this.elementDesc = {};
	this.elementMatrix = {};
	this.elementMatrixGroup = {};
	this.srcMeshGeoInfo = options.geoInfo ? options.geoInfo: null;
	this.propertiesData = options.propInfo ? options.propInfo: null;
	this.elementPickingIds = [];

	this.SetElementDesc = function(elementId, desc)
	{
		this.elementDesc[elementId] = desc;
	}

	this.SetElementMatrix = function(elementId, matrix)
	{
		this.elementMatrix[elementId] = matrix;
	}

	this.SetElementGroupMatrix = function(elementId, matrix)
	{
		this.elementMatrixGroup[elementId] = matrix;
	}

	this.AddElementWitId = function(elementId)
	{
		var elementPickingId = elementId + this.slmSceneMgr.GetTotalElementCount();
		this.elementPickingIds.push(elementPickingId);
		return elementPickingId;
	}

	this.GetElementCount = function()
	{
		return this.elementPickingIds.length;
	}

	this.GetElementDesc = function(elementPickingId)
	{
		return this.elementDesc[elementPickingId - this.baseElementPickingId];
	}

	this.GetElementGroupDesc = function(elementPickingId)
	{
		var accumCounter = 0;
		for (var i = 0; i < this.propertiesData.length; ++i)
		{
			if (this.propertiesData[i].g + accumCounter >= (elementPickingId - this.baseElementPickingId))
			{
				// Collect element dess
				var elemGroupDesc = [];

				if (!this.propertiesData[i].prop["编码"])
				{
					return [];
				}

				var upbound = this.propertiesData[i].g + accumCounter;
				for (var ei = accumCounter; ei < upbound; ++ei)
				{
					elemGroupDesc.push(this.elementDesc[ei]);
				}

				return elemGroupDesc;
			}

			accumCounter += this.propertiesData[i].g;
		}

		return [];
	}

	this.GetElementMatrix = function(elementPickingId)
	{
		return this.elementMatrix[elementPickingId - this.baseElementPickingId];
	}

	this.GetElementGroupMatrix = function(elementPickingId)
	{
		return this.elementMatrixGroup[elementPickingId - this.baseElementPickingId];
	}

	this.GetElementProperty = function(elementPickingId)
	{
		var accumCounter = 0;
		for (var i = 0; i < this.propertiesData.length; ++i)
		{
			if (this.propertiesData[i].g + accumCounter >= (elementPickingId - this.baseElementPickingId))
			{
				return this.propertiesData[i].prop;
			}

			accumCounter += this.propertiesData[i].g;
		}

		return {};
	}

	this.QueryElementFromProperty = function(property)
	{
		var accumCounter = 0;

		for (var i = 0; i < this.propertiesData.length; ++i)
		{
			if (this.propertiesData[i].prop['名称'] == property.name)
			{
				return this.baseElementPickingId + accumCounter;
			}

			accumCounter += this.propertiesData[i].g;
		}

		return null;
	}
};

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

		var instanceMatrixMap = iMatrix;
		var structDescription = structDesc;

		var instanceRoot = new Object3D();
		var rootGroupNode = gltfScene.children[0];
		var meshNodeList = (gltfScene.children.length == structDescription.length) ? gltfScene.children : rootGroupNode.children;
		if(meshNodeList.length != structDescription.length)
		{
			console.error('Mesh doesnt match description!');

			console.log(gltfScene);
			console.log(meshNodeList);
			console.log(structDescription);
		}
		else
		{
			var isSelfContained = scope.sceneMgr.EnablePicking ? true : false;
			var mLength = structDescription.length;
			for (var meshIndex = 0; meshIndex < mLength ; ++meshIndex)
			{//对自定义的MeshEx对象逐个处理
				var node = meshNodeList[meshIndex];//MeshEx

				var groupStruct = structDescription[meshIndex];//结构信息
				var groups = [];
				var instanceCountList = [];
				var materialList = [];

				var clonedMaterial = node.material.clone();

				console.log("isSelfContained",isSelfContained)
				if (isSelfContained)
				{
					node.visible = false;
				}

				for (var i = 0; i < groupStruct.length ; ++i)
				{//逐组加载
					var instanceCount = instanceMatrixMap[groupStruct[i].n].it.length + (isSelfContained ? 1 : 0);
					instanceCountList.push(instanceCount);

					materialList.push(clonedMaterial);

					var group = {
						start: groupStruct[i].s,
						count: groupStruct[i].c,
						instanceCount: instanceCount,
						name: groupStruct[i].n
					};
					groups.push(group);
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

								if (isSelfContained && subInstanceIndex == instance.length)
								{
									var instanceMatrix = new Matrix4();
									mat4 = instanceMatrix.multiply(rootGroupNode.matrix);
									// Source element
									elementId = parseInt(group.name);
								}
								else
								{
									var mat = instance[subInstanceIndex];
									var instanceMatrix = new Matrix4();
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
									mat4 = instanceMatrix.multiply(rootGroupNode.matrix);
									// Instanced element
									elementId = instancedElemIds[subInstanceIndex];
								}

								instancedMesh.setInstanceMatrixAt(groupIndex, subInstanceIndex, mat4);

								slmSceneMeta.SetElementDesc(elementId, {mesh: instancedMesh, gId: groupIndex, iId: subInstanceIndex, sId: group.name});
								slmSceneMeta.SetElementMatrix(elementId, backupMat.clone());
								slmSceneMeta.SetElementGroupMatrix(elementId, rootGroupNode.matrix.clone());
							}

							//console.log(instancedMesh);
						}
					}
					if (instanceCounter > 0)
					{//这里基本上一定会被执行
						instanceRoot.add(instancedMesh);//instancedMesh是重构后的网格
					}
				}
			}
		}

		//gltfScene.add(instanceRoot);

		scope.sceneMgr.AddScene(slmSceneMeta);
	}

	this.BuildScene= function(task)
	{
		console.log(task)
		InstanceNode(task.gltfScene, task.iMatrix, task.structDesc, task.geoInfo, task.propInfo);
	}
}

var SLMSceneParser = function(sceneMgr)
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
					scope.sceneMgr.PushSceneTask(
						{
							gltfScene: targetScene,
							iMatrix: dataList[0],
							structDesc: dataList[1],
							geoInfo: dataList[2],
							propInfo: dataList[3]
						}
					);
					console.log(scope.sceneMgr)

					if (scope.finishCallback)
					{
						scope.finishCallback(scene, scope.sceneTag);
					}
				});
			}
		},
		function(xhr)
		{

		}, null);
	}

	this.load = function(url, finishCallback, sceneTag)
	{
		this.finishCallback = finishCallback;
		this.sceneTag = sceneTag;

		return new Promise((resolve, reject) => {
			if (url.toLowerCase().endsWith('.zip'))
			{
				new Promise( function( resolve, reject ) {

					if ( url.match( /\.zip$/ ) ) {
						new ZipLoader().load( url , function ( xhr )
						{
							//updateProgressBar(( xhr.loaded / xhr.total * 100 ).toFixed(1), 'loading...');
						}).then( function( zip )
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

export { SLMLoader }
