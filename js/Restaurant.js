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
        this.infowindow;

        this.splitRatings();
        this.createAverageStars();
    };

    // création du bouton du restaurant 
    createTagList() {
        let buttonList = ('<button type="button" id="btn-'+this.id+'" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">' + this.name + '<span class="badge badge-light badge-pill" id="'+this.id+'badgeAverageStar">'+ this.fixedNumber(this.averageStar) +'</span></button>');
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

    fixedNumber(x){
        if (Number.isInteger(x)){
            return Number.parseFloat(x).toFixed(0);
        }
        else {
            return Number.parseFloat(x).toFixed(1);
        }
    }

    // création du marqueur sur la map
    createMarker(map) {
        let posMarker = {lat: this.lat, lng: this.long};
        this.marker = new google.maps.Marker({
            position: posMarker, 
            map: map
        });

        this.infowindow = new google.maps.InfoWindow({
            content: this.contentInfoWindow()
        });
        this.marker.addListener('click', ()=> {
            let sizeMap = Math.round($(map.getDiv()).children().eq(0).width());
            let sizeScreen = Math.round(window.innerWidth);
            this.showDescription();
            $('#btn-'+this.id+'').focus();
            if (sizeMap === sizeScreen) {
                this.infowindow.open(map, this.marker);
            } 
        });
    }

    test(){
        console.log(window.innerWidth);
        console.log($('#mapGoogle').width());
    }

    contentInfoWindow() {
        return '<h5 class="infoWindow">'+this.name+'</h5>'+
        '<p class="infoWindow">'+this.adress+'</p>'+
        '<p class="infoWindow">Note: '+this.fixedNumber(this.averageStar)+'/5</p>';
    }

    showDescription() {
        $('.card-img-top').attr('src', 'https://maps.googleapis.com/maps/api/streetview?size=600x300&location='+this.name+''+this.adress+'&heading=151.78&pitch=-0.76&key=AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088');
        $('.card-body h5').text(this.name);
        $('#starAverage').text('Note du restaurant : '+this.fixedNumber(this.averageStar)+'/5');
        $('#address').text('Adresse: '+this.adress+'');
        if (this.comments.length < 2) {
            $('#com1').text('1- '+this.comments[0]+' ('+this.stars[0]+'/5)');
            $('#com2').text('');
        }
        else {
            $('#com1').text('1- '+this.comments[0]+' ('+this.stars[0]+'/5)');
            $('#com2').text('2- '+this.comments[1]+' ('+this.stars[1]+'/5)');
        }
        this.colorAverageStar();
        this.addCommentForRestaurant();
        this.showAllComm();
        $('.closeModalAddCom').click(()=>{
            $('#form-AddComment').val("");
            $('#form-AddStar').val("");
        });
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
        $('#modal-body-com').html('');
        for (let i=0; i< this.comments.length; i++) {
            let $comment = $('<p>').text(''+(i+1)+': '+this.comments[i]+' ('+this.stars[i]+'/5)');
            $('#modal-body-com').append($comment);
        }
    }

    addCommentForRestaurant() {
        $('#btnFormAddComment').click(()=>{ 
            if (($('#form-AddComment').val() !== "") && ($('#form-AddStar').val() !== "") && ($('#form-AddStar').val() >= 0) && ($('#form-AddStar').val() <= 5)) {
                this.averageStar = 0;
                let comment = $('#form-AddComment').val();
                let star = parseFloat($('#form-AddStar').val());
                this.comments.push(comment);
                this.stars.push(star);
                this.showAllComm();
                this.createAverageStars();
                $('#'+this.id+'badgeAverageStar').text(this.fixedNumber(this.averageStar));
                this.closeModalAddCom();
                $('#starAverage').text('Note du restaurant : '+this.fixedNumber(this.averageStar)+'/5');
                this.infowindow.setContent(this.contentInfoWindow());
                if (this.comments.length < 2) {
                    $('#com2').text($('#form-AddComment').val());
                    console.log('lu')
                }
            }
        });
    }

    closeModalAddCom() {
            $('#form-AddComment').val("");
            $('#form-AddStar').val("");
            $('#modalAddComment').modal('hide');
    }
}

// creer un fichier avec une varible global qui contient ma clef pour l'utiliser 
// et .gitignore