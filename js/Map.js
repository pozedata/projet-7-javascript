class Map {
    constructor(map){
        this.map = map;
        this.infoWindow;
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: 48.888568, lng: 2.348442},
            zoom: 15
        });
    //     this.infoWindow = new google.maps.InfoWindow;

    //     // Try HTML5 geolocation.
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition((position)=> {
    //         var pos = {
    //             lat: position.coords.latitude,
    //             lng: position.coords.longitude
    //         };
  
    //         this.infoWindow.setPosition(pos);
    //         this.infoWindow.setContent('Location found.');
    //         this.infoWindow.open(this.map);
    //         this.map.setCenter(pos);
    //         }, 
    //         ()=> {
    //             this.handleLocationError(true, this.infoWindow, this.map.getCenter());
    //         });
    //   } else {
    //       // Browser doesn't support Geolocation
    //       this.handleLocationError(false, this.infoWindow, this.map.getCenter());
    //   }
    }

    // handleLocationError(browserHasGeolocation, infoWindow, pos) {
    //     infoWindow.setPosition(pos);
    //     infoWindow.setContent(browserHasGeolocation ?
    //         'Error: The Geolocation service failed.' :
    //         'Error: Your browser doesn\'t support geolocation.');
    //     infoWindow.open(this.map);
    // }
}