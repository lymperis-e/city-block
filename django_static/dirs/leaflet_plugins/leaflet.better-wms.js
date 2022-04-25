L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);
};




L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

  options: {
    layer_id: 0,
    },  


  onAdd: function (map) {

    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getInfoJSON, this);


    //Geomeletitiki Addition: add the legend & opacity slider on layerAdd
    this.createLegend(map, this.options.layer_id);
    //this.createOpacitySlider(this, this.options.layer_id)

    //Add the overlay to the actives dict
    activeOverlaysDict[this.options.layers] = this
    console.log(activeOverlaysDict)
  },

  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
    //Geomeletitiki Addition: remove the legend on layerREmove
    this.wmsLegend.getContainer().parentElement.remove()
    map.removeControl(this.wmsLegend)

    //par.innerHTML = ""
    //delete slider
  },

    


  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); } // do nothing if there's an error

    //Check the response. If the click point is not a feature, return the normal point coordinates popup
    if (String(content).includes('<table class="featureInfo">')) {
      L.popup({ maxWidth: 800 })
        .setLatLng(latlng)
        .setContent(content)
        .openOn(this._map);
    }
  },












  //GeomelAdditions
  createLegend: function (mapElement, layer_id) {
    let param = {
      request: 'GetLegendGraphic',
      service: 'WMS',
      srs: 'EPSG:4326',
      version: this.wmsParams.version,
      format: 'image/png',
      height: 81,
      width: 200,
      layer: this.wmsParams.layers
    };

    let url = this._url + L.Util.getParamString(param, this._url, true);

    //console.log(`url: ${url}`)
    this.wmsLegend = new L.wmsLegend(url, mapElement, layer_id)


    //Addition #2: Add the legend on the -legend item of the page
    legendContainer = document.getElementById("legend-container")
    li = document.createElement('li');
    li.id = `legend-${layer_id}`

    legendContainer.appendChild(li)

    changeLegendParent(this.wmsLegend, `legend-${layer_id}`);
  },



  //createOpacitySlider: function (oper_layer, layer_id) {
  //  par = document.getElementById(`slider-container-${layer_id}`);
  //  par.innerHTML = `<input id='layer_${String(layer_id)}_opacity' data-slider-id='layer_${String(layer_id)}_opacity' type='text' data-slider-min='0' data-slider-max='1' data-slider-step='0.05' data-slider-value='1'/>`
  //
  //
  //  slider = new Slider(`#layer_${String(layer_id)}_opacity`, {
  //    formatter: function (value) {
  //      oper_layer.setOpacity(value);
  //      return value;
  //    }
  //  });
  //},


  


});











/////////////////////////////////
/* MOVE LAYER CONTROL OUT OF LEAFLET, and inside the sidebar */
function changeLegendParent(leafletControl, parentElementId) {
  var htmlObject = leafletControl.getContainer();
  
  // Get the desired parent node.
  var a = document.getElementById(parentElementId);
  console.log(a)
  
  // Finally append that node to the new parent.
  function setParent(el, newParent) {
    newParent.appendChild(el);
  }
  setParent(htmlObject, a);

  //The line below deletes all the default rendering of the layer control
  a.children[0].className = ""


};


