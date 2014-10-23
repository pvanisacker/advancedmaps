define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var GoogleMapView = require("app/advancedmaps/advancedmaps/googlemapview");
    var Messages = require("splunkjs/mvc/messages");
    require("http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/src/markerclusterer_compiled.js");

    var GoogleMarkerMapView = GoogleMapView.extend({
        options:{
            infoWindowContentProvider: function(data){
                return "<div style='text-align:center;width:200px;height:30px'>"+data["lat"]+","+data["lng"]+"</div>";
            },
        },

        markers:[],
        markerClusterer:undefined,

        clearMap: function() {
            if(this.markerClusterer){
                this.markerClusterer.clearMarkers();
            }
            for (var i = 0; i < this.markers.length; ++i)
                this.markers[i].setMap(null);
            this.markers=[];
        },

        markerFactory: function(data){
            var lat = parseFloat(data["lat"]);
            var lng = parseFloat(data["lng"]);
            var latlng = new google.maps.LatLng(lat, lng);
            var marker = new google.maps.Marker({
                position: latlng,
                map: this.map
            });
            if(this.options.infoWindowContentProvider){
                var that=this;
                google.maps.event.addListener(marker, 'click', function() {
                    content=that.options.infoWindowContentProvider(data);
                    infowindow=new google.maps.InfoWindow({content: content});
                    infowindow.open(that.map,marker);
                });
            }
            return marker;
        },

        updateView: function(viz, data) {
            this.clearMap();
            for(var i=0;i<data.length;i++){
                marker=this.markerFactory(data[i]);
                this.markers.push(marker);
            }
            this.markerClusterer = new MarkerClusterer(this.map, this.markers);
            this.clearMessage();
        },
    });
    return GoogleMarkerMapView;
});