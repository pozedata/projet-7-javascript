class Restaurant {
    constructor(name, adress, lat, long, ratings){
        this.name = name;
        this.adress = adress;
        this.lat = lat;
        this.long = long;
        this.ratings = ratings;
    }

    createTagList() {
        let buttonList = ('<button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" id="Btn-'+ this.name +'">' + this.name + '<span class="badge badge-primary badge-pill">14</span></button>');
        $('#listGroup').append(buttonList);
    }
}