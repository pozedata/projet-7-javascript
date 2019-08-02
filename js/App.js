class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        // this.map = new Map();
        // this.map.initMap();
        this.infoWindow;
        this.markerUser;
        this.averageRestaurantRating = [];
        this.highestRated; 
        this.newListRestaurant;
        this.eltMap;
        this.LatLng;
        this.minStar;
        this.maxStar;
        this.service


        // this.createObjectRestaurant();
        this.selectionRestaurantByRating();
    }

    // methode qui créer les objet restaurant ETAPE 1 
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

    displayRestaurantElt(){
        for (let restaurant of this.listRestaurant) {
            this.createDescription(restaurant);
        }
    }

    createDescription(restaurant) {
        restaurant.createTagList();
        restaurant.createMarker(this.map);
        $('#btn-'+restaurant.id+'').on("click",()=> {
            let request = restaurant.requestDetails();        
            this.service.getDetails(request, this.callBackGetDetails.bind(this, restaurant));
        });
    }

    callBackGetDetails(restaurant ,results, status) {
        console.log(restaurant)
        restaurant.phoneNumber = results.formatted_phone_number;
        restaurant.formattedAdress = results.formatted_address;
        restaurant.showDescription();
        console.log(results.reviews);
        for (let comment of results.reviews) {
            console.log(comment.text);
            
        }
        // this.comments.push(comment.text)
    }

    selectionRestaurantByRating() {
        $('#valForm').on('click',()=>{
            this.minStar = $('#form-min').val();
            this.maxStar = $('#form-max').val();
            let south_Lat = this.LatLng.getSouthWest().lat();
            let south_Lng = this.LatLng.getSouthWest().lng();
            let north_Lat = this.LatLng.getNorthEast().lat();
            let north_Lng = this.LatLng.getNorthEast().lng();
            if( this.minStar > this.maxStar) {
                alert('la note minimum attribuer et plus grande que la note maximum');
            }
            else {
                this.newListRestaurant = $.grep(this.listRestaurant, (elt) => {
                    return ((elt.averageStar >= this.minStar) && (elt.averageStar <= this.maxStar)) && (((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng)))
                });
            }
            this.deleteRestaurant();
            this.addRestaurantSelected();
            this.showBestRestaurant();
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

    showBestRestaurant() {
        this.averageRestaurantRating = [];
        for (let restaurant of this.newListRestaurant) {
            this.averageRestaurantRating.push(restaurant.averageStar);
        }
        this.highestRated = Math.max.apply(null, this.averageRestaurantRating);
        let bestRestaurant = this.newListRestaurant.find(elt => (elt.averageStar === this.highestRated));
        this.verifRestaurantAroundUSer(bestRestaurant);
        console.log(this.newListRestaurant);
    }

    verifRestaurantAroundUSer(bestRestaurant) {
        if (bestRestaurant === undefined) {
            $('.messageNoRestaurant').remove();
            $('#listGroup').append('<span class="messageNoRestaurant"><strong>Aucun restaurant trouver dans vos critère proche de vous</strong></br>Si vous voulez ajouter un restaurant:<ul><li>cliquer sur son emplacement sur la carte</li><li>remplsser le formulaire</li></ul></span>');
            $('.description').hide();
        }
        else {
            $('.messageNoRestaurant').remove();
            bestRestaurant.showDescription();
            // $('.description').show();
        }
    }

    initMap() {
        var styledMapType = new google.maps.StyledMapType(StyleMap ,{name: 'Tropodvisor'});

        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: 48.888568, lng: 2.348442},
            zoom: 15,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
                        'styled_map']
              }
        });

        this.clickMapForAddRestaurant();
        // this.eventGetLatLng();
        // this.getLatLng();
        // this.eventZoomChanged();

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
            this.findRestaurantPlace();
          }, 
          function() {
            this.handleLocationError(true, this.infoWindow, this.map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          this.handleLocationError(false, this.infoWindow, this.map.getCenter());
        }
    }

    findRestaurantPlace() {
        let request = {
            location: this.map.getCenter(),
            radius: '1500',
            type: ['restaurant']
        };

        this.service = new google.maps.places.PlacesService(this.map);
        this.service.nearbySearch(request, this.recoverNewRestaurant.bind(this));
    }

    recoverNewRestaurant(results, status) {
        // if (status == google.maps.places.PlacesServiceStatus.OK) {
            this.listRestaurant = [];
            for (let restau of results) {
                let restaurant = new Restaurant(restau.place_id, restau.name, restau.vicinity, restau.geometry.location.lat(), restau.geometry.location.lng(), restau.rating, restau.user_ratings_total);
                this.listRestaurant.push(restaurant);
            }

            this.displayRestaurantElt();
            this.newListRestaurant = this.listRestaurant;
            this.eventGetLatLng();
            this.getLatLng();
            this.eventZoomChanged();
            
        // }
    }

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(this.map);
    }

    clickMapForAddRestaurant() {
        this.map.addListener('click',(e)=>{
            let latClick = e.latLng.lat();
            let lngClick = e.latLng.lng();
            $('#modalAddRestaurant').modal('show');
            this.findAddress(latClick, lngClick);
            this.addNewRestaurant(latClick, lngClick);
            $('.closeModalAddRestaurant').click(this.closeModalAddRestaurant());
            
        });
    }

    findAddress(latClick, lngClick){
        let geocoder = new google.maps.Geocoder(); //module pour récupérer un nom en fonction des coordonnées GPS
        let latlng = {
            lat: latClick,
            lng: lngClick
        };
        geocoder.geocode({'latLng': latlng}, (results, status)=> {
            if (status == google.maps.GeocoderStatus.OK) {
                $('#form-address').val(results[0].formatted_address);
            }
            else {
                $('#form-address').attr('placeholder', 'ex: 91 Rue Antoine de Très, 84240 La Tour-d\'Aigues')
            }
        });
    }

    addNewRestaurant(latClick, lngClick) {
        $('#btnFormAddrestaurant').click(()=>{
            if (($('#form-name').val() !== "") && ($('#form-address').val() !== "") && ($('#form-star').val() >= 0) && ($('#form-star').val() <= 5) && ($('#form-comment').val() !== "")) {
                let name = $('#form-name').val();
                let address = $('#form-address').val();
                let ratings = [{
                    stars: parseFloat($('#form-star').val()),
                    comment: $('#form-comment').val()
                }];
                let id = this.listRestaurant.length
                let restaurant = new Restaurant(id, name, address, latClick, lngClick, ratings);
                this.listRestaurant.push(restaurant);
                this.createDescription(restaurant);
                this.closeModalAddRestaurant();
                $('.messageNoRestaurant').remove();
                $('#btnFormAddrestaurant').off('click');
            }
        })
    }

    closeModalAddRestaurant() {
            $('#form-name').val("");
            $('#form-star').val("");
            $('#form-comment').val("");
            $('#modalAddRestaurant').modal('hide');
    }

    selectRestaurantByBounds () {
        this.LatLng = this.map.getBounds();
        let south_Lat = this.LatLng.getSouthWest().lat();
        let south_Lng = this.LatLng.getSouthWest().lng();
        let north_Lat = this.LatLng.getNorthEast().lat();
        let north_Lng = this.LatLng.getNorthEast().lng();
        this.newListRestaurant = $.grep(this.listRestaurant, (elt) => {
            if (this.minStar !== undefined && this.maxStar !== undefined) {
                return ((elt.averageStar >= this.minStar) && (elt.averageStar <= this.maxStar)) && (((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng)))
            }
            else {
                return ((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng));
            }
        });
    }

    getLatLng(){
        this.map.addListener('bounds_changed', ()=> {
            this.selectRestaurantByBounds();
            this.deleteRestaurant();
            this.addRestaurantSelected();
            this.showBestRestaurant();
            google.maps.event.clearListeners(this.map, 'bounds_changed');
         });
    }

    eventGetLatLng() {
        this.map.addListener('dragend', ()=> {
            this.selectRestaurantByBounds();
            this.deleteRestaurant();
            this.addRestaurantSelected();
            this.showBestRestaurant();
        });
    }

    eventZoomChanged() {
        this.map.addListener('zoom_changed', ()=> {
            this.controlZoomForAddRestaurant();
            this.selectRestaurantByBounds();
            this.deleteRestaurant();
            this.addRestaurantSelected();
            this.showBestRestaurant();
        });
    }

    controlZoomForAddRestaurant() {
        google.maps.event.clearListeners(this.map, 'click');
        if (this.map.getZoom() <= 14) {
            this.map.addListener('click',()=>{
                alert('Vous êtes a: Zoom'+this.map.getZoom()+' vous devait êtres a 15 minimum');
            });
        }
        else {
            this.clickMapForAddRestaurant();
        }
    }
}

// AIzaSyBmTN7usD5QTF7dLF_4SgQ5KPwNZPG8088
