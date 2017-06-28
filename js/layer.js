var map;
var infowindow;
var key = 'AIzaSyDZC-zX8YbC8vtHgD47twHl_mI4G3hsJn8';
var layerfuture;

var gismap = {
    urlapi : function(){
        return 'http://dev.aitproject.com/moigis/';
    },
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
            center: pos,
            styles : [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}]
        });

        // NOTE: This uses cross-domain XHR, and may not work on older browsers.
        map.data.loadGeoJson(
            '../layer/province.geojson');

        var scalecolor = chroma.scale(['yellow', 'red']).domain([0,100]); //chroma.scale(['orange', 'red']).domain([0,100]).classes(20);

        $("#colorgroup").html('');

        for (var r = 1; r < 101; r++) {
            $("#colorgroup").append('<span class="colorlist" style="background-color:'+scalecolor(r).hex()+'"></span>');
        }
        
        $("#listpepole").html('');
        gismap.getheatdata(function(data){

            layerfuture = [];
            map.data.setStyle(function(feature) {
                
               // var color = gismap.getcolor(feature.getProperty('ID_1'));

                for (var r = 0; r < data.data.length; r++) {

                    var result = data.data[r];

                    if(+result.id === feature.getProperty('ID_1'))
                    {

                        //(5686646 / 100) / 5686646 * 100
                       // percentpoint = (((result.summary / 100) / result.maximum) * 100);

                       color = scalecolor(result.percent).hex();

                       if(!layerfuture[r]) $("#listpepole").append('<li data-id="'+r+'" class="list-group-item"><span style="background-color:'+color+'" class="badge">'+result.summary+'</span>'+result.name+'</li>');
                        

                       layerfuture[r] = feature;
                        
                        return({
                            fillColor: color,
                            strokeColor: '#ffffff',
                            strokeWeight: 1,
                            fillOpacity : 0.8,
                        });                     

                    }

                }
                
                
            });

            gismap.getstylelayer();

        });
        

        // map.data.setStyle({
        //     fillColor: 'green',
        //     fillOpacity : 0.3,
        //     strokeWeight: 1,
        //     strokeOpacity : 0.9
        // });

        map.data.addListener('mouseover', function(event) {
            map.data.revertStyle();
            map.data.overrideStyle(event.feature, {fillColor: 'green'});
        });

        map.data.addListener('mouseout', function(event) {
            map.data.revertStyle();
        });

        map.data.addListener('click', function(event) {
            
            var bounds = new google.maps.LatLngBounds(); 
            map.data.forEach(function(feature){
              event.feature.getGeometry().forEachLatLng(function(latlng){
                 bounds.extend(latlng);
              });
            });

            gismap.getdata(event, bounds);

        });

  
    }, getheatdata : function (callback){
        
        fetch(this.urlapi()+'province/layerheat', { 
            headers: {
              'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },  
            method: "GET",
        }).then((resp) => resp.json()).then(function(data) {
            callback(data);
        });
        
    }, getdata : function (event, bounds){

        fetch(this.urlapi()+'province/layer', { 
            headers: {
              'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },  
            method: "POST",
            body : "id="+event.feature.getProperty('ID_1')
        }).then((resp) => resp.json()).then(function(data) {
            gismap.getdetail(data.data, bounds);
        });

    }, getdetail : function(data, bounds){

        if(!!infowindow) infowindow.close();
        

        infocontent = '<h1>'+ data.name +'</h1>';
        infocontent += '<p>หญิง : '+ parseInt(data.male).format_number() +' <br/>';
        infocontent += 'ชาย : '+ (+data.female).format_number() +'<br/>';
        infocontent += 'รวมทั้งหมด : '+(+data.male + +data.female).format_number()+'<br/>';
        infocontent += 'คิดเป็น : ' +data.evg+'% </p>';
        

        infowindow = new google.maps.InfoWindow({
            content: '<div  style="width:550px;" class="container-fluid">'+
            '<div class="row">'+
            '<div class="col-md-8"><div style="width:100%;height:300px;" id="container"></div></div>'+
            '<div class="col-md-4">'+infocontent+'</div>'+
            '</div>'+
            '</div>'
        });

        var anchor = new google.maps.MVCObject();
        anchor.set("position",bounds.getCenter());
        infowindow.open(map,anchor);

        google.maps.event.addListener(infowindow,'domready',function(){
            console.log('test');
            console.log(document.getElementById('container'));
            gismap.getpiechart(data);
        });

    }, randomhex : function (){
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    }, getcolor : function (value){
         var hue=((1-value)*120).toString(10);
        return ["hsl(",hue,",100%,50%)"].join("");
    }, getpiechart : function (data){
        
        var options = {
            chart: {
                renderTo : 'container',
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                text: '<b>จำนวนชายหญิงจังหวัด : </b>'+data.name,
                align: 'center',
                verticalAlign: 'top',
                y: 40
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        format : '{point.name} {point.y}',
                        enabled: true,
                        distance: -50,
                        style: {
                            fontWeight: 'bold',
                            color: 'white'
                        }
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '75%']
                }
            },
            series: [{
                type: 'pie',
                name: 'จำนวน',
                keys: ['name', 'y', 'sliced', 'selected'],
                innerSize: '50%',
                data: [
                    ['ชาย',   +data.male],
                    ['หญิง',       +data.female]
                ]
            }]
        };

        var chart = new Highcharts.Chart(options, function(chart) {
        });
        
    }, addpoint : function(position){

        console.log(position);
     //   https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=13.789586,100.581838&radius=300000&types=food&name=cruise&key=AIzaSyDZC-zX8YbC8vtHgD47twHl_mI4G3hsJn8

        // fetch(this.urlapi()+'province/layer', { 
        //     headers: {
        //       'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
        //       'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        //     },  
        //     method: "POST",
        //     body : "id="+event.feature.getProperty('ID_1')
        // }).then((resp) => resp.json()).then(function(data) {
        //     gismap.getdetail(event, data.data);
        // });

    }, getstylelayer : function (){
        
        $( "#listpepole" ).delegate( ".list-group-item", "mouseover", function() {
            id = $(this).attr('data-id');
            map.data.overrideStyle(layerfuture[id], {fillColor: 'green'});
            //getCenter().lat(), 

        });

        $( "#listpepole" ).delegate( ".list-group-item", "mouseout", function() {
            map.data.revertStyle();
        });


        $( "#listpepole" ).delegate( ".list-group-item", "click", function() {
            id = $(this).attr('data-id');

            var bounds = new google.maps.LatLngBounds(); 
            map.data.forEach(function(feature){
              layerfuture[id].getGeometry().forEachLatLng(function(latlng){
                 bounds.extend(latlng);
              });
            });

            event = { feature : layerfuture[id]};
            gismap.getdata(event,bounds);

        });


        

        // map.data.addListener('mouseover', function(event) {
        //     map.data.revertStyle();
        //     map.data.overrideStyle(event.feature, {fillColor: '#f00'});
        // });
    }

}

gismap.initMap();

Number.prototype.format_number = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};
