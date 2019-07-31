class Restaurant {
    constructor(id, name, adress, lat, long, averageStar, nbCommentUSer , ratings = []){
        this.id = id;
        this.name = name;
        this.adress = adress;
        this.lat = lat;
        this.long = long;
        this.ratings = ratings;
        this.comments = [];
        this.stars = [];
        // this.averageStar; etape 1 
        this.averageStar = averageStar;
        this.marker;
        this.infowindow;
        this.panorama;

        // etape 2 

        this.nbCommentUSer = nbCommentUSer;

        // this.splitRatings(); etape 1 
        // this.createAverageStars(); etape 1 
    };

    // création du bouton du restaurant 
    createTagList() {
        let buttonList = ('<button type="button" id="btn-'+this.id+'" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">' + this.name + '<span class="badge badge-light badge-pill" id="'+this.id+'badgeAverageStar">'+ this.fixedNumber(this.averageStar) +'</span></button>');
        $('#listGroup').append(buttonList);
    };

    // récupération des notes et commentaires du restaurant ETAPE 1 
    // splitRatings(){
    //     for (let elt of this.ratings) {
    //         this.stars.push(elt.stars);
    //         this.comments.push(elt.comment);
    //     }
    // };

    // création de la moyenne des notes du restaurant 
    createAverageStars(){
        // let addition = 0;
        // for (let i=0; i<=this.stars.length-1; i++) {
        //     addition += this.stars[i];
        // }
        // this.averageStar = addition/this.stars.length;

        // etape 3
        let sumOfNote = this.averageStar * this.nbCommentUSer;
        console.log('moyenne origine'+this.averageStar+'')
        console.log('nb de comm'+this.nbCommentUSer+'')
        console.log('multiplicatio '+sumOfNote+'')
        this.averageStar = sumOfNote / this.nbCommentUSer;
        console.log(this.averageStar)

    };

    // méthode pour gérer la note 
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

    // contenue de l'info bulle marqueur  
    contentInfoWindow() {
        return '<h5 class="infoWindow">'+this.name+'</h5>'+
            '<p class="infoWindow">'+this.adress+'</p>'+
            '<p class="infoWindow">Note: '+this.fixedNumber(this.averageStar)+'/5</p>';
    }

    // =========== Affichage de la decription du restaurant =========== //

    // création des élément description
    showDescription() {
        $('.description').show();
        this.imgStreetView();        
        $('.card-body h5').text(this.name);
        $('#starAverage').text('Note du restaurant : '+this.fixedNumber(this.averageStar)+'/5');
        $('#address').text('Adresse: '+this.adress+'');
        this.addComentCard();
        this.colorAverageStar();
        this.addCommentForRestaurant();
        this.showAllComm();
        $('.closeModalAddCom').click(()=>{
            this.closeModalAddCom();
        });
    }

    // création des images description
    imgStreetView() {
        let irl = 'https://maps.googleapis.com/maps/api/streetview/metadata?key=AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088&location='+this.name+''+this.adress+'';
        $.getJSON(irl, (elt)=> {
            if(elt.status === "OK") {
                $('.card-img-top').attr('src', 'https://maps.googleapis.com/maps/api/streetview?size=600x300&location='+this.name+''+this.adress+'&heading=151.78&pitch=-0.76&key=AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088');
            }
            else {
                $('.card-img-top').attr('src', '../img/salle-restaurant.jpg');
            }
        });
    }

    // coloration de la note sur la description
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

    // ajout des commentaires du restaurant sur la description 
    addComentCard(){
        if (this.comments.length < 2) {
            $('#com1').text('1- '+this.comments[0]+' ('+this.stars[0]+'/5)');
            $('#com2').text('');
        }
        else {
            $('#com1').text('1- '+this.comments[0]+' ('+this.stars[0]+'/5)');
            $('#com2').text('2- '+this.comments[1]+' ('+this.stars[1]+'/5)');
        }
    }

    // =========== boite modal tous les commentaires =========== //

    // création du contenue de la boite modal tous les commentaires 
    showAllComm(){
        $('#modal-body-com').html('');
        for (let i=0; i< this.comments.length; i++) {
            let $comment = $('<p>').text(''+(i+1)+': '+this.comments[i]+' ('+this.stars[i]+'/5)');
            $('#modal-body-com').append($comment);
        }
    }

    // event valider formaulaire
    addCommentForRestaurant() {
        $('#btnFormAddComment').off('click');
        $('#btnFormAddComment').click(()=>{ 
            if (($('#form-AddComment').val() !== "") && ($('#form-AddStar').val() !== "") && ($('#form-AddStar').val() >= 0) && ($('#form-AddStar').val() <= 5)) {
                this.nbCommentUSer = this.nbCommentUSer + 1;
                let comment = $('#form-AddComment').val();
                let star = parseFloat($('#form-AddStar').val());
                this.comments.push(comment);
                this.stars.push(star);
                this.showAllComm();
                this.createAverageStars();
                $('#'+this.id+'badgeAverageStar').text(this.fixedNumber(this.averageStar));
                console.log(this);
                this.closeModalAddCom();
                $('#starAverage').text('Note du restaurant : '+this.fixedNumber(this.averageStar)+'/5');
                this.colorAverageStar();
                this.addComentCard();
                this.infowindow.setContent(this.contentInfoWindow());
            }
        });
    }

    // fermeture de la boite modal
    closeModalAddCom() {
            $('#form-AddComment').val("");
            $('#form-AddStar').val("");
            $('#modalAddComment').modal('hide');
    }

    test() {             
        let request2 = {
            placeId: this.id,
            fields: ['reviews', 'formatted_address']
        };
        return request2;
    }

    test2(results, status) {
        console.log(results);
        console.log(status);
    }
}

// creer un fichier avec une varible global qui contient ma clef pour l'utiliser 
// et .gitignore