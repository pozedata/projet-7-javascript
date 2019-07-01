class Restaurant {
    constructor(name, adress, lat, long, ratings){
        this.name = name;
        this.adress = adress;
        this.lat = lat;
        this.long = long;
        this.ratings = ratings;
        this.comments = [];
        this.stars = [];
        this.averageStar;

        this.splitRatings();
        this.createAverageStars();
    };

    createTagList() {
        let buttonList = ('<button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" id="Btn-'+ this.name +'">' + this.name + '<span class="badge badge-primary badge-pill">'+ this.averageStar +'/5</span></button>');
        $('#listGroup').append(buttonList);
    };

    splitRatings(){
        for (let elt of this.ratings) {
            this.stars.push(elt.stars);
            this.comments.push(elt.comment);
        }
    };

    createAverageStars(){
        let addition = 0;
        for (let i=0; i<=this.stars.length-1; i++) {
            addition += this.stars[i];
        }
        this.averageStar = addition/this.stars.length;
    };
}