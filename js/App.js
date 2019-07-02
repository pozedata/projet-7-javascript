class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        this.marker;
        this.createObjectRestaurant();
    }

    // methode qui créer les objet restaurant
    createObjectRestaurant() {
        $.getJSON('../JSON/restaurant.json', (elt)=> {
            for (let restau of elt) {
                let restaurant = new Restaurant(restau.restaurantName, restau.address, restau.lat, restau.long, restau.ratings);
                this.listRestaurant.push(restaurant);
            }
            this.displayRestaurantElt();

        });
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: 48.888568, lng: 2.348442},
            zoom: 20
        });
    }

    displayRestaurantElt(){
        for (let restaurant of this.listRestaurant) {
            restaurant.createTagList();
            restaurant.createMarker(this.marker, this.map);
        }
    }
}


