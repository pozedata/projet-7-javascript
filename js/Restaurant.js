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

    // création du <li> du restaurant 
    createTagList() {
        let buttonList = ('<button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" id="Btn-'+ this.name +'">' + this.name + '<span class="badge badge-primary badge-pill">'+ this.averageStar +'</span></button>');
        $('#listGroup').append(buttonList);
    };

    // récup des notes et commentaires du restaurant
    splitRatings(){
        for (let elt of this.ratings) {
            this.stars.push(elt.stars);
            this.comments.push(elt.comment);
        }
    };

    // création dela moyenne des notes du restaurant 
    createAverageStars(){
        let addition = 0;
        for (let i=0; i<=this.stars.length-1; i++) {
            addition += this.stars[i];
        }
        this.averageStar = addition/this.stars.length;
    };

    // création du marqueur sur la map
    createMarker(marker, map) {
        var posMarker = {lat: this.lat, lng: this.long};
        marker = new google.maps.Marker({position: posMarker, map: map});
    }
    
}