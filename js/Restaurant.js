class Restaurant {
    constructor(name, adress, lat, long, stars, comment){
        this.name = name;
        this.adress = adress;
        this.lat = lat;
        this.long = long;
        this.stars = stars;
        this.comment = comment;
    }

    getElementRestaurant(){
        $.getJSON('../JSON/restaurant.json', (elt)=> {
            this.name = elt[0].restaurantName;
            console.log(this.name);
        });
        console.log(this.name);
    }

    createTagList() {
        let buttonList = ('<button type="button" class="list-group-item list-group-item-action" id="Btn-'+ this.name +'">' + this.name + '</button>');
        $('#listGroup').append(buttonList);
    }
}