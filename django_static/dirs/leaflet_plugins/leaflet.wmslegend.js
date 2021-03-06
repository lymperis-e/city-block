/*
 * L.Control.WMSLegend is used to add a WMS Legend to the map
 */

L.Control.WMSLegend = L.Control.extend({
    options: {
        position: 'bottomright',
        uri: '',
        element_id: 0
    },

    onAdd: function () {
        var controlClassName = 'leaflet-control-wms-legend',
            legendClassName = 'wms-legend',
            stop = L.DomEvent.stopPropagation;
        this.container = L.DomUtil.create('div', controlClassName);
        this.container.id = this.options.element_id+'-legend'
        this.img = L.DomUtil.create('img', legendClassName, this.container);
        this.img.src = this.options.uri;
        this.img.alt = 'Legend';


        //Commented out so that the legend on the sidebar is not collapsible
        //L.DomEvent
        //    .on(this.img, 'click', this._click, this)
        //    .on(this.container, 'click', this._click, this)
        //    .on(this.img, 'mousedown', stop)
        //    .on(this.img, 'dblclick', stop)
        //    .on(this.img, 'click', L.DomEvent.preventDefault)
        //    .on(this.img, 'click', stop);
        this.height = null;
        this.width = null;
        return this.container;
    },
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        // toggle legend visibility
        var style = window.getComputedStyle(this.img);
        if (style.display === 'none') {
            this.container.style.height = this.height + 'px';
            this.container.style.width = this.width + 'px';
            this.img.style.display = this.displayStyle;
        }
        //Commented out so that the legend on the sidebar is not collapsible
        //else {
        //    if (this.width === null && this.height === null) {
        //        // Only do inside the above check to prevent the container
        //        // growing on successive uses
        //        this.height = this.container.offsetHeight;
        //        this.width = this.container.offsetWidth;
        //    }
        //    this.displayStyle = this.img.style.display;
        //    
        //    this.img.style.display = 'none';
        //    this.container.style.height = '20px';
        //    this.container.style.width = '20px';
        //}
    },
});



L.wmsLegend = function (uri, map, element_id) {
    var wmsLegendControl = new L.Control.WMSLegend;
    wmsLegendControl.options.uri = uri;
    wmsLegendControl.options.element_id = element_id;
    map.addControl(wmsLegendControl);
    return wmsLegendControl;
};
