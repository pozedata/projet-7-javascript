class App {
    constructor(){
        this.restTest = new Restaurant();
        this.listRestaurant = [];
        this.map;
    }

    // methode qui créer les restau
    createObjectRestaurant() {

            // $.getJSON('../JSON/restaurant.json', (elt)=> {
            //     this.giveNameElement(elt)
            // });
    }

    giveNameElement(elt) {
        this.listRestaurant = elt;
    }
    

    initMap() {
            this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
                center: {lat: -34.397, lng: 150.644},
                zoom: 8
            });
    }

    test(){
    //     this.restTest.getElementRestaurant();
    //     this.restTest.createTagList();
    console.log(this.listRestaurant);
    }
}


