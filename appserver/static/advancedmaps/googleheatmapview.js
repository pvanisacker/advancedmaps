define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var GoogleMapView = require("app/advancedmaps/advancedmaps/googlemapview");
    var Messages = require("splunkjs/mvc/messages");

    var GoogleHeatMapView = GoogleMapView.extend({
        options: {
            type:"density",
            heatmap:{},
        },

        clearMap: function() {
            if(this.heatmap){
                this.heatmap.setMap(null);
            }
        },

        updateView: function(viz, data) {
            var resultData=[];

            for(var i=0;i<data.length;i++){
                var lat = parseFloat(data[i]["lat"]);
                var lng = parseFloat(data[i]["lng"]);
                var value = parseFloat(data[i]["value"]);
                var latlng = new google.maps.LatLng(lat, lng);
                if(this.options.type=="density"){
                    resultData.push(latlng);
                }
                if(this.options.type=="value"){
                    resultData.push({location:latlng,weight:value});
                }
            };

            var options={};
            if(this.options.heatmap.dissipating){
                options.dissipating=this.options.heatmap.dissipating;
            }
            if(this.options.heatmap.opacity){
                options.opacity=this.options.heatmap.opacity;
            }
            if(this.options.heatmap.radius){
                options.radius=this.options.heatmap.radius;
            }
            if(this.options.heatmap.gradient){
                options.gradient=this.options.heatmap.gradient;
            }
            if(this.options.heatmap.maxIntensity){
                options.maxIntensity=this.options.heatmap.maxIntensity;
            }
            this.heatmap = new google.maps.visualization.HeatmapLayer(options);
            this.heatmap.setData(new google.maps.MVCArray(resultData));
            this.heatmap.setMap(this.map);
            this.clearMessage();
        },
    });
    return GoogleHeatMapView;
});