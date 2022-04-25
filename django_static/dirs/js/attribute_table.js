/* Pick Functionality*/
let pickMode = false;
$("#point-pick-btn").click(function () {
  pickMode = !pickMode;
  if (pickMode) {
    document.getElementById("point-pick-btn").style.color = "#ffaf69";
  } else {
    document.getElementById("point-pick-btn").style.color = "#9d9d9d";
  }
  return false;
});
/* Add the event listener */
map.on("click", function (e) {
  if (pickMode == true) {
    pickFeature(e.latlng);
  }
});
/* Create request URL */
function buildGetUrl(latlng) {
  service_url = `http://192.168.252.133:7878/geoserver/webgis/wms?`;
  var point = map.latLngToContainerPoint(latlng, map.getZoom()),
    size = map.getSize(),
    params = {
      request: "GetFeatureInfo",
      service: "WMS",
      srs: "EPSG:4326",
      transparent: true,
      version: "1.1.0",
      format: "application/json",
      bbox: map.getBounds().toBBoxString(),
      height: size.y,
      width: size.x,
      layers: "webgis:ot",
      query_layers: "webgis:ot",
      info_format: "application/json",
    };

  params[params.version === "1.3.0" ? "i" : "x"] = point.x;
  params[params.version === "1.3.0" ? "j" : "y"] = point.y;

  // return this._url + L.Util.getParamString(params, this._url, true);

  var url = service_url + L.Util.getParamString(params, service_url, true);

  console.log(url);
  return url;
}
/* Handle the actual picking action */
function pickFeature(latlng) {
  var url = buildGetUrl(latlng);

  window.open(url, "_blank").focus();

  $.ajax({
    url: url,
    success: function (data, status, xhr) {
      var err = typeof data === "string" ? null : data;
      handleGeoserverJSON(err, data);
    },
    error: function (xhr, status, error) {
        handleGeoserverJSON(error);
    },
  });
}
function handleGeoserverJSON(err, data) {
    console.log(data)
    if (data.numberReturned == 0 ){
        console.log('0 features found')
        return null;
    }

    key = data.features[0].id.split(".")[1]





    
}
function buildAttributeTable(data){
    null
}