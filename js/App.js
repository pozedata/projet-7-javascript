class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        this.infoWindow;
        this.markerUser;
        this.averageRestaurantRating = [];
        this.highestRated; 
        this.newListRestaurant;
        this.eltMap;
        this.LatLng;
        this.minStar;
        this.maxStar;
        this.service;
        this.markers = []
        this.radius = 1500;

        this.transformLowerCase();
        this.selectionRestaurantByRating()
    }

    transformLowerCase() {
        String.prototype.noAccent = function(){
            var accent = [
                /[\300-\306]/g, /[\340-\346]/g, // A, a
                /[\310-\313]/g, /[\350-\353]/g, // E, e
                /[\314-\317]/g, /[\354-\357]/g, // I, i
                /[\322-\330]/g, /[\362-\370]/g, // O, o
                /[\331-\334]/g, /[\371-\374]/g, // U, u
                /[\321]/g, /[\361]/g, // N, n
                /[\307]/g, /[\347]/g, // C, c
            ];
            var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
            var str = this;
            for(var i = 0; i < accent.length; i++){
                str = str.replace(accent[i], noaccent[i]);
            }
            return str;
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

        this.map.mapTypes.set('styled_map', styledMapType);
        this.map.setMapTypeId('styled_map'); 

        this.infoWindow = new google.maps.InfoWindow;

        this.tryGeolocalisation();
        this.clickMapForAddRestaurant();
        this.eventDragend();
        this.eventZoomChanged();
    }

    tryGeolocalisation(){
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position)=> {
            const pos = {
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
            ()=> {
                this.handleLocationError(true, this.infoWindow, this.map.getCenter());
            });
        } 
        else {
            // Browser doesn't support Geolocation
            this.handleLocationError(false, this.infoWindow, this.map.getCenter());
        }
    }

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(this.map);
    }

    findRestaurantPlace() {
        let request = {
            location: this.map.getCenter(),
            radius: this.radius,
            type: ['restaurant']
        };
    
        this.service = new google.maps.places.PlacesService(this.map);
        this.service.nearbySearch(request, this.recoverNewRestaurant.bind(this));
    }
    
    recoverNewRestaurant(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (let restau of results) {
                let restaurant = new Restaurant(restau.place_id, restau.name, restau.vicinity, restau.geometry.location.lat(), restau.geometry.location.lng(), restau.rating, restau.user_ratings_total);
                this.listRestaurant.push(restaurant);
            }
            if (this.map.getZoom() > 8) {
                this.selectRestaurantByBounds();
                this.verfiFakeRestaurant();
                this.findRestaurantDuplicate();
                this.addRestaurantSelected();
                this.showBestRestaurant();
            }
            else {
                $('.messageNoRestaurant').remove();
                $('#listGroup').append('<span class="messageNoRestaurant"><strong>Aucun restaurant rechercher</strong></br>vous êtes acteullement a un zoom de '+this.map.getZoom()+', la recherche de restaurant se fait a partir de zoom 9</span>');
            }
        }
    }

    verfiFakeRestaurant() {
        for (let i = 0; i < this.newListRestaurant.length; i++) {
            if ((this.newListRestaurant[i].averageStar === NaN) || (this.newListRestaurant[i].nbCommentUSer === undefined)) {
                delete this.newListRestaurant[i];
            }
        }
    }

    selectRestaurantByBounds() {
        this.LatLng = this.map.getBounds();
        let south_Lat = this.LatLng.getSouthWest().lat();
        let south_Lng = this.LatLng.getSouthWest().lng();
        let north_Lat = this.LatLng.getNorthEast().lat();
        let north_Lng = this.LatLng.getNorthEast().lng();
        this.newListRestaurant = $.grep(this.listRestaurant, (elt) => {
            return ((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng));
        });
    }

    // méthode pour ranger le tableau de manière décroissante
    compare(x, y) {
        const eltY = y.nbCommentUSer;
        const eltX = x.nbCommentUSer;
        return eltY - eltX;
    }

    findRestaurantDuplicate(){
        var uniq = {};
        this.newListRestaurant = this.newListRestaurant.filter(obj => !uniq[obj.name.noAccent().toLowerCase()] && (uniq[obj.name.noAccent().toLowerCase()] = true));
    }
    
    addRestaurantSelected() {
        this.markers = [];
        this.newListRestaurant.sort(this.compare);
        for (let restaurant of this.newListRestaurant){
            this.createDescription(restaurant);
        }
    }

    createDescription(restaurant) {
        restaurant.createTagList();
        restaurant.createMarker(this.map);
        this.markers.push(restaurant.marker);
        this.eventClickOnBtnRestaurant(restaurant);
        this.eventMarkerRestaurant(restaurant);
    }

    eventClickOnBtnRestaurant(restaurant) {
        $('#btn-'+restaurant.id+'').on("click",()=> {
            let request = restaurant.requestDetails();        
            this.service.getDetails(request, this.callBackGetDetails.bind(this, restaurant));
        });
    }

    eventMarkerRestaurant(restaurant) {
        restaurant.marker.addListener('click', ()=> {
            let request = restaurant.requestDetails();        
            this.service.getDetails(request, this.callBackGetDetails.bind(this, restaurant));
            let sizeMap = Math.round($(this.map.getDiv()).children().eq(0).width());
            let sizeScreen = Math.round(window.innerWidth);
            restaurant.showDescription();
            $('#btn-'+restaurant.id+'').focus();
            if (sizeMap === sizeScreen) {
                restaurant.infowindow.open(this.map, restaurant.marker);
            } 
        });
    }
    
    callBackGetDetails(restaurant ,results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (restaurant.recoverElt === false){
                restaurant.recoverElt = true; 
                restaurant.phoneNumber = results.formatted_phone_number;
                restaurant.formattedAddress = results.formatted_address;
                for (let comment of results.reviews) {
                    if (comment.text !== "") {
                        restaurant.comments.push(comment.text);
                        restaurant.stars.push(comment.rating);
                    }
                }
            }
            restaurant.showDescription();
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
    }

    verifRestaurantAroundUSer(bestRestaurant) {
        if (bestRestaurant === undefined) {
            $('.messageNoRestaurant').remove();
            $('#listGroup').append('<span class="messageNoRestaurant"><strong>Aucun restaurant trouver dans vos critère proche de vous</strong></br>Si vous voulez ajouter un restaurant:<ul><li>cliquer sur son emplacement sur la carte</li><li>remplsser le formulaire</li></ul></span>');
            $('.description').hide();
        }
        else {
            $('.messageNoRestaurant').remove();
            $('#btn-'+bestRestaurant.id+'').trigger("click",()=> {
                bestRestaurant.showDescription();
            });
        }
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
                    return ((elt.averageStar >= this.minStar) && (elt.averageStar <= this.maxStar)) && (((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng)));
                });
            }
            this.findRestaurantDuplicate()
            this.deleteRestaurant();
            this.addRestaurantSelected();
            this.showBestRestaurant();
        });
    }

    deleteRestaurant() {
        for (let restaurant of this.listRestaurant){
            $('#btn-'+restaurant.id+'').remove();
        }
        this.setMapOnAll();
    }

    setMapOnAll() {
        for (var i = 0; i < this.markers.length; i++) {
          this.markers[i].setMap(null);
        }
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
            if (($('#form-name').val() !== "") && ($('#form-address').val() !== "") && ($('#form-name').val() !== "") && ($('#form-star').val() >= 0) && ($('#form-star').val() <= 5) && ($('#form-comment').val() !== "")) {
                let name = $('#form-name').val();
                let address = $('#form-address').val();
                let phone = $('#form-phone').val();
                let stars = parseFloat($('#form-star').val());
                let comment = $('#form-comment').val();
                let id = this.listRestaurant.length
                let restaurant = new Restaurant(id, name, address, latClick, lngClick, stars, 1);
                restaurant.recoverElt = true; 
                restaurant.phoneNumber = phone;
                restaurant.formattedAddress = address;
                restaurant.comments.push(comment);
                restaurant.stars.push(stars);
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
            $('#form-phone').val("");
            $('#modalAddRestaurant').modal('hide');
    }

    eventDragend() {
        this.map.addListener('dragend', ()=> {
            this.deleteRestaurant();
            this.findRestaurantPlace(); 
            console.log(this.newListRestaurant)
        });
    }

    eventZoomChanged() {
        this.map.addListener('zoom_changed', ()=> {
            this.controlZoomForRestaurant();
            this.deleteRestaurant();
            this.findRestaurantPlace(); 
        });
    }
    
    controlZoomForRestaurant() {
        google.maps.event.clearListeners(this.map, 'click');
        this.controlAddRestaurant();
        this.changeRadiusRequest();
    }

    controlAddRestaurant() {
        if (this.map.getZoom() <= 14) {
            this.map.addListener('click',()=>{
                alert('Vous êtes a: Zoom'+this.map.getZoom()+' vous devait êtres a 15 minimum');
            });
        }
        else {
            this.clickMapForAddRestaurant();
        }
    }

    changeRadiusRequest() {
        let zoom = this.map.getZoom();
        console.log(zoom);
        if (zoom >= 15) {
            this.radius = 1500;
        }
        else if (zoom == 14) {
            this.radius = 3500;
        }
        else if (zoom == 13) {
            this.radius = 5000;
        }
        else if (zoom == 12) {
            this.radius = 8000;
        }
        else if ((zoom == 11) || (zoom = 10)){
            this.radius = 20000;
        }
        else if (zoom == 9) {
            this.radius = 5000;
        }
    }
}

