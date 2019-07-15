class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        // this.map = new Map();
        // this.map.initMap();
        this.infoWindow;
        this.markerUser;
        this.averageRestaurantRating = [];
        this.highestRated; // comment faire si j'ai plusieurs restaurant avec la meilleure note posible ? 
        this.newListRestaurant = [];
        this.eltMap;

        this.createObjectRestaurant();
        this.selectionRestaurantByRating();
    }

    // methode qui créer les objet restaurant
    createObjectRestaurant() {
        $.getJSON('../JSON/restaurant.json', (elt)=> {
            for (let restau of elt) {
                let id = this.listRestaurant.length
                let restaurant = new Restaurant(id, restau.restaurantName, restau.address, restau.lat, restau.long, restau.ratings);
                this.listRestaurant.push(restaurant);
            }
            this.displayRestaurantElt();
        });
    }

    displayRestaurantElt(){
        for (let restaurant of this.listRestaurant) {
            this.createDescription(restaurant);
        }
        this.highestRated = Math.max.apply(null, this.averageRestaurantRating);
        this.showBestRestaurant();
    }

    createDescription(restaurant) {
        restaurant.createTagList();
        restaurant.createMarker(this.map);
        $('#btn-'+restaurant.id+'').on("click",()=> {
            restaurant.showDescription();
        });
        this.averageRestaurantRating.push(restaurant.averageStar);
    }

    showBestRestaurant(){
        let bestRestaurant = this.listRestaurant.find(elt => (elt.averageStar === this.highestRated));
        bestRestaurant.showDescription(); // ajouter le nombre de comm max 
    }

    selectionRestaurantByRating() {
        $('#valForm').on('click',()=>{
            let minStar = $('#form-min').val();
            let maxStar = $('#form-max').val();
            if( minStar > maxStar) {
                alert('la note minimum attribuer et plus grande que la note maximum');
            }
            else {
                this.newListRestaurant = $.grep(this.listRestaurant, (elt) => {
                    return (elt.averageStar >= minStar) && (elt.averageStar <= maxStar)
                });
            }
            this.deleteRestaurant();
            this.addRestaurantSelected();
        });
    }

    deleteRestaurant() {
        for (let restaurant of this.listRestaurant){
            $('#btn-'+restaurant.id+'').remove();
            restaurant.marker.setMap(null);
        }
    }

    addRestaurantSelected() {
        for (let restaurant of this.newListRestaurant){
            this.createDescription(restaurant);
        }
    }



    initMap() {
        // arrive pas en utilisant le fichier json 
        var styledMapType = new google.maps.StyledMapType($.getJSON('../JSON/map.json'),{name: 'Styled Map'});

        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: 48.888568, lng: 2.348442},
            zoom: 15,
            // mapTypeControlOptions: {
            //     mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
            //             'styled_map']
            //   }
        });

        this.map.mapTypes.set('styled_map', styledMapType);
        this.map.setMapTypeId('styled_map'); 

        this.infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position)=> {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            this.markerUser = new google.maps.Marker({
                position: pos, 
                map: this.map,
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });
      
            this.infoWindow.setPosition(pos);
            this.infoWindow.setContent('Vous êtes ici');
            this.infoWindow.open(this.map);
            this.map.setCenter(pos);
          }, 
          function() {
            this.handleLocationError(true, this.infoWindow, this.map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          this.handleLocationError(false, this.infoWindow, this.map.getCenter());
        }
        this.clickMapForAddRestaurant();
    }

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(this.map);
    }

    clickMapForAddRestaurant() {
        this.map.addListener('click', (e)=>{
            let latClick = e.latLng.lat();
            let lngClick = e.latLng.lng();
            $('#modalAddRestaurant').modal('show');
            this.findAdress(latClick, lngClick);
        });
    }

    findAdress(latClick, lngClick){
        let geocoder = new google.maps.Geocoder(); //module pour récupérer un nom en fonction des coordonnées GPS

        let latlng = {
            lat: latClick,
            lng: lngClick
        };
        geocoder.geocode({'latLng': latlng}, (results, status)=> {
            if (status == google.maps.GeocoderStatus.OK) {
                $('#form-adress').val(results[0].formatted_address);
            }
            else {
                $('#form-adress').attr('placeholder', 'ex: Super restaurant, je recommande vivement')
            }
          });
    }
}

// createObjectRestaurant() {
//     $.getJSON('../JSON/restaurant.json', (elt)=> {
//         for (let restau of elt) {
//             let id = this.listRestaurant.length
//             let restaurant = new Restaurant(id, restau.restaurantName, restau.address, restau.lat, restau.long, restau.ratings);
//             this.listRestaurant.push(restaurant);
//         }
//         this.displayRestaurantElt();
//     });
// }

