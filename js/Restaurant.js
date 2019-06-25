class Restaurant {
    constructor(){
        this.name;
        this.adress;
        this.lat;
        this.long;
        this.ratings;
        this.stars=[];
        this.comment=[];
    }

    getElementRestaurant(){
        $.getJSON('../JSON/restaurant.json', (elt) => {
            this.name = elt.restaurantName;
        });
        console.log(this.name) ;
    }
}