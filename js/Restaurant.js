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
        $.getJSON('../JSON/restaurant.json', (elt)=> {
            this.name = elt[0].restaurantName;
            console.log(this.name);
        });
    }

    createTagList() {
        let buttonList = ('<button type="button" class="list-group-item list-group-item-action">' + this.name + '</button>');
        $('#listGroup').append(buttonList);
    }
}