function SLMSceneMeta(slmSceneMgr, options)
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
}
export { SLMSceneMeta }
