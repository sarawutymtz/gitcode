  fetch('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670,151.1957&radius=500&types=food&name=cruise&key=', { 
            headers: {
              'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },  
            method: "POST",
            body : "startdate="+encodeURIComponent($("#startdate").val())+"&enddate="+encodeURIComponent($("#enddate").val())
        }).then((resp) => resp.json()).then(function(data) {
            
        });