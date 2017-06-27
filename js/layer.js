var map;
var infowindow;
var key = 'AIzaSyDZC-zX8YbC8vtHgD47twHl_mI4G3hsJn8';
var gismap = {

    initMap : function () {
        var pos;
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
             pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            gismap.setmap(pos);
          }, function() {
            pos = {
              lat: 13.7804202, lng: 100.5814206
            };
            gismap.setmap(pos);
          });
        } else {
            pos = {
             lat: 13.7804202, lng: 100.5814206
            };
            gismap.setmap(pos);
        }
    
    }, setmap : function (pos){

         map = new google.maps.Map(document.getElementById('map'), {
            zoom: 6,
            center: pos
        });

        // NOTE: This uses cross-domain XHR, and may not work on older browsers.
        map.data.loadGeoJson(
            '../layer/province.geojson');
    
        map.data.addListener('click', function(event) {
            map.data.revertStyle();
            map.data.overrideStyle(event.feature, {fillColor: 'red'});
            map.panTo(event.latLng);
            map.setZoom(8);

            gismap.getdata(event);
    //     console.log(map, event.feature.f.ID_1);
        });

        map.addListener('click', function(e) {
            map.panTo(e.latLng);
        });

    }, getdata : function (event){

        fetch('http://localhost/apimoi/province/layer', { 
            headers: {
              'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },  
            method: "POST",
            body : "id="+event.feature.f.ID_1
        }).then((resp) => resp.json()).then(function(data) {
            gismap.getdetail(event, data.data);
        });

    }, getdetail : function(event, data){

        if(!!infowindow) infowindow.close();
        
        infowindow = new google.maps.InfoWindow({
            content: '<div><h1>'+ data[0].name +'</h1><p>หญิง : '+data[0].male +' <br/> ชาย : '+ data[0].female+'</p><div>'
        });

        var anchor = new google.maps.MVCObject();
        anchor.set("position",event.latLng);
        console.log(event.latLng);
        infowindow.open(map,anchor);

    }

}
gismap.initMap();