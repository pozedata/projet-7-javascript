class Restaurant {
    constructor(id, name, address, lat, long, averageStar, nbCommentUSer){
        this.id = id;
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.long = long;
        this.comments = [];
        this.stars = [];
        this.averageStar = averageStar;
        this.marker;
        this.infowindow;
        this.panorama;
        this.nbCommentUSer = nbCommentUSer;
        this.phoneNumber;
        this.formattedAddress;
        this.recoverElt = false; 
    };

    // création du bouton du restaurant (liste)
    createTagList() {
        let buttonList = ('<button type="button" id="btn-'+this.id+'" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">' + this.name + '<span class="badge badge-light badge-pill" id="'+this.id+'badgeAverageStar">'+ this.fixedNumber(this.averageStar) +'</span></button>');
        $('#listGroup').append(buttonList);
    };

    // calcul de la note moyenne du restaurant
    createAverageStars(x){
        let sumOfNote = this.averageStar * (this.nbCommentUSer - 1);
        this.averageStar = (sumOfNote + x) / this.nbCommentUSer;
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
    }

    // contenue de l'info bulle marqueur  
    contentInfoWindow() {
        return '<h5 class="infoWindow">'+this.name+'</h5>'+
            '<p class="infoWindow">'+this.address+'</p>'+
            '<p class="infoWindow">Note: '+this.fixedNumber(this.averageStar)+'/5</p>';
    }

    // =========== Affichage de la decription du restaurant =========== //

    // création des éléments descriptions
    showDescription() {
        $('.description').show();
        $('.card-body h5').text(this.name);
        $('#starAverage').text('Note du restaurant : '+this.fixedNumber(this.averageStar)+'/5');
        $('#nbUser').text(''+ this.nbCommentUSer+' utilisateur(s) on evalués cette établissement');
        if (this.phoneNumber !== undefined) {
            $('#phone').text('Téléphone: '+this.phoneNumber+'');
        }
        else {
            $('#phone').text('Téléphone: Aucun numéro de téléphone enregistré');
        }
        if (this.formattedAddress !== undefined) {
            $('#address').text('Adresse: '+this.formattedAddress+'');
        }
        else {
            if (this.address !== undefined){
                $('#address').text('Adresse: '+this.address+'');
            }
            else {
                $('#address').text('Adresse: Aucune adresse enregistrée');
            }
        }
        this.imgStreetView(); 
        this.colorAverageStar();
        this.addCommentForRestaurant();
        this.showAllComm();
        $('.closeModalAddCom').click(()=>{
            this.closeModalAddCom();
        });
    }

    // création des images description
    imgStreetView() {
        let irl = 'https://maps.googleapis.com/maps/api/streetview/metadata?key=AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088&location='+this.name+''+this.address+'';
        $.getJSON(irl, (elt)=> {
            if(elt.status === "OK") {
                $('.card-img-top').attr('src', 'https://maps.googleapis.com/maps/api/streetview?size=600x300&location='+this.name+''+this.address+'&heading=151.78&pitch=-0.76&key=AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088');
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
                $('#nbUser').text(''+ this.nbCommentUSer+' utilisateur(s) on evalués cette établissement');
                let comment = $('#form-AddComment').val();
                let star = parseFloat($('#form-AddStar').val());
                this.comments.push(comment);
                this.stars.push(star);
                this.showAllComm();
                this.createAverageStars(parseFloat($('#form-AddStar').val()));
                $('#'+this.id+'badgeAverageStar').text(this.fixedNumber(this.averageStar));
                $('#starAverage').text('Note du restaurant : '+this.fixedNumber(this.averageStar)+'/5');
                this.colorAverageStar();
                this.infowindow.setContent(this.contentInfoWindow());
                console.log(this)
                // $(window).trigger('addThisOnNewList', [this]);
            }
            this.closeModalAddCom();
        });
    }

    // fermeture de la boite modal
    closeModalAddCom() {
            $('#form-AddComment').val("");
            $('#form-AddStar').val("");
            $('#modalAddComment').modal('hide');
    }

    // requête pour méthode getDetails
    requestDetails() {             
        let request = {
            placeId: this.id,
            fields: ['reviews', 'formatted_address', 'formatted_phone_number']
        };
        return request;
    }
}