class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        this.createObjectRestaurant();
    }

    // methode qui créer les restau
    createObjectRestaurant() {
        $.getJSON('../JSON/restaurant.json', (elt)=> {
            console.log(elt);
            for (let restau of elt) {
                let restaurant = new Restaurant(restau.restaurantName, restau.address, restau.lat, restau.long, restau.ratings);
                this.listRestaurant.push(restaurant);
            }
            this.displayRestaurantList();
        });
    }

    initMap() {
        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 8
        });
    }

    displayRestaurantList(){
        for (let restaurant of this.listRestaurant) {
            console.log(restaurant.ratings);
            restaurant.createTagList();
        }
    }
}


