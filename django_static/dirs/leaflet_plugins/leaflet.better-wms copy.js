var nm = ''
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

  onAdd: function (map) {
    nm = String(this.layers).split(":")[1]
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getInfoJSON, this);
    //Geomeletitiki Addition: add the legend & opacity slider on layerAdd
    this.createLegend(map);
    this.createOpacitySlider(this)
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
    map.removeControl(wmsLegend)
    par.innerHTML = ""
    delete slider
  },

  getFeatureInfo: function (evt) {
    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
      showResults = L.Util.bind(this.showGetFeatureInfo, this);
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
        var err = typeof data === 'string' ? null : data;
        showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        showResults(error);
      }
    });
  },

  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
      size = this._map.getSize(),

      params = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: 'EPSG:4326',
        styles: this.wmsParams.styles,
        transparent: this.wmsParams.transparent,
        version: this.wmsParams.version,
        format: this.wmsParams.format,
        bbox: this._map.getBounds().toBBoxString(),
        height: size.y,
        width: size.x,
        layers: this.wmsParams.layers,
        query_layers: this.wmsParams.layers,
        info_format: 'text/html'
      };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    // return this._url + L.Util.getParamString(params, this._url, true);

    var url = this._url + L.Util.getParamString(params, this._url, true);


    /**
     * CORS workaround (using a basic php proxy)
     * 
     * Added 2 new options:
     *  - proxy
     *  - proxyParamName
     * 
     */

    // check if "proxy" option is defined (PS: path and file name)
    if (typeof this.wmsParams.proxy !== "undefined") {

      // check if proxyParamName is defined (instead, use default value)
      if (typeof this.wmsParams.proxyParamName !== "undefined")
        this.wmsParams.proxyParamName = 'url';

      // build proxy (es: "proxy.php?url=" )
      _proxy = this.wmsParams.proxy + '?' + this.wmsParams.proxyParamName + '=';

      url = _proxy + encodeURIComponent(url);

    }

    return url;

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
  createLegend: function (mapElement) {
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

    console.log(`url: ${url}`)
    wmsLegend = new L.wmsLegend(url, mapElement, 'test')
    //Addition #2: Add the legend on the sidebar
    addWMSToSidebar(wmsLegend, 'wms-legend-container');
  },
  createOpacitySlider: function (oper_layer) {
    par = document.getElementById('slider-container');
    par.innerHTML = `<input id='${nm}_opacity' data-slider-id='${nm}_opacity' type='text' data-slider-min='0' data-slider-max='1' data-slider-step='0.05' data-slider-value='1'/>`
    slider = new Slider(`#${nm}_opacity`, {
      formatter: function (value) {
        oper_layer.setOpacity(value);
        return value;
      }
    });
  },








  getInfoJSON: function (evt) {

    var url = this.getInfoJSONurl(evt.latlng), showResults = L.Util.bind(this.showInfoJSON, this);
    $.ajax({
      url: url,
      success: function (data, status, xhr) {
        var err = typeof data === 'string' ? null : data;
        showResults(err, evt.latlng, data);
      },
      error: function (xhr, status, error) {
        showResults(error);
      }
    });
  },

  getInfoJSONurl: function (latlng) {
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
      size = this._map.getSize(),

      params = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: 'EPSG:4326',
        styles: this.wmsParams.styles,
        transparent: this.wmsParams.transparent,
        version: this.wmsParams.version,
        format: this.wmsParams.format,
        bbox: this._map.getBounds().toBBoxString(),
        height: size.y,
        width: size.x,
        layers: this.wmsParams.layers,
        query_layers: this.wmsParams.layers,
        info_format: 'application/json'
      };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    // return this._url + L.Util.getParamString(params, this._url, true);

    var url = this._url + L.Util.getParamString(params, this._url, true);


    /**
     * CORS workaround (using a basic php proxy)
     * 
     * Added 2 new options:
     *  - proxy
     *  - proxyParamName
     * 
     */

    // check if "proxy" option is defined (PS: path and file name)
    if (typeof this.wmsParams.proxy !== "undefined") {

      // check if proxyParamName is defined (instead, use default value)
      if (typeof this.wmsParams.proxyParamName !== "undefined")
        this.wmsParams.proxyParamName = 'url';

      // build proxy (es: "proxy.php?url=" )
      _proxy = this.wmsParams.proxy + '?' + this.wmsParams.proxyParamName + '=';

      url = _proxy + encodeURIComponent(url);

    }
    console.log(url)
    return url;
  },

  showInfoJSON: function (err, latlng, content) {
    showAttributeTable(err, latlng, content)
  },



});





L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);
};



//Save Feature
function addToActiveFeatures(title, feature_content, err, latlng) {

  entry = {}
  tag = 'o' + title
  //Check if it has already been saved
  if (!saved_features[tag]) {
    entry[tag] = {
      title: title,
      content: feature_content,
      details: {
        err: err,
        latlng: latlng
      }
    }

    Object.assign(active_features, entry)

  }
}

function addToSavedFeatures(id) {
  tag = 'o' + id

  //Check if the feature is already in the saved feats
  if (!saved_features[tag]) {
    saved_features[tag] = active_features[tag]

    let saved_container = document.getElementsByClassName('saved-features-container')[0].children[0]
    saved_container.innerHTML = saved_container.innerHTML.concat(`<div class="card " style="background-color: honeydew;margin-top: 10px;"><div class="card-body row"><span class="col "><h6>Οικοδομικό Τετράγωνο ${tag}</h6><a href="#" class="btn btn-outline-success btn-sm sm" onclick="showAttributeTable(saved_features.${tag}.details.err,saved_features.${tag}.details.latlng,saved_features.${tag}.content);mymap.panTo(saved_features.${tag}.details.latlng)">Προβολή στο χάρτη</a></span></div></div>`)
    //Notify the user
    notification.success('OK', 'Το στοιχείο αποθηκεύτηκε με επιτυχία', {
      timeout: 5000,
      closable: true,
      dismissable: false,
      icon: 'fa fa-map-pin',
    });
  } else {
    notification.info('', 'Το στοιχείο βρίσκεται ήδη στα αποθηκευμένα!', {
      timeout: 5000,
      closable: true,
      dismissable: false,
      icon: 'fa fa-map-pin',
    });
  }



}








/////////////////////////////////
// MOVE LAYER CONTROL OUT OF LEAFLET, and inside the sidebar
function addWMSToSidebar(leafletControl, parentElementId) {
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










function showAttributeTable(err, latlng, content) {
  if (err) { console.log(err); } // do nothing if there's an error

  //Check the response. If the click point is not a feature, return the normal point coordinates popup
  if (!content['numberReturned'] == 0) {
    //showAttributeTable()


    //Get the selected feature, & highlight it on the map
    feature = content['features'][0];
    //Random color: decided not to use it. Leaving it here for future interest
    random_color = "#" + Math.floor(Math.random() * 16777215).toString(16)
    let current_feature = new L.geoJSON(feature, {
      style: {
        fillColor: '#4dd166',
        weight: 2.1,
        opacity: .9,
        color: '#4dd166',
        fillOpacity: .1
      }
    }
    ).addTo(mymap);






    var dialog = new L.control.dialog()
      .setContent(document.getElementById('attribute-table-container').innerHTML)
      .addTo(mymap);
    dialog.addEventListener("dialogClosed", function () { mymap.removeLayer(current_feature); delete current_feature; })


    //Bring dialog to the front
    dialog.getElement().parentElement.style.zIndex = "10000";



    let attributes = feature['properties']
    let attribute_table_container = dialog.getElement().children[0].children[0].children[0].children[1].children[0]

    //Highlight the feature on mouseover
    feature_code = dialog.getElement().children[0].children[0].children[0].children[0]


    //Add Title & Pin button
    feature_code.innerHTML = `<a href="#">${nm}: ${attributes['ot_code']}</a> <div role="button" class="btn btn-sm btn-outline-success" display="inline" onclick="addToSavedFeatures(${attributes['ot_code']});$('#pinned-items').fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400);" style="margin-left: 20px; padding-top: 0px;padding-bottom: 0px;"><i class="fas fa-map-pin"></i> Καρφίτσωμα</div>`

    //Add listeners to highlight features 
    feature_code.parentElement.parentElement.parentElement.addEventListener("mouseover", function () { current_feature.setStyle({ fillOpacity: 1 }); })
    feature_code.parentElement.parentElement.parentElement.addEventListener("mouseout", function () { current_feature.setStyle({ fillOpacity: .1 }) })




    for (atr in attributes) {
      //Table Headers
      let header_element = document.createElement("th")
      let header_content = document.createTextNode(atr)
      header_element.appendChild(header_content)
      attribute_table_container.children[0].appendChild(header_element)
      //Table Data Values
      //test if it is a link
      if (String(attributes[atr]).search("http:") == -1) {
        let data_element = document.createElement("td")
        let data_content = document.createTextNode(attributes[atr])
        data_element.appendChild(data_content)
        attribute_table_container.children[1].appendChild(data_element)
      } else {
        let data_element = document.createElement("td")
        let data_content = document.createTextNode(attributes[atr])
        let wrap = document.createElement("a")
        wrap.setAttribute('target', "_blank")
        wrap.setAttribute('href', attributes[atr])
        wrap.appendChild(data_content)
        data_element.appendChild(wrap)
        attribute_table_container.children[1].appendChild(data_element)
      }
    }

    //Add to active features, so that it can be saved later
    addToActiveFeatures(attributes['ot_code'], content, err, latlng)

  }
}