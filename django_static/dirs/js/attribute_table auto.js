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

  params[params.version === "1.3.0" ? "i" : "x"] = Math.round(point.x);
  params[params.version === "1.3.0" ? "j" : "y"] = Math.round(point.y);

  var url = service_url + L.Util.getParamString(params, service_url, true);
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
  .then(data => initAttributeTable(key, data, latlng));

  
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


function initAttributeTable(otid, data, latlng){
  this.new_table = new attributeTable(otid, data, latlng)
  new_table.init()
}





function attributeTable(otid, data, latlng) {
  this.otid = otid
  this.data = data
  this.tableRoot = null
  this.init = function(){
    /* Root Element of the Attribute Table */
    this.tableRoot = document.createElement("div");
    this.tableRoot.id = `attribute-table-${otid}`
    this.tableRoot.setAttribute("class", "modal fade")
    this.tableRoot.setAttribute("tabindex",  '-1')
    this.tableRoot.setAttribute("role", "dialog")
    this.tableRoot.setAttribute("data-backdrop", "static")
    this.tableRoot.style.display = "block";
    this.tableRoot.style.position = "absolute"

    /* First & Second Level Wrappers */
    firstChild = document.createElement("div")
    firstChild.setAttribute("class", "modal-dialog modal-lg")
    secondChild =  document.createElement("div")
    secondChild.setAttribute("class", "modal-content")

    /* Header --> Title with OT id, coords etc */
    modalHeader = document.createElement("div")
    modalHeader.id = `attribute-table-${otid}-header`  /* Must have the same id as the top level parent + header, for the draggable to work correctly */
    modalHeader.setAttribute("class", "modal-header")
    modalHeader.style.cursor = "move"
    modalHeader.innerHTML = `<button
                                class="close"
                                type="button"
                                data-dismiss="modal"
                                aria-hidden="true"> &times;</button>

                              <h4 class="modal-title" id="attribute-table-${otid}-title">
                              ${otid}     |     <a style="font-size: small" target="_blank" href="https://www.google.com/maps/@${latlng.lat},${latlng.lng},15z"><i class="fa-solid fa-location-dot"></i> ${latlng.lat}, ${latlng.lng} </a>
                              </h4>
                              `
    
    /* Body: The main tabs with all the content etc */
    modalBody = document.createElement("div")
    modalBody.setAttribute("class", "modal-body")
    //modalBody.innerHTML = modal_body

    /* Tab navigation panel */
    modalBodyTabs = document.createElement("ul")
    modalBodyTabs.id = "attributeTabs"
    modalBodyTabs.setAttribute("class", "nav nav-tabs nav-justified")

    /* Tab content */
    modalBodyTabContent = document.createElement("div")
    modalBodyTabContent.id = "attributeTabsContent"
    modalBodyTabContent.setAttribute("class", "tab-content")

    console.log(data)
    /* Add a tab for each key in the results dict */
    Object.keys(data).forEach((key, index) => {
      attribute_values = data[key]
      console.log(`Attribute Values for key '${key}': ${data[key]}`)

      tab = document.createElement("li")
      tab.setAttribute("class", "active")
      tab.innerHTML = ` <a href="#${key}" data-toggle="tab"
                          ><i class="fa-solid fa-building-circle-exclamation"></i>&nbsp;${key}
                        </a> `

      content = document.createElement("div")
      content.id = key
      content.setAttribute("class", "tab-pane fade active in")
      content.innerHTML = `
                      <p id="clicked-point-coords"></p>
                        <div class="panel panel-primary">
                          <!--div class="panel-heading" id="attributes-clicked-coordinates">Features</div-->

                          <table class="list-group table table-bordered" id="${key}-table">

                          </table>
                        </div>`
      /* Fill the table with the nested elements of the response */
      for (attr in attribute_values){
        //Table Headers
        new_row = document.createElement("tr")
        let header_element = document.createElement("th")
        let header_content = document.createTextNode(attr)
        header_element.appendChild(header_content)
        new_row.appendChild(header_element)
        

        let data_element = document.createElement("td")
        let data_content = document.createTextNode(attribute_values[attr])
        data_element.appendChild(data_content)
        new_row.appendChild(data_element)
        
        document.getElementById(`${key}-table`).appendChild(new_row)

      }
      

      modalBodyTabs.appendChild(tab)
      modalBodyTabContent.appendChild(content)
    })

    

    modalBody.appendChild(modalBodyTabs)
    modalBody.appendChild(modalBodyTabContent)




    /* Footer: OK/Close button */
    modalFooter = document.createElement("div")
    modalFooter.setAttribute("class", "modal-footer")
    modalFooter.innerHTML = `
                                <button type="button" class="btn btn-default" data-dismiss="modal">
                                  Close
                                </button>
    `


    /* Synthesize all the above */
    secondChild.appendChild(modalHeader)
    secondChild.appendChild(modalBody)
    secondChild.appendChild(modalFooter)
    firstChild.appendChild(secondChild)
    this.tableRoot.appendChild(firstChild)
    document.body.appendChild(this.tableRoot)



    /* Make the element draggable as soon as it is shown */
    $(`#attribute-table-${otid}`).on('shown.bs.modal', function(e){
      //$('.modal-backdrop').remove();
      dragElement(document.getElementById(`attribute-table-${otid}`))
    })
    /* Clean the DOM when the modal is closed */
    $(`#attribute-table-${otid}`).on('hidden.bs.modal', function(e){
      this.remove()
    })
    /* Show the modal, without backdrop */
    $(`#attribute-table-${otid}`).modal({backdrop:false})
    $(`#attribute-table-${otid}`).modal("show")
    
    return this.tableRoot
  },

  this.remove = function(){
    $(`#attribute-table-${otid}`).remove()
    delete this
  }


}
























  let modal_body = `
  <ul class="nav nav-tabs nav-justified" id="attributeTabs">
  <li class="active">
    <a href="#oroi_domisis" data-toggle="tab"
      ><i class="fa-solid fa-building-circle-exclamation"></i>&nbsp;Όροι
      Δόμησης</a
    >
  </li>
  <li>
    <a href="#praxeis_efarmogis" data-toggle="tab"
      ><i class="fa-solid fa-gavel"></i>&nbsp;Πράξεις Εφαρμογής</a
    >
  </li>
  <li>
    <a href="#diorthotikes_praxeis" data-toggle="tab"
      ><i class="fa-solid fa-check-double"></i>&nbsp;Διορθωτικές
      Πράξεις</a
    >
  </li>
  <li>
    <a href="#praxeis_analogismou" data-toggle="tab"
      ><i class="fa-solid fa-section"></i>&nbsp;Πράξεις Αναλογισμού</a
    >
  </li>


  <li class="dropdown">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown"
      ><i class="fa fa-globe"></i>&nbsp;Εξαγωγή <b class="caret"></b
    ></a>
    <ul class="dropdown-menu">
      <li><a href="#print" data-toggle="tab">Εκτύπωση</a></li>
      <li>
        <a href="#subway-lines-tab" data-toggle="tab">KML</a>
      </li>
      <li><a href="#theaters-tab" data-toggle="tab">Shapefile</a></li>
      <li><a href="#museums-tab" data-toggle="tab">PDF</a></li>
    </ul>
  </li>
</ul>


<div class="tab-content" id="attributeTabsContent">

  <div class="tab-pane fade active in" id="oroi_domisis">
    <p id="clicked-point-coords"></p>
    <div class="panel panel-primary">
      <!--div class="panel-heading" id="attributes-clicked-coordinates">Features</div-->
      <table class="list-group table table-bordered" id="attributes-list">
        
      </table>
    </div>
  </div>


  <div id="praxeis_efarmogis" class="tab-pane fade text-danger">
    <p id="clicked-point-coords"></p>
    <div class="panel panel-primary">
      <!--div class="panel-heading" id="attributes-clicked-coordinates">Features</div-->
      <table class="list-group table table-bordered" id="attributes-list">
        
      </table>
    </div>
  </div>

  <div class="tab-pane fade" id="diorthotikes_praxeis">
  <p id="clicked-point-coords"></p>
  <div class="panel panel-primary">
    <!--div class="panel-heading" id="attributes-clicked-coordinates">Features</div-->
    <table class="list-group table table-bordered" id="attributes-list">
      
    </table>
  </div>
  </div>

  <div class="tab-pane fade" id="praxeis_analogismou">
  <p id="clicked-point-coords"></p>
  <div class="panel panel-primary">
    <!--div class="panel-heading" id="attributes-clicked-coordinates">Features</div-->
    <table class="list-group table table-bordered" id="attributes-list">
      
    </table>
  </div>
  </div>
  

</div>
  `