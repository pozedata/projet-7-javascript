class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        // this.map = new Map();
        // this.map.initMap();
        this.infoWindow;
        this.markerUser;
        this.averageRestaurantRating = [];
        this.highestRated; // comment faire si j'ai plusieurs restaurant avec la meilleure note posible ? 
        this.newListRestaurant = [];
        
        this.createObjectRestaurant();
        this.selectionRestaurantByRating();
        
    }

    // methode qui créer les objet restaurant
    createObjectRestaurant() {
        $.getJSON('../JSON/restaurant.json', (elt)=> {
            for (let restau of elt) {
                let id = this.listRestaurant.length
                let restaurant = new Restaurant(id, restau.restaurantName, restau.address, restau.lat, restau.long, restau.ratings);
                this.listRestaurant.push(restaurant);
            }
            this.displayRestaurantElt();
        });
        // console.log(Math.max(...this.averageRestaurantRating));
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: 48.888568, lng: 2.348442},
            zoom: 15
        });
        this.infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position)=> {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            this.markerUser = new google.maps.Marker({
                position: pos, 
                map: this.map,
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });
      
            this.infoWindow.setPosition(pos);
            this.infoWindow.setContent('Vous êtes ici');
            this.infoWindow.open(this.map);
            this.map.setCenter(pos);
          }, 
          function() {
            this.handleLocationError(true, this.infoWindow, this.map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          this.handleLocationError(false, this.infoWindow, this.map.getCenter());
        }
    }

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(this.map);
    }

    displayRestaurantElt(){
        for (let restaurant of this.listRestaurant) {
            restaurant.createTagList();
            restaurant.createMarker(this.map);
            $('#btn-'+restaurant.id+'').on("click",()=> {
                restaurant.showDescription();
            });
            this.averageRestaurantRating.push(restaurant.averageStar);
        }
        this.highestRated = Math.max.apply(null, this.averageRestaurantRating);
        this.showBestRestaurant();
    }

    showBestRestaurant(){
        let bestRestaurant = this.listRestaurant.find(elt => (elt.averageStar === this.highestRated));
        bestRestaurant.showDescription();
    }

    selectionRestaurantByRating() {
        $('#valForm').click(()=>{
            let minStar = $('#form-min').val();
            let maxStar = $('#form-max').val();
            if( minStar > maxStar) {
                alert('la note minimum attribuer et plus grande que la note maximum');
            }
            else {
                this.listRestaurant.forEach(element => {
                    if ((element.averageStar >= minStar) && (element.averageStar <= maxStar)) {
                        this.newListRestaurant.push(element);
                    }
                });
            }
            this.deleteRestaurantList();
            this.addRestaurantSelected();
        });
    }

    deleteRestaurantList() {
        for (let restaurant of this.listRestaurant){
            $('#btn-'+restaurant.id+'').remove();
        }
    }

    addRestaurantSelected() {
        for (let restaurant of this.newListRestaurant){
            restaurant.createTagList();
        }
    }
}


