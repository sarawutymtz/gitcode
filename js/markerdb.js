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
            zoom: 15,
            center: pos,
        });

         fetch('http://dev.aitproject.com/moigis/marker/marker', { 
            headers: {
              'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },  
            method: "POST",
            body : "type="+($("#type").val())
            }).then((resp) => resp.json()).then(function(data) {
                gismap.marker(data.data);
            });    
    }, marker : function(data){
        if (data) {          
        for (var i = 0; i < data.length; i++) {
          gismap.createMarker(data[i]);
        }
      }
    }, createMarker : function (place){
    var infowindow = new google.maps.InfoWindow();
    var image = {
      url : place.icon,
      scaledSize: new google.maps.Size(20, 20), // scaled Size
    };

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(place.lat, place.lng),
        map: map ,
        icon:image
      });   
      google.maps.event.addListener(marker, 'click', function() {
        
      var content='<div><strong>' + place.name + '</strong><br>' +
                  '<b> พิกัด : </b>'+place.lat +' , '+ place.lng +'<br>';
      infowindow.setContent(content);
      infowindow.open(map, this);
    });
  }

}


  function changeType(obj)
  { 
    pos = {
       lat: 13.7804202, lng: 100.5814206
      };
    gismap.setmap(pos,obj.value);
  }

gismap.initMap();