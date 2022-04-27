/* Globals */
var activeOverlaysDict = {};

/* Basemap Layers */
const blank_layer = L.tileLayer(
  "https://mt1.google.com/vt/lyrs=s&x=%7Bx%7D&y=%7By%7D&z=%7Bz%7D",
    {
      maxZoom: 26,
      maxNativeZoom: 2,
    }
);
const hum_osm = L.tileLayer(
  "http://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 26,
    maxNativeZoom: 20,
  }
);
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 26,
  maxNativeZoom: 20,
});
const esri_world = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      'ESRI World Imagery <a href="https://esri.maps.arcgis.com/home/index.html" target="_blank">(c) Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community</a>',
    maxZoom: 26,
    maxNativeZoom: 17,
  }
);
const google_sat = L.tileLayer(
  "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    attribution:
      'ESRI World Imagery <a href="https://esri.maps.arcgis.com/home/index.html" target="_blank">(c) Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community</a>',
    maxZoom: 26,
    maxNativeZoom: 17,
  }
);
const esri_gray = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      'ESRI Gray <a href="https://esri.maps.arcgis.com/home/index.html" target="_blank">(c) Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community</a>',
    maxZoom: 26,
    maxNativeZoom: 16,
  }
);
const esri_topo = L.tileLayer(
  "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      'ESRI Topo Map <a href="https://esri.maps.arcgis.com/home/index.html" target="_blank">(c) Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, Aerogrid, IGN, IGP, and the GIS User Community</a>',
    maxZoom: 26,
    maxNativeZoom: 16,
  }
);
const kthma = L.tileLayer.wms(
  "http://gis.ktimanet.gr/wms/wmsopen/wmsserver.aspx?&layers=BASEMAP&styles=&attributionControl=true",
  {
    attribution:
      'Ελληνικό Κτηματολόγιο Α.Ε. <a href="https://www.ktimatologio.gr/" target="_blank">(c) Κτηματολόγιο Α.Ε.</a>',
    maxZoom: 26,
    maxNativeZoom: 19,
  }
);

var baseTree = {
  label: "<b>Υπόβαθρα</b>",
  children: [
    { label: " Κανένα ", layer: blank_layer },
    { label: " Δορυφόρος Google", layer: google_sat },
    { label: " Δορυφόρος ESRI", layer: esri_world },
    { label: " Minimal (ESRI Gray)", layer: esri_gray },
    { label: " Τοπογραφικός ESRI", layer: esri_topo },
    { label: " OpenStreetMap", layer: osm },
    { label: "Humanitarian OpenSreetMap", layer: hum_osm },
    { label: " Aεροφωτογραφίες Κτηματολόγιο Α.Ε.", layer: kthma },
  ],
};

/* Overlay Layers */
var overlaysTree = {
  label: "<b> Επίπεδα Δεδομένων</b>",
  selectAllCheckbox: "",
  children: [],
};
function feedOverlays() {
  let server_location = "192.168.252.133";
  let geoserver_wfs_url =
    "http://" + "192.168.252.133" + ":7878/geoserver/webgis/wfs?";

  let tetragona = {
    label: "Οικοδομικά Τετράγωνα",
    name: "webgis:ot",
    minZoom: 10,
  };
  let idioktisies = {
    label: "Ιδιοκτησίες",
    name: "webgis:idioktisies",
    minZoom: 10,
  };
  let ktiria = { label: "Κτίρια", name: "webgis:ktiria", minZoom: 10 };

  let overlays = [ktiria, tetragona, idioktisies];

  //Create TileLayer objects
  var i = 0,
    len = overlays.length;
  while (i < len) {
    layer_name = overlays[i].name; //Capture the layer's Label & Name
    layer_label = overlays[i].label;

    // Initialize the layer as a TileLayer object
    if (overlays[i].minZoom) {
      minZoom = overlays[i].minZoom;
    } else {
      minZoom = 12;
    }
    //604800
    let tileLayer = new L.tileLayer.betterWms(
      `http://${server_location}:7878/geoserver/webgis/wms?&tiled=true&max-age=0`,
      {
        version: "1.1.0",
        format: "image/png",
        srs: "EPSG:4326",
        transparent: true,
        layers: layer_name,
        minZoom: minZoom,
        maxNativeZoom: 22,
        maxZoom: 26,
        layer_id: i,
        map: map,
      }
    );

    //Create the HTML tag for the layer control
    let layer_HTMLtag = `${layer_label}
                            

                              <!--div role='button' class='btn btn-sm btn-outline-success'
                               style='padding-top: 0px;padding-bottom: 0px;' 
                               display='inline' 
                               onclick="initLayerDownload('shp','${layer_name}','${geoserver_wfs_url}')">
                                  Λήψη
                              </div>

                              <div id='slider-container-${i}'>
                              </div>
                              <div id='wms-legend-container-${i}'>
                              </div-->`;

    //Push the leayr in the overlays_tree
    overlaysTree.children.push({ label: layer_HTMLtag, layer: tileLayer });

    //Go to next
    i++;
  }
}
feedOverlays();

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10,
};

// var boroughs = L.geoJson(null, {
//   style: function (feature) {
//     return {
//       color: "black",
//       fill: false,
//       opacity: 1,
//       clickable: false
//     };
//   },
//   onEachFeature: function (feature, layer) {
//     boroughSearch.push({
//       name: layer.feature.properties.BoroName,
//       source: "Boroughs",
//       id: L.stamp(layer),
//       bounds: layer.getBounds()
//     });
//   }
// });
// $.getJSON("data/boroughs.geojson", function (data) {
//   boroughs.addData(data);
// });

//Create a color dictionary based off of subway route_id
// var subwayColors = {"1":"#ff3135", "2":"#ff3135", "3":"ff3135", "4":"#009b2e",
//     "5":"#009b2e", "6":"#009b2e", "7":"#ce06cb", "A":"#fd9a00", "C":"#fd9a00",
//     "E":"#fd9a00", "SI":"#fd9a00","H":"#fd9a00", "Air":"#ffff00", "B":"#ffff00",
//     "D":"#ffff00", "F":"#ffff00", "M":"#ffff00", "G":"#9ace00", "FS":"#6e6e6e",
//     "GS":"#6e6e6e", "J":"#976900", "Z":"#976900", "L":"#969696", "N":"#ffff00",
//     "Q":"#ffff00", "R":"#ffff00" };
//
// var subwayLines = L.geoJson(null, {
//   style: function (feature) {
//       return {
//         color: subwayColors[feature.properties.route_id],
//         weight: 3,
//         opacity: 1
//       };
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Division</th><td>" + feature.properties.Division + "</td></tr>" + "<tr><th>Line</th><td>" + feature.properties.Line + "</td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.Line);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");
//
//         }
//       });
//     }
//     layer.on({
//       mouseover: function (e) {
//         var layer = e.target;
//         layer.setStyle({
//           weight: 3,
//           color: "#00FFFF",
//           opacity: 1
//         });
//         if (!L.Browser.ie && !L.Browser.opera) {
//           layer.bringToFront();
//         }
//       },
//       mouseout: function (e) {
//         subwayLines.resetStyle(e.target);
//       }
//     });
//   }
// });
// $.getJSON("data/subways.geojson", function (data) {
//   subwayLines.addData(data);
// });

/* Single marker cluster layer to hold all clusters */
// var markerClusters = new L.MarkerClusterGroup({
//   spiderfyOnMaxZoom: true,
//   showCoverageOnHover: false,
//   zoomToBoundsOnClick: true,
//   disableClusteringAtZoom: 16
// });

/* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
// var theaterLayer = L.geoJson(null);
// var theaters = L.geoJson(null, {
//   pointToLayer: function (feature, latlng) {
//     return L.marker(latlng, {
//       icon: L.icon({
//         iconUrl: "assets/img/theater.png",
//         iconSize: [24, 28],
//         iconAnchor: [12, 28],
//         popupAnchor: [0, -25]
//       }),
//       title: feature.properties.NAME,
//       riseOnHover: true
//     });
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADDRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.NAME);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");
//           highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
//         }
//       });
//       $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
//       theaterSearch.push({
//         name: layer.feature.properties.NAME,
//         address: layer.feature.properties.ADDRESS1,
//         source: "Theaters",
//         id: L.stamp(layer),
//         lat: layer.feature.geometry.coordinates[1],
//         lng: layer.feature.geometry.coordinates[0]
//       });
//     }
//   }
// });
// $.getJSON("data/DOITT_THEATER_01_13SEPT2010.geojson", function (data) {
//   theaters.addData(data);
//   map.addLayer(theaterLayer);
// });

/* Empty layer placeholder to add to layer control for listening when to add/remove museums to markerClusters layer */
// var museumLayer = L.geoJson(null);
// var museums = L.geoJson(null, {
//   pointToLayer: function (feature, latlng) {
//     return L.marker(latlng, {
//       icon: L.icon({
//         iconUrl: "assets/img/museum.png",
//         iconSize: [24, 28],
//         iconAnchor: [12, 28],
//         popupAnchor: [0, -25]
//       }),
//       title: feature.properties.NAME,
//       riseOnHover: true
//     });
//   },
//   onEachFeature: function (feature, layer) {
//     if (feature.properties) {
//       var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
//       layer.on({
//         click: function (e) {
//           $("#feature-title").html(feature.properties.NAME);
//           $("#feature-info").html(content);
//           $("#featureModal").modal("show");
//           highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
//         }
//       });
//       $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
//       museumSearch.push({
//         name: layer.feature.properties.NAME,
//         address: layer.feature.properties.ADRESS1,
//         source: "Museums",
//         id: L.stamp(layer),
//         lat: layer.feature.geometry.coordinates[1],
//         lng: layer.feature.geometry.coordinates[0]
//       });
//     }
//   }
// });
// $.getJSON("data/DOITT_MUSEUM_01_13SEPT2010.geojson", function (data) {
//   museums.addData(data);
// });

map = L.map("map", {
  zoom: 14,
  center: [38.083972243873916, 23.73773146243702],
  layers: [esri_gray],
  zoomControl: false,
  attributionControl: false,
});

/* Filter sidebar feature list to only show features in current map bounds */
//map.on("moveend", function (e) {
//  syncSidebar();
//});

/* Clear feature highlight when map is clicked */
map.on("click", function (e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function (index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html(layer.getAttribution());
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright",
});

//attributionControl.onAdd = function (map) {
//  var div = L.DomUtil.create("div", "leaflet-control-attribution");
//  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
//  return div;
//};
//map.addControl(attributionControl);

var zoomControl = L.control.zoom({ position: "topright" }).addTo(map);
var geocoder = L.Control.geocoder().addTo(map);
var Scale = new L.control.scale({ imperial: false }).addTo(map);
L.control.mousePosition().addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control
  .locate({
    position: "bottomright",
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: true,
    markerStyle: {
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.8,
    },
    circleStyle: {
      weight: 1,
      clickable: false,
    },
    icon: "fa fa-location-arrow",
    metric: false,
    strings: {
      title: "My location",
      popup: "You are within {distance} {unit} from this point",
      outsideMapBoundsMsg: "You seem located outside the boundaries of the map",
    },
    locateOptions: {
      maxZoom: 18,
      watch: true,
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
    },
  })
  .addTo(map);

/* Add Layer Control */
var layerControl = L.control.layers
  .tree(baseTree, overlaysTree, {
    collapsed: false,
    closedSymbol: "<i class='fas fa-caret-right'></i>",
    openedSymbol: "<i class='fas fa-caret-down'></i>",
    labelIsSelector: "none",
    spaceSymbol: "   ",
  })
  .addTo(map);

//Add layer control to sidebar
addToSidebar(layerControl, "layer-control-container");

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Hide Loader when Map is ready */
map.whenReady(function () {
  $("#loading").hide();
});

/* Extra Functions */

function addToSidebar(leafletControl, parentElementId) {
  var htmlObject = leafletControl.getContainer().children[1];
  // Get the desired parent node.
  var a = document.getElementById(parentElementId);

  // Finally append that node to the new parent.
  function setParent(el, newParent) {
    newParent.appendChild(el);
  }
  setParent(htmlObject, a);

  //The line below deletes all the default rendering of the layer control
  //a.children[0].className = "sidebar-layer-control"

  //Make the laters list display inline
  //for (const layer_tag in htmlObject.children[0].children[0].children) {
  //  layer_tag.style = "display:inline"
  //}

  //The next one removes the layer toggling button
  //a.children[0].children[0].remove();
  ////////////////////////////////////////
}

function showClickCoords(e) {
  var coord = e.latlng.toString().split(",");
  var lat = coord[0].split("(");
  var long = coord[1].split(")");
  //To GGRS87
  //console.log('LAT: '+lat[1])
  var c_proj = proj4(
    "EPSG:4326",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +fromwgs84=199.87,-74.79,-246.62,0,0,0,0  +units=m +no_defs",
    [parseFloat(long[0]), parseFloat(lat[1])]
  );
  //console.log('EGSA87: ' + c_proj)
  var popup = L.popup({ maxWidth: 1000, minWidth: 400 })
    .setLatLng(e.latlng)
    .setContent(
      `<div style='width:500px;height:130px;'>
            <table class='table .table-bordered '>
                <tbody>
                    <tr>
                        <th scope='col'>WGS84</th>
                        <th scope='col'>ΕΓΣΑ'87</th>
                    </tr>
                    <tr>
                        <td>${lat[1]} ,${long[0]}</td>
                        <td>${c_proj.toString().replace(":", ", ")}</td>
                    </tr>
                </tbody>
            </table>
            <div role="button" class="btn btn-sm btn-outline-success" display="inline"
              onclick="var name = prompt('Εισάγετε ένα όνομα ή σχόλιο για να καρφιτσώσετε το σημείο');pinCoordinates(new L.${
                e.latlng
              },name);$('#pinned-items').fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400).fadeOut(400).fadeIn(400);"
              style="margin-left: 20px; padding-top: 0px;padding-bottom: 0px;">
              <i class="fas fa-map-pin"></i>
                Καρφίτσωμα
            </div>
        </div>`
    )
    .openOn(mymap);
  // .setContent("<p class='dropdown-item font-weight-light'>WGS84: "  +lat[1] + ' ,' + long[0]+'</p>'+"<p class='dropdown-item font-weight-light'>GGRS87: "  +c_proj.toString().replace(':',', ') +'</p>')
  last_coord = {
    wgs84: lat[1] + " ," + long[0],
    ggrs87: c_proj.toString().replace(":", ",  "),
  };

  document.getElementById("last_coord_box").innerHTML =
    "<div style='margin-top: 30px;'><table class='table table-striped table-bordered'><tbody><tr><th>WGS'84</th><td>" +
    last_coord["wgs84"] +
    "</td> </tr><tr><th>ΕΓΣΑ'87</th><td>" +
    last_coord["ggrs87"] +
    "</td> </tr></tbody></table><div>";
}





map.on("contextmenu", function (e) {
  showClickCoords(e);
});
function showClickCoords(e) {
  var coord = e.latlng.toString().split(",");
  var lat = coord[0].split("(");
  var long = coord[1].split(")");
  //To GGRS87
  //console.log('LAT: '+lat[1])
  var c_proj = proj4(
    "EPSG:4326",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +fromwgs84=199.87,-74.79,-246.62,0,0,0,0  +units=m +no_defs",
    [parseFloat(long[0]), parseFloat(lat[1])]
  );
  //console.log('EGSA87: ' + c_proj)
  var popup = L.popup({ maxWidth: 1000, minWidth: 400 })
    .setLatLng(e.latlng)
    .setContent(
      `
      <div style="font-size:small">
          <table class='table .table-bordered '>
              <tbody>
                  <tr>
                      <th scope='col'><i class="fa-solid fa-location-dot"></i>  WGS'84</th>
                      <td>${lat[1]} ,${long[0]}</td>
                      
                  </tr>
                  <tr>
                  <th scope='col'><i class="fa-solid fa-location-dot"></i>  ΕΓΣΑ'87</th>
                      <td>${c_proj.toString().replace(":", ", ")}</td>
                  </tr>
              </tbody>
          </table>
      </div>`
    )
    .openOn(map);
  last_coord = {
    wgs84: lat[1] + " ," + long[0],
    ggrs87: c_proj.toString().replace(":", ",  "),
  };
}







