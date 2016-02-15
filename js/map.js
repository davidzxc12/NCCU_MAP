Parse.initialize("rX1EYeweoIwf99RpMjwgGuNZgTZht9DXnGPKAKTY", "9RVpTJQGcViZxLX30dcPuPmhSByVh43Ef5GM192t");
var map;
var infoWindow; // 顯示在marker上的window
var markers = []; // 要顯示的所有marker
function initMap() {
 

  // 加入Autoomplete至搜尋欄
  addAutocomplete();

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

    searchLocationsNear(place.geometry.location);
  });
}



/*
 * you may not change the codes below
 */

//將地圖中心設為使用者地點
function setCenterAtUserLocation() {
  var browserSupportFlag = false;
  // 如果瀏覽器支援地理位置
  if (navigator.geolocation) {
    browserSupportFlag = true;
    // 要求使用者位置，須使用者同意
    navigator.geolocation.getCurrentPosition(function(position) {
      var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(initialLocation);

      //搜尋中心附近的資料庫內地點
      searchLocationsNear(map.getCenter());

    }, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  }
  // 瀏覽器不支援地理位置
  else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }

  function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
      alert("地理位置服務失敗");
    }
    else {
      alert("瀏覽器不支援地理位置");
    }
  }
}

//清除地圖上的markers
function clearLocations() {
  infoWindow.close();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

//從Parse資料庫中讀取給予位置的附近地點
function getNearNodes(lat, lng, radius) {
  var PlaceObject = Parse.Object.extend("PlaceObject");
  var query = new Parse.Query(PlaceObject);
  // Interested in locations near user.
  var point = new Parse.GeoPoint({
    latitude: lat,
    longitude: lng
  });
  query.near("location", point);
  query.withinKilometers("location", point, radius)
    // Limit what could be a lot of points.
  query.limit(20);
  // Final list of objects
  query.find({
    success: function(placesObjects) {
      //將搜尋結果加入地圖
      addMarkersToMaps(placesObjects);
    }
  });
}

//搜尋
function searchLocationsNear(location) {
  //清除資料
  clearLocations();
  var radius = 2; // 搜尋範圍(KM)
  getNearNodes(location.lat(), location.lng(), radius); // 到Parse資料庫搜尋
}

function addMarkersToMaps(markerNodes) {
  for (var i = 0; i < markerNodes.length; i++) {
    var name = markerNodes[i].get("name");
    var address = markerNodes[i].get("address");
    var location = markerNodes[i].get("location");
    var latlng = new google.maps.LatLng(
      parseFloat(location.latitude),
      parseFloat(location.longitude)
    );
    createMarker(latlng, name, address);
  }
}

//在latlng座標上建地marker跟其infoWindow
function createMarker(latlng, name, address) {
  // add your codes below
  var marker = new google.maps.Marker({
    map: map,
    position: latlng
  });

  var html = "<b>" + name + "</b> </br>" + address;

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}
