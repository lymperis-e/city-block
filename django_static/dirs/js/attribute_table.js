/* Pick Functionality*/
let pickMode = false;
$("#point-pick-btn").click(function () {
  pickMode = !pickMode;
  if (pickMode) {
    document.getElementById("point-pick-btn").style.color = "#fe9b00";
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

  //window.open(url, "_blank").focus();

  $.ajax({
    url: url,
    success: function (data, status, xhr) {
      var err = typeof data === "string" ? null : data;
      handleGeoserverJSON(err, latlng, data);
    },
    error: function (xhr, status, error) {
      handleGeoserverJSON(error);
    },
  });
}
function handleGeoserverJSON(err, latlng, data) {
  console.log(data);
  if (data.numberReturned == 0) {
    console.log("0 features found");
    return null;
  }

  key = data.features[0].id.split(".")[1];

  //window.open(`http://${window.location.host}/attributes/${key}`, "_blank")

  fetch(`http://${window.location.host}/attributes/${key}`)
  .then(response => response.json())
  .then(data => buildAttributeTable(data, latlng));

   // buildAttributeTable(`http://${window.location.host}/attributes/${key}`)
}
function buildAttributeTable(data, latlng) {
    console.log(data)
    let attributes = data['oroi_domisis'][0]

    document.getElementById("current-attribute-title").innerHTML = `${attributes['ot_name']}     |     <a style="font-size: small" target="_blank" href="https://www.google.com/maps/@${latlng.lat},${latlng.lng},15z"><i class="fa-solid fa-location-dot"></i> ${latlng.lat}, ${latlng.lng} </a>`
    document.getElementById("clicked-point-coords").innerHTML = toString(latlng)

    let attribute_table_container = document.getElementById("attributes-list")

    

    for (atr in attributes) {
      new_row = document.createElement("tr")
      attribute_table_container.appendChild(new_row)

      //Table Headers
      let header_element = document.createElement("th")
      let header_content = document.createTextNode(atr)
      header_element.appendChild(header_content)
      new_row.appendChild(header_element)
      //Table Data Values
      //test if it is a link
      if (String(attributes[atr]).search("http:") == -1) {
        let data_element = document.createElement("td")
        let data_content = document.createTextNode(attributes[atr])
        data_element.appendChild(data_content)
        new_row.appendChild(data_element)
      } else {
        let data_element = document.createElement("td")
        let data_content = document.createTextNode(attributes[atr])
        let wrap = document.createElement("a")
        wrap.setAttribute('target', "_blank")
        wrap.setAttribute('href', attributes[atr])
        wrap.appendChild(data_content)
        data_element.appendChild(wrap)
        new_row.appendChild(data_element)
      }
}}


function modal() {
    this.modal = document.createElement("div");
    this.modal.innerHTML = dialog_html;
    
    this.modal.style.position = 'absolute'
    this.modal.style.display = "block";
    
  
    // When the user clicks on <span> (x), close the modal
    //span.onclick = function () {
    //  this.modal.style.display = "none";
    //};
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        this.modal.style.display = "none";
      }
    };
  }


let dialog_html = `<div class="modal fade" id="aboutModal" tabindex="-1" role="dialog">
<div class="modal-dialog modal-lg">
  <div class="modal-content">
    <div class="modal-header">
      <button
        class="close"
        type="button"
        data-dismiss="modal"
        aria-hidden="true"
      >
        &times;
      </button>
      <h4 class="modal-title" id="current-attribute-title">
        Welcome to the BootLeaf template!
      </h4>
    </div>
    <div class="modal-body">
      <ul class="nav nav-tabs nav-justified" id="aboutTabs">
        <li class="active">
          <a href="#about" data-toggle="tab"
            ><i class="fa-solid fa-building-circle-exclamation"></i>&nbsp;Όροι
            Δόμησης</a
          >
        </li>
        <li>
          <a href="#contact" data-toggle="tab"
            ><i class="fa-solid fa-gavel"></i>&nbsp;Πράξεις Εφαρμογής</a
          >
        </li>
        <li>
          <a href="#disclaimer" data-toggle="tab"
            ><i class="fa-solid fa-check-double"></i>&nbsp;Διορθωτικές
            Πράξεις</a
          >
        </li>
        <li>
          <a href="#disclaimer" data-toggle="tab"
            ><i class="fa-solid fa-section"></i>&nbsp;Πράξεις Αναλογισμού</a
          >
        </li>
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown"
            ><i class="fa fa-globe"></i>&nbsp;Εξαγωγή <b class="caret"></b
          ></a>
          <ul class="dropdown-menu">
            <li><a href="#boroughs-tab" data-toggle="tab">Εκτύπωση</a></li>
            <li>
              <a href="#subway-lines-tab" data-toggle="tab">KML</a>
            </li>
            <li><a href="#theaters-tab" data-toggle="tab">Shapefile</a></li>
            <li><a href="#museums-tab" data-toggle="tab">PDF</a></li>
          </ul>
        </li>
      </ul>
      <div class="tab-content" id="aboutTabsContent">
        <div class="tab-pane fade active in" id="about">
          <p id="clicked-point-coords"></p>
          <div class="panel panel-primary">
            <!--div class="panel-heading" id="attributes-clicked-coordinates">Features</div-->
            <table class="list-group table table-bordered" id="attributes-list">
              
            </table>
          </div>
        </div>
        <div id="disclaimer" class="tab-pane fade text-danger">
          <p>
            The data provided on this site is for informational and planning
            purposes only.
          </p>
          <p>
            Absolutely no accuracy or completeness guarantee is implied or
            intended. All information on this map is subject to such
            variations and corrections as might result from a complete title
            search and/or accurate field survey.
          </p>
        </div>
        <div class="tab-pane fade" id="contact">
          <form id="contact-form">
            <div class="well well-sm">
              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label for="first-name">First Name:</label>
                    <input type="text" class="form-control" id="first-name" />
                  </div>
                  <div class="form-group">
                    <label for="last-name">Last Name:</label>
                    <input type="text" class="form-control" id="last-email" />
                  </div>
                  <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="text" class="form-control" id="email" />
                  </div>
                </div>
                <div class="col-md-8">
                  <label for="message">Message:</label>
                  <textarea
                    class="form-control"
                    rows="8"
                    id="message"
                  ></textarea>
                </div>
                <div class="col-md-12">
                  <p>
                    <button
                      type="submit"
                      class="btn btn-primary pull-right"
                      data-dismiss="modal"
                    >
                      Submit
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="tab-pane fade" id="boroughs-tab">
          <p>
            Borough data courtesy of
            <a
              href="http://www.nyc.gov/html/dcp/pdf/bytes/nybbwi_metadata.pdf"
              target="_blank"
              >New York City Department of City Planning</a
            >
          </p>
        </div>
        <div class="tab-pane fade" id="subway-lines-tab">
          <p>
            <a
              href="http://spatialityblog.com/2010/07/08/mta-gis-data-update/#datalinks"
              target="_blank"
              >MTA Subway data</a
            >
            courtesy of the
            <a
              href="http://www.urbanresearch.org/about/cur-components/cuny-mapping-service"
              target="_blank"
              >CUNY Mapping Service at the Center for Urban Research</a
            >
          </p>
        </div>
        <div class="tab-pane fade" id="theaters-tab">
          <p>
            Theater data courtesy of
            <a
              href="https://data.cityofnewyork.us/Recreation/Theaters/kdu2-865w"
              target="_blank"
              >NYC Department of Information & Telecommunications (DoITT)</a
            >
          </p>
        </div>
        <div class="tab-pane fade" id="museums-tab">
          <p>
            Museum data courtesy of
            <a
              href="https://data.cityofnewyork.us/Recreation/Museums-and-Galleries/sat5-adpb"
              target="_blank"
              >NYC Department of Information & Telecommunications (DoITT)</a
            >
          </p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" data-dismiss="modal">
        Close
      </button>
    </div>
  </div>
  <!-- /.modal-content -->
</div>
<!-- /.modal-dialog -->
</div>
`;
