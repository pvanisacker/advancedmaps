define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    var Messages = require("splunkjs/mvc/messages");

    require("css!splunkjs/css/googlemap.css");
    require("async!https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization");

    var GoogleMapView = SimpleSplunkView.extend({
        outputMode: 'json',

        initialize: function() {
            this.configure();

            this.$el.html(
                    '<div class="googlemapwrapper" style="height:100%">'+
                    '<div id="'+this.id+'-msg"></div>'+
                    '<div style="height: 100%" id="'+this.id+'-map" class="splunk-googlemap"></div>'+
                    '</div>')
            this.message = this.$('#'+this.id+'-msg');

            this.map = null;

            this._viz = null;
            this._data = null;
            this.bindToComponentSetting('managerid', this._onManagerChange, this);
            if (!this.manager) {
                this._onManagerChange(mvc.Components, null);
            }
            this.createMap();
        },
        createView: function(){
            return this;
        },

        clearMap: function() {
            return this
        },

        createMap: function() {
            if(!this.map){
                this.map = new google.maps.Map(document.getElementById(this.id+'-map'), {
                    center: new google.maps.LatLng(0, 0),
                    zoom: 2,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    streetViewControl:false,
                });
                this.map.setOptions(this.options.map);
                if(this.postCreateMap){
                    this.postCreateMap();
                }
            }
        },

        message: function(info) {
            this.map = null;
            Messages.render(info, this.$el);
        },

        displayMessage: function(info){
            if(info=="no-results"){
                this.clearView();
            }else{
                Messages.render(info, this.message);
                this.message.show();
            }
            return this;
        },
        clearMessage: function(){
            if(this.map){
                this.message.hide();
            }
        },
        clearView: function(){
            this.clearMap();
        }
    });

    return GoogleMapView;
});
