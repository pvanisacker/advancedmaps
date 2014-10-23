define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var GoogleMapView = require("app/advancedmaps/advancedmaps/googlemapview");
    var Messages = require("splunkjs/mvc/messages");

    var GoogleShapeMapView = GoogleMapView.extend({
        options:{
            geoJSONFile:"world2.geojson",
            data:"preview",
            colorRange:{
                "0.0"   :"rgba(0,255,64,0.6)",
                "0.1"   :"rgba(0,255,0,0.6)",
                "0.2"   :"rgba(64,255,0,0.6)",
                "0.3"   :"rgba(128,255,0,0.6)",
                "0.4"   :"rgba(192,255,0,0.6)",
                "0.5"   :"rgba(255,255,0,0.6)",
                "0.6"   :"rgba(255,192,0,0.6)",
                "0.7"   :"rgba(255,128,0,0.6)",
                "0.8"   :"rgba(255,64,0,0.6)",
                "0.9"   :"rgba(255,0,0,0.6)"
            },
            infoWindowContentProvider: function(feature,data){
                return "<div style='text-align:center;width:200px;height:30px'>"+data["key"]+": "+data["value"]+"</div>";
            },
        },
        shapes: {},
        maxValue:-Number.MAX_VALUE,
        minValue:Number.MAX_VALUE,

        defaultStyleProvider: function(feature){
            style = {
                fillColor: 'rgba(255, 255, 255, 0)',
                fillOpacity: 1,
                strokeColor: 'rgba(191,191,191,0.8)',
                strokeWeight: 1,
                zIndex:1,
            }
            if(feature && feature.getProperty('state')==='hover'){
                style.strokeWeight=3
                style.strokeColor='rgba(150,150,150,0.8)'
                style.zIndex=2
            }
            return style;
        },

        styleProvider: function(key){
            style=this.defaultStyleProvider(this.shapes[key]["obj"]);
            var percent = (value - this.minValue) / (this.maxValue - this.minValue);
            for(var key in this.options.colorRange){
                if(percent>=parseFloat(key)){
                    style.fillColor=this.options.colorRange[key];
                }
            }
            return style;
        },

        postCreateMap: function(){
            this.map.data.setStyle(this.defaultStyleProvider);
            var that=this;
            google.maps.event.addListener(this.map.data, 'addfeature', function(event) {
                key=event.feature.getId();
                if(!(key in that.shapes)){
                    that.shapes[key]={}
                }
                that.shapes[key]["obj"]=event.feature;
                that.colorShape(key);
            });
            this.map.data.addListener('mouseover', function(event){
                event.feature.setProperty('state', 'hover');
                that.colorShape(event.feature.getId());
            });
            this.map.data.addListener('mouseout', function(event){
                event.feature.setProperty('state', 'normal');
                that.colorShape(event.feature.getId());
            });
            if(this.options.infoWindowContentProvider){
                this.map.data.addListener('click', function(event) {
                    item=that.shapes[event.feature.getId()];
                    content=that.options.infoWindowContentProvider(event.feature,item.result);
                    infowindow=new google.maps.InfoWindow({content: content});
                    pos=new google.maps.MVCObject();
                    pos.set("position",event.latLng);
                    infowindow.open(that.map,pos);
                });
            }
            this.map.data.loadGeoJson('/static/app/advancedmaps/data/'+this.options.geoJSONFile,{ idPropertyName: 'id' });
        },

        clearMap: function() {

        },

        updateView: function(viz, data) {
            this.maxValue=-Number.MAX_VALUE;
            this.minValue=Number.MAX_VALUE;
            if(this.map){
                for(var i=0;i<data.length;i++){
                    var key = data[i]["key"];
                    var value = parseFloat(data[i]["value"]);
                    if(!(key in this.shapes)){
                        this.shapes[key]={}
                    }
                    this.shapes[key]["value"]=value;
                    this.shapes[key]["result"]=data[i];
                    if(this.maxValue<value) this.maxValue=value;
                    if(this.minValue>value) this.minValue=value;
                }
                this.colorShapes();
            }
            this.clearMessage();
        },

        colorShapes: function(){
            // iterate over all the shapes and trigger the coloring
            for(var key in this.shapes){
                this.colorShape(key);
            }
        },
        colorShape: function(key){
            if(key in this.shapes){
                if("value" in this.shapes[key]){
                    value=this.shapes[key]["value"]
                    style = this.styleProvider(key);
                    this.colorShapeStyle(key,style);
                }
            }
        },

        colorShapeStyle: function(key,style){
            // color a certain shape with a certain style
            feature=this.shapes[key]["obj"]
            if(feature){
                this.map.data.overrideStyle(feature,style);
            }
        },
    });
    
    return GoogleShapeMapView;
});
