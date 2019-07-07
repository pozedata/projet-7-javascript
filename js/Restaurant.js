class Restaurant {
    constructor(id, name, adress, lat, long, ratings){
        this.id = id;
        this.name = name;
        this.adress = adress;
        this.lat = lat;
        this.long = long;
        this.ratings = ratings;
        this.comments = [];
        this.stars = [];
        this.averageStar;
        this.marker;

        this.splitRatings();
        this.createAverageStars();
    };

    // création du <li> du restaurant 
    createTagList() {
        let buttonList = ('<button type="button" id="btn-'+this.id+'" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">' + this.name + '<span class="badge badge-light badge-pill">'+ this.averageStar +'</span></button>');
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
    createMarker(map) {
        let posMarker = {lat: this.lat, lng: this.long};
        this.marker = new google.maps.Marker({
            position: posMarker, 
            map: map
        });
    }

    showDescription() {
        $('.card-img-top').attr('src', 'https://maps.googleapis.com/maps/api/streetview?size=600x300&location='+this.name+''+this.adress+'&heading=151.78&pitch=-0.76&key=AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088');
        $('.card-body h5').text(this.name);
        $('#starAverage').text('Note du restaurant : '+this.averageStar+'/5');
        $('#address').text('Adresse: '+this.adress+'');
        $('#com1').text('1- '+this.comments[0]+' ('+this.stars[0]+'/5)');
        $('#com2').text('2- '+this.comments[1]+' ('+this.stars[1]+'/5)');
        this.colorAverageStar();
        this.showAllComm();
    }

    colorAverageStar() {
        if (this.averageStar >= 4) {
            $('#starAverage').css('color', 'lightgreen');
        }
        else if (this.averageStar >= 3) {
            $('#starAverage').css('color', 'orange');
        }
        else {
            $('#starAverage').css('color', 'red');
        }
    }

    showAllComm(){
        for (let i=0; i< this.comments.length; i++) {
            let $comment = $('<p>').text(''+(i+1)+': '+this.comments[i]+' ('+this.stars[i]+'/5)');
            $('.modal-body').append($comment);
        }
    }
}