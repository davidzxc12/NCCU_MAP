var menuOpen=false;
    var autocenter=false;
    var userLocation;
    var map;
    var marker;
    var markersParking = []
    var markersParkingCoord = [{lat: 24.987697, lng: 121.573020}, {lat: 24.987340, lng: 121.573560}, {lat: 24.987601, lng: 121.573930}, {lat: 24.987893, lng: 121.576249}, {lat: 24.985680, lng: 121.575186}, {lat: 24.986154, lng: 121.574893}, {lat: 24.985515, lng: 121.573472}, {lat: 24.985451, lng: 121.575949}, {lat: 24.987883, lng: 121.577587}, {lat: 24.985887, lng: 121.578421}, {lat: 24.986127, lng: 121.578943}];
    var labels=[];
    var fontsize = 20;
    var overlay;
    var doorLabels = [];
    var currentPositionMarker;
    var infowindow=new google.maps.InfoWindow({
      maxWidth:130
  });


    var mapStyle = [
     {
          featureType:"poi",
          elementType:"labels",
          stylers:[{ visibility:"off"}]
        }
        ,{
          featureType:"poi.business",
          elementType:"labels",
          stylers:[{ visibility:"on"}]
        },{
          featureType:"landscape",
          elementType:"labels",
          stylers:[{ visibility:"off"}]
        },{
          featureType:"road",
          elementType:"labels",
          stylers:[{visibility:"on"}]
        }
        ]

    USGSOverlay.prototype = new google.maps.OverlayView();

    var buildmap = []
  
        
    function initMap() {
      

      var myLatLng = {lat: 24.986592, lng: 121.575841};
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: myLatLng,
        panControl: false,
        streetViewControl: false,
        zoomControl:false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles:[
        {
          featureType:"poi",
          elementType:"labels",
          stylers:[{ visibility:"off"}]
        },{
          featureType:"landscape",
          elementType:"labels",
          stylers:[{ visibility:"off"}]
        }
        ]
      });
      map.data.loadGeoJson('map.json');
      // [START snippet]
      // Color each letter gray. Change the color when the isColorful property
      // is set to true.
      
      map.addListener('zoom_changed',function(){
        switch(map.getZoom()){
          case 21:
            fontsize=70;
            changeLabelFontSize(doorLabels,fontsize-10);
            break;
          case 20:
            fontsize=60;
            changeLabelFontSize(doorLabels,fontsize-10);
            break;
          case 19:
            fontsize=40;
            changeLabelFontSize(doorLabels,fontsize-10);
            break;
          case 18:
            fontsize=30;
            changeLabelFontSize(doorLabels,fontsize-10);
            break;
          case 17:
          case 16:
          case 15:
            fontsize=20;
            changeLabelFontSize(doorLabels,fontsize-10);
            break;
        }
      }); 
  
      map.data.setStyle(function(feature) {
        var fColor = 'gray', sColor = 'gray', fOpacity = 1.0, sOpacity = 1.0, sWeight = 1.0;
        if(feature.getProperty('isColorful')) {
          fColor = feature.getProperty('fill-color');
          fOpacity = 0.6;
          sColor = feature.getProperty('stroke-color');
          sOpacity = 0;
          //feature.getProperty('stroke-opacity');
          sWeight = feature.getProperty('stroke-weight');
        }
        
        

        
        return /** @type {google.maps.Data.StyleOptions} */({
            fillColor: fColor,
            fillOpacity: fOpacity,
            strokeColor: sColor,
            strokeOpacity: sOpacity,
            strokeWeight: sWeight
            // zIndex: 2
            });

        });
        
 
      marker = new MarkerWithLabel({
        position: myLatLng,
        map: null,
        draggable: false,
        raiseOnDrag: true,
        animation: google.maps.Animation.DROP,
        labelContent: "您目前所選建築",
        labelAnchor: new google.maps.Point(45, 0),
        // labelClass: "labels", // the CSS class for the label
        icon: {
              url: "img/red-circle.png",
              size: new google.maps.Size(32, 32),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(0, 32)
  }
        // https://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclusterer/1.0.2/
      });


      /**
       * addListener code block
       * click, mouseover, mouseout, etc.
       */
      // google.maps.event.addListener(makersadmin, "click", function(e) {
      //   placeMarkerAndPanTo(e.latLng, map);
      // });
      // When the user clicks, set 'isColorful', changing the color of the letters.
      map.data.addListener('click', function(event) {
        // event.feature.setProperty('isColorful', true);
        placeMarkerAndPanTo(event.latLng, map);
        infowindow.setPosition(new google.maps.LatLng(event.feature.getProperty('centerlat'),event.feature.getProperty('centerlng')));
        infoContent(event.feature.getProperty('ID'));
        infowindow.open(map);
      });
      // When the user hovers, tempt them to click by outlining the letters.
      // Call revertStyle() to remove all overrides. This will use the style rules
      // defined in the function passed to setStyle()
      map.data.addListener('mouseover', function(event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, {strokeWeight: 3});
        map.data.overrideStyle(event.feature, {fillColor: "#FF0000"});
        for(var i=0;i<labels.length;i++){
          if(labels[i].text==event.feature.getProperty('buildingzh')){
            labels[i].set('fontSize', fontsize);
            labels[i].setMap(map);
            break;
          }
        }
      });

      map.data.addListener('mouseout', function(event) {
        map.data.revertStyle();
        for(var i=0;i<labels.length;i++){
          if(labels[i].text==event.feature.getProperty('buildingzh')){
            labels[i].setMap(null);
            break;
          }
        }
      });
      
      map.addListener('drag',function(){
        autocenter=false;
      });
      
      var getLocationControl = document.getElementById('getLocationControl');
      getLocationControl.addEventListener('click', function(){
        $('#getLocation').trigger('click')
      })
      getLocationControl.index=1;
       var getNCCUControl = document.getElementById('getNCCUControl');
      getNCCUControl.addEventListener('click', function(){
        $('#getNCCU').trigger('click')
      })
      getNCCUControl.index=1; 
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(getLocationControl);
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(getNCCUControl); 
      
      // [END snippet]
      // google.maps.event.addListener(marker , "mouseover" , function(){

      // });
      
      for (var i=1; i<=buildmap.length; i++)
      {
          overlay = new USGSOverlay(buildmap[i-1], "", map);
          //console.log(buildmap);
      }
      
      // 加入Autoomplete至搜尋欄
      addAutocomplete();
    
      $.getJSON("map.json", function(json) {
      //console.log(json.feature); // this will show the info it in firebug console
      
       for (var i in json.features) {
            var ct_lat = json.features[i].properties.centerlat;
            var ct_lng = json.features[i].properties.centerlng;

            var sw = new google.maps.LatLng(ct_lat - 0.0003 ,ct_lng - 0.0003 );
            var ne = new google.maps.LatLng(ct_lat + 0.0003 ,ct_lng + 0.0003);

            var ct = new google.maps.LatLngBounds( sw , ne );

            // console.log(ct)

            buildmap.push(ct);
            
            var mapLabel = new MapLabel({
              fontFamily:"Microsoft JhengHei",
              text: json.features[i].properties.buildingzh,
              position: new google.maps.LatLng(ct_lat,ct_lng),
              map: map,
              fontSize: 20,
              align: 'center',
            });
            mapLabel.setMap(null);
            labels.push(mapLabel);
        }
    });

      doorLabels.push(new MapLabel({
              fontFamily:"Microsoft JhengHei",
              text: "政大正門",
              position: new google.maps.LatLng(24.987598,121.576050),
              map: map,
              fontSize: fontsize-10,
              align: 'center',
              minZoom:16,
              strokeWeight:2,
              fontColor:"#696e6d"
            }));
      doorLabels.push(new MapLabel({
              fontFamily:"Microsoft JhengHei",
              text: "政大側門(外舍)",
              position: new google.maps.LatLng(24.987358,121.577226),
              map: map,
              fontSize: fontsize-10,
              align: 'center',
              minZoom:16,
              strokeWeight:4,
              fontColor:"#696e6d"
            }));
      doorLabels.push(new MapLabel({
              fontFamily:"Microsoft JhengHei",
              text: "政大側門(麥測)",
              position: new google.maps.LatLng(24.987824,121.574885),
              map: map,
              fontSize: fontsize-10,
              align: 'center',
              minZoom:16,
              strokeWeight:4,
              fontColor:"#696e6d"
            }));
      doorLabels.push(new MapLabel({
              fontFamily:"Microsoft JhengHei",
              text: "政大後門",
              position: new google.maps.LatLng(24.979698,121.567940),
              map: map,
              fontSize: fontsize-10,
              align: 'center',
              minZoom:16,
              strokeWeight:4,
              fontColor:"#696e6d"
            }));


      
    }

    function changeLabelFontSize(labels,size){
      for(var i =0 ; i<labels.length; i++){
        labels[i].set('fontSize', size);
      }
    }

    function addContent(content){
      infowindow.setContent(content);
    }

    function infoContent(id){
      $.getJSON("map.json", function(json) {
          for (var i in json.features) {
            if(json.features[i].properties.ID==id){
              addContent(json.features[i].properties.description);
              console.log('add content');
            }
          }
        });
            

    }
    
    // 加入Google autoComplete搜尋欄
    function addAutocomplete() {
      // add your codes below
      var input = document.getElementById('pac-input');
      var autocomplete =  new google.maps.places.Autocomplete(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      autocomplete.bindTo('bounds', map);
    
      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
          console.log("Autocomplete's returned place contains no geometry!")
          reutrn;
        }
    
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        }
        else {
          map.setCenter(place.geometry.location);
          map.seZoom(17);
        }
    
        // searchLocationsNear(place.geometry.location);
      });
    }
    
    function locError(err){
      console.log("The current Position could not be found!");
    }
    
    function setCurrentPosition(pos){
      var image={
        url:"img/blue-circle.png",
        size: new google.maps.Size(32,32),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,32)
      }
      currentPositionMarker=new google.maps.Marker({
        position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
        icon:image,
        map:map,
        draggable:false,
        raiseOnDrag:false,
        animation:google.maps.Animation.DROP,
        title:"目前位置",
        
      });
    }

    function nearby(loc){

        console.log(google.maps.geometry.spherical.computeDistanceBetween (new google.maps.LatLng(24.986592,121.575841),loc));
       // while(currentPositionMarker.map==undefined)
       //   currentPositionMarker.setMap(map);
       if( getParameterByName('blid')==null ){
        if(google.maps.geometry.spherical.computeDistanceBetween (new google.maps.LatLng(24.986592,121.575841),loc)<400){
          map.setCenter(loc);
          console.log('user location')
        }
       }
    }
    
    function displayAndWatch(position){
      console.log("set location");
      userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      nearby(userLocation);
      setCurrentPosition(position);
      watchCurrentPosition();
    }
    
    function watchCurrentPosition(){
            if(currentPositionMarker.Map==undefined)
          currentPositionMarker.setMap(map)
      var positionTimer=navigator.geolocation.watchPosition(function(position){
        setMarkerPosition(
          currentPositionMarker,position);
      });
    }
    
    function setMarkerPosition(marker,position){
      marker.setPosition(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
      if(autocenter)
        map.panTo(marker.getPosition())
      
    }

    function USGSOverlay(bounds, image, map) {

        // Now initialize all properties.
        this.bounds_ = bounds;
        this.image_ = image;
        this.map_ = map;

        // We define a property to hold the image's div. We'll
        // actually create this div upon receipt of the onAdd()
        // method so we'll leave it null for now.
        this.div_ = null;
        
        //console.log(this.bounds_);
        // Explicitly call setMap on this overlay
        this.setMap(map);
      }
      USGSOverlay.prototype.onAdd = function() {

        // Note: an overlay's receipt of onAdd() indicates that
        // the map's panes are now available for attaching
        // the overlay to the map via the DOM.

        // Create the DIV and set some basic attributes.
        var div = document.createElement('div');
        div.className = "hello";
        div.style.border = 'solid';
        div.style.borderWidth = '8px';
        div.style.borderRadius = '99em';
        div.style.position = 'absolute';
        div.style.color = "#ff0000";
        
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        var declarations = document.createTextNode('.hello:hover { borderWidth:19px }');

        style.type = 'text/css';

        if (style.styleSheet) {
          style.styleSheet.cssText = declarations.nodeValue;
        } else {
          style.appendChild(declarations);
        }

        head.appendChild(style);

        // Create an IMG element and attach it to the DIV.
        var img = document.createElement('img');
        img.src = this.image_;
        img.style.width = '100%';
        img.style.height = '100%';

        
        
        //img.style.position = 'absolute';
        div.appendChild(img);

        // Set the overlay's div_ property to this DIV
        this.div_ = div;

        // We add an overlay to a map via one of the map's panes.
        // We'll add this overlay to the overlayLayer pane.
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
      }

      USGSOverlay.prototype.draw = function() {


        var overlayProjection = this.getProjection();



        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());



        // Resize the image's DIV to fit the indicated dimensions.
        var div = this.div_;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (sw.y - ne.y) + 'px';
        
      }

      USGSOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      }


    function placeMarkerAndPanTo(latLng, map) {
      marker.setMap(null);
      marker.setPosition(latLng);
      marker.setMap(map);
      toggleBounce();
      map.setZoom(18);
      map.setCenter(marker.getPosition());
      // map.panTo(latLng);
    }
    function toggleBounce() {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    }
    
    function checked_checkbox() {
      map.data.setStyle(function(feature) {
          var opacity=0;
          var fopacity=0;
          
          if($('#checkbox-Administrations').is(':checked')){
            if(feature.getProperty('department')=='Administrations'){
              opacity=0.6;
              fopacity=0;}
          }
          if($('#checkbox-Education').is(':checked')){
            if(feature.getProperty('department')=='Education'){
             opacity=0.6;
              fopacity=0;}
          }
          if($('#checkbox-Dormitories').is(':checked')){
            if(feature.getProperty('department')=='Dormitories'){
              opacity=0.6;
              fopacity=0;}
          }
          if($('#checkbox-Services').is(':checked')){
            if(feature.getProperty('department')=='Services'){
              opacity=0.6;
              fopacity=0;}
          }
          if($('#checkbox-Sports').is(':checked')){
            if(feature.getProperty('department')=='Sports'){
              opacity=0.6;
              fopacity=0;}
          }

          if($('#checkbox-Attractions').is(':checked')){
            if(feature.getProperty('department')=='Attractions'){
              opacity=0.6;
              fopacity=0;}
          }
          return({
            fillColor: feature.getProperty('fill-color'),
            fillOpacity: opacity,
            strokeColor: feature.getProperty('stroke-color'),
            strokeOpacity: fopacity,
            strokeWeight: feature.getProperty('stroke-weight')
          })
      })
    }
    
    
    function dropParkings() {
      clearParkings();
      for (var i = 0; i < markersParkingCoord.length; i++) {
        addParkingsMarkerWithTimeout(markersParkingCoord[i], i * 200);
      }
    }
    
    function addParkingsMarkerWithTimeout(position, timeout) {
      window.setTimeout(function() {
        markersParking.push(new google.maps.Marker({
          position: position,
          map: map,
          animation: google.maps.Animation.DROP,
          icon: "img/parkings.png"
        }));
      }, timeout);
    }
    
    function clearParkings() {
      for (var i = 0; i < markersParking.length; i++) {
        markersParking[i].setMap(null);
      }
      markersParking = [];
    }
    function readblid(){
      var blid = getParameterByName('blid');
      console.log(blid);
      if (blid != null){
        $.getJSON("map.json", function(json) {
          for (var i in json.features) {
            console.log("outer for")
            if(json.features[i].properties.buildingid!= undefined){
              console.log("outer if");
              for (var j=0; j<json.features[i].properties.buildingid.length; j++) {
                if( blid == json.features[i].properties.buildingid[j]) {
                console.log("inner if");
                  var ct_lat = json.features[i].properties.centerlat;
                  var ct_lng = json.features[i].properties.centerlng;
                  var searchLatLng = {lat: ct_lat, lng: ct_lng};
                
                  placeMarkerAndPanTo(searchLatLng, map);
                  break;
                }
              }
            }
          }
        });
      }
    }
    
    function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    
    var main = function() {
      initMap();
       setTimeout(function(){
        $('#map').height($(window).height()-$('.navbar-custom').height())
        $('.total-row').height($(window).height()-$('.navbar-custom').height())
        $('.menu').css('left',$('.menu').width()*-1+"px" );
      readblid();
      },0);


      
      $("#getLocation").click(function(){
        if(currentPositionMarker!=undefined){
        map.panTo(currentPositionMarker.getPosition());
        console.log('pan to current position')
        map.setZoom(18);
        autocenter=true;}
        else{
          window.alert("找不到GPS定位");
        }
        $('.icon-close').trigger("click");
      });
      
      $('#getNCCU').click(function(){
        map.panTo({lat: 24.986589, lng:121.575820});
        map.setZoom(18);
        autocenter=false;
       $('.icon-close').trigger("click");
      })
      
      $("input[type='checkbox']").click(function(){
        checked_checkbox()
      });
      
      $("#checkbox-Parkings").click(function(){
        if($('#checkbox-Parkings').is(':checked')) {
          dropParkings();
        } else {
          clearParkings();
        }
      });


      $('#checkbox-Food').click(function(){
        var index = mapStyle.map(function(x){return x.featureType}).indexOf("poi.business");
        //var index = mapStyle.findIndex(x => x.featureType=='poi.business')
        if($('#checkbox-Food').is(':checked')){
         var newStyle = {
          featureType:"poi.business",
          elementType:"labels",
          stylers:[{ visibility:"on"}]
        }
        mapStyle.splice(index,1,newStyle);
        map.setOptions({styles:mapStyle});
        }
      else{
        var newStyle = {
          featureType:"poi.business",
          elementType:"labels",
          stylers:[{ visibility:"off"}]
        }
        mapStyle.splice(index,1,newStyle);
        map.setOptions({styles:mapStyle});
      }
    })


      $('#checkbox-Road').click(function(){
        var index = mapStyle.map(function(x){return x.featureType}).indexOf("road");
        //var index = mapStyle.findIndex(x => x.featureType=='road');
        if($('#checkbox-Road').is(':checked')){
          var newStyle = {
          featureType:"road",
          elementType:"labels",
          stylers:[{ visibility:"on"}]
        }
          mapStyle.splice(index,1,newStyle);
          map.setOptions({styles:mapStyle});
        }
      else{
        var newStyle = {
          featureType:"road",
          elementType:"labels",
          stylers:[{ visibility:"off"}]
        }
          mapStyle.splice(index,1,newStyle);
          map.setOptions({styles:mapStyle});}
      }
    )
    
      $("#campus-srchbtn").click(function (event) {
        var flag = false;
        event.preventDefault();
        $.getJSON("map.json", function(json) {
          for (var i in json.features) {
            for (var j=0; j<json.features[i].properties.search.length; j++) {
              if( $("#campus-input").val().localeCompare(json.features[i].properties.search[j]) == 0) {
                var ct_lat = json.features[i].properties.centerlat;
                var ct_lng = json.features[i].properties.centerlng;
                var searchLatLng = {lat: ct_lat, lng: ct_lng};
                placeMarkerAndPanTo(searchLatLng, map);
                infowindow.setPosition(new google.maps.LatLng(ct_lat,ct_lng));
                infoContent(json.features[i].properties.ID);

                infowindow.open(map);
                flag=true;
              }
            }
            if(flag){
              $('.icon-close').trigger("click");
              break;
            }
          }
          if(!flag)
            alert("找不到符合的建築物");
        });

      });

      $(window).resize(function(){
        $('#map').height($(window).height()-$('.navbar-custom').height())
        if(!menuOpen){
          $('.menu').css('left',$('.menu').width()*-1+"px" );
        }

      })
    
     
    
   
      
      /* Push the body and the nav over by 285px over */
      $('.icon-menu').click(function() {
        if(menuOpen){
          $('.icon-close').trigger('click');
        }
        else{

        $('.menu').animate({
          left: "0px"
        }, 200);



       
        menuOpen=true;
      }
      });
      /* Then push them back */
      $('.icon-close').click(function() {
        $('.menu').animate({
          left: $('.menu').width()*-1+"px"
        }, 200);
        menuOpen=false;
      });
      $('#reload1').click(function() {
        window.location.reload();
        //alert("reload 1 works");
      });
      $('#reload2').click(function() {
        window.location.reload();
      });
      
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(displayAndWatch,locError);
        
      }
      else{
        alert("not support locate service!");
      }
      
    //  setTimeout(function(){
       // while(currentPositionMarker.map==undefined)
       //   currentPositionMarker.setMap(map);
   //   },3000);
      
      
    
    };
    $(document).ready(main);
    
