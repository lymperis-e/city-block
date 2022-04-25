proj4.defs("EPSG:2100","+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=-199.87,74.79,246.62,0,0,0,0 +units=m +no_defs");

L.Control.MousePosition = L.Control.extend({

	_pos: null,

	options: {
		position: 'bottomright',
		separator: ' : ',
		emptyString: 'Unavailable',
		lngFirst: false,
		numDigits: 5,
		lngFormatter: undefined,
		latFormatter: undefined,
		formatter: undefined,
		prefix: "",
		wrapLng: true,
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
		L.DomEvent.disableClickPropagation(this._container);
		map.on('mousemove', this._onMouseMove, this);
		map.on('mouseout', this._onMouseOut, this);
		this._container.innerHTML = this.options.emptyString;
		return this._container;
	},

	onRemove: function (map) {
		map.off('mousemove', this._onMouseMove)
	},

	getLatLng: function() {
		return this._pos;
	},

	_onMouseOut: function (e){
		this._container.innerHTML = ""
	},

	_onMouseMove: function (e) {
		this._pos = e.latlng.wrap();
		var lngValue = this.options.wrapLng ? e.latlng.wrap().lng : e.latlng.lng;
		var latValue = e.latlng.lat;
		//Transform to GGRS87
		//THE ORDER OF LAN,LOT NEEDED TO BE REVERSED IN THE FOLLOWING LINE!!
		var projected = proj4("EPSG:4326","+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +fromwgs84=199.87,-74.79,-246.62,0,0,0,0  +units=m +no_defs", [lngValue, latValue])
		lngValue=projected[1]
		latValue=projected[0]
		///console.log('lng: '+lngValue)
		//console.log('lat: '+latValue)
		var lng;
		var lat;
		var value;
		var prefixAndValue;

		if (this.options.formatter) {
			prefixAndValue = this.options.formatter(lngValue, latValue);
		} else {
			lng = this.options.lngFormatter ? this.options.lngFormatter(lngValue) : L.Util.formatNum(lngValue, this.options.numDigits);
			lat = this.options.latFormatter ? this.options.latFormatter(latValue) : L.Util.formatNum(latValue, this.options.numDigits);
			value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
			prefixAndValue = this.options.prefix + ' ' + value;
		}

		this._container.innerHTML = prefixAndValue;
	}

});

L.Map.mergeOptions({
	positionControl: false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

L.control.mousePosition = function (options) {
	return new L.Control.MousePosition(options);
};








