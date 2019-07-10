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
            map: map,
            // label : this.name
            // point of interest a virer 
        });
        this.marker.addListener('click', ()=> {
            // this.showDescription();
            $('#btn-'+this.id+'').focus();
            // this.marker.label = this.name;
            // console.log(this.marker.label);
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
        $('.modal-body').html('');
        for (let i=0; i< this.comments.length; i++) {
            let $comment = $('<p>').text(''+(i+1)+': '+this.comments[i]+' ('+this.stars[i]+'/5)');
            $('.modal-body').append($comment);
            console.log(this.comments);
        }

        // let $comment = []
        // for (let i=0; i< this.comments.length; i++) {
        //     let test = '<p>'+(i+1)+': '+this.comments[i]+'('+this.stars[i]+'/5)</p>';
        //     $comment.push(test);
        // }
        // console.log($comment);
        // $('.modal-body').html(()=>{
        //     for (let i=0; i< $comment.length; i++) {
        //         return ''+$comment[i]+'';
        //     }
        // });
        // // $('.modal-body').html(''+$comment[0]+''+ $comment[1]+'');

        // $('#allCom').text(()=>{
        //     for (let i=0; i<=this.comments.length; i++) {
        //         return this.comments[i];
        //     }
        // })

        // $('#modalCard').on('show.bs.modal', function (event) {
        //     var button = $(event.relatedTarget) // Bouton qui a déclenché le modal
        //     var recipient = button.data('whatever') // Extraire les informations des attributs data- *
            
        //     var modal = $(this)
        //     modal.find('.modal-title').text('New message to ' + recipient)
        //     modal.find('.modal-body input').val(recipient)
        //   })
    }
}