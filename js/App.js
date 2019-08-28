class App {
    constructor(){
        this.listRestaurant = [];
        this.map;
        this.infoWindow;
        this.markerUser;
        this.averageRestaurantRating = [];
        this.highestRated; 
        this.newListRestaurant = [];
        this.eltMap;
        this.LatLng;
        this.minStar;
        this.maxStar;
        this.service;
        this.markers = []
        this.radius = 1500;
        this.country;

        this.transformNoAccent();
        this.selectionRestaurantByRating();
        $(window).on('addThisOnNewList', (event, data) => {this.addRestaurantOnNewList(data)});
    }

    // méthode qui enregistre le restaurant qui a un nouveau commentaire 
    addRestaurantOnNewList(data) {
        this.newListRestaurant.push(data.restaurant);
        this.findRestaurantDuplicateForNewRestaurant();
    }

    // méthode qui vérifie et supprime les doublons
    findRestaurantDuplicateForNewRestaurant(){
        let uniq = {};
        this.newListRestaurant = this.newListRestaurant.filter(obj => !uniq[obj.name.noAccent().toLowerCase()] && (uniq[obj.name.noAccent().toLowerCase()] = true));
    }

    // méthode pour récuperer une chaine de caractère sans accent 
    transformNoAccent() {
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

    // initialisation de la carte google map
    initMap() {
        var styledMapType = new google.maps.StyledMapType(StyleMap ,{name: 'Tropodvisor'});

        this.map = new google.maps.Map(document.getElementById('mapGoogle'), {
            center: {lat: 48.888568, lng: 2.348442},
            zoom: 15,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite', 'styled_map']
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

    // méthode qui test la géolocalisation 
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
            this.infoWindow.setContent('<span class="grey">Vous êtes ici</span>');
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

    // méthode qui gère si la localisation a échoué
    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        let errorFail = '<h2 class="grey">Le service de géolocalisation a échoué</h2><p class="grey">L\'adresse actuelle est : 102 Rue Doudeauville, 75018 Paris, France</p>'
        let errorBrowser = '<h2 class="grey">Votre navigateur ne supporte pas la géolocalisation</h2>';
        infoWindow.setContent(browserHasGeolocation ? errorFail : errorBrowser);
        infoWindow.open(this.map);
        this.findRestaurantPlace();
    }

    // méthode qui lance la recherche de restaurant
    findRestaurantPlace() {
        let request = {
            location: this.map.getCenter(),
            radius: this.radius,
            type: ['restaurant']
        };
        this.service = new google.maps.places.PlacesService(this.map);
        this.service.nearbySearch(request, this.refreshMap.bind(this));
    }

    // méthode qui rafraichit la map
    refreshMap(results, status) {
        this.deleteRestaurantList();
        this.recoverNewRestaurant(results, status);
    }

    // méthode qui supprime les bouton restaurant de la liste
    deleteRestaurantList() { 
        for (let restaurant of this.listRestaurant){
            $('#btn-'+restaurant.id+'').remove();
        }
        this.setMapOnAll();
    }

    // méthode qui supprime les marqueurs sur la map 
    setMapOnAll() {
        for (var i = 0; i < this.markers.length; i++) {
          this.markers[i].setMap(null);
        }
    }
    
    //méthode qui gère le resultats de la recherche de restaurant
    recoverNewRestaurant(results, status) {
        if ((status == google.maps.places.PlacesServiceStatus.OK) || (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS)) {  
            this.addRestaurantAddByUser();   
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
                $('#listGroup').append('<span class="messageNoRestaurant"><strong>Aucun restaurant rechercher</strong></br>vous êtes actuellement a un zoom de '+this.map.getZoom()+', la recherche de restaurant se fait a partir de zoom 9</span>');
            }
        }
        else {
            $('.messageNoRestaurant').remove();
            $('#listGroup').append('<span class="messageNoRestaurant"><strong>Echec sur la recherche de restaurant</strong></span>');
        }
    }

    // méthode qui regroupe les liste de restaurant
    addRestaurantAddByUser() {
        if (this.newListRestaurant.length !== 0) {
            $.merge(this.listRestaurant, this.newListRestaurant);
        }
    }

    // méthode qui supprime du tableau les restaurants qui n'ont pas d'utilisateur ou de note
    verfiFakeRestaurant() {
        for (let i = 0; i < this.listRestaurant.length; i++) {
            if ((this.listRestaurant[i].averageStar === NaN) || (this.listRestaurant[i].nbCommentUSer === undefined)) {
                delete this.listRestaurant[i];
            }
        }
    }

    // méthode qui retourne les restaurants selon leurs coordonées gps (compris dans la zone que la carte affiche)
    selectRestaurantByBounds() {
        this.LatLng = this.map.getBounds();
        let south_Lat = this.LatLng.getSouthWest().lat();
        let south_Lng = this.LatLng.getSouthWest().lng();
        let north_Lat = this.LatLng.getNorthEast().lat();
        let north_Lng = this.LatLng.getNorthEast().lng();
        this.listRestaurant = $.grep(this.listRestaurant, (elt) => {
            if (this.minStar !== undefined && this.maxStar !== undefined) {
                return ((elt.averageStar >= this.minStar) && (elt.averageStar <= this.maxStar)) && (((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng)))
            }
            else {
                return ((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng));
            }
        });
    }

    // méthode pour ranger le tableau de manière croissante (du restaurant qui a la plus d'avis a celui qui en a le moins)
    compare(x, y) {
        const eltY = y.nbCommentUSer;
        const eltX = x.nbCommentUSer; // propriété
        return eltY - eltX;
    }

    // méthode qui vérifie et supprime les doublons
    findRestaurantDuplicate(){
        let uniq = {};
        this.listRestaurant = this.listRestaurant.filter(obj => !uniq[obj.name.noAccent().toLowerCase()] && (uniq[obj.name.noAccent().toLowerCase()] = true));
    }
    
    // méthode qui ajoute les restaurants 
    addRestaurantSelected() {
        this.markers = [];
        this.listRestaurant.sort(this.compare);
        for (let restaurant of this.listRestaurant){
            this.createDescription(restaurant);
        }
    }

    // méthode qui créer les éléménts du restaurants (descrition, boutons ... )
    createDescription(restaurant) {
        restaurant.createTagList();
        restaurant.createMarker(this.map);
        this.markers.push(restaurant.marker);
        this.eventClickOnBtnRestaurant(restaurant);
        this.eventMarkerRestaurant(restaurant);
    }

    // méthode qui gère le click sur le bouton du restaurant
    eventClickOnBtnRestaurant(restaurant) {
        $('#btn-'+restaurant.id+'').on("click",()=> {
            let request = restaurant.requestDetails();        
            this.service.getDetails(request, this.callBackGetDetails.bind(this, restaurant));
            restaurant.showDescription();
        });
    }

    // méthode qui gère le click sur le marqueur du restaurant
    eventMarkerRestaurant(restaurant) {
        restaurant.marker.addListener('click', ()=> {
            let request = restaurant.requestDetails();        
            this.service.getDetails(request, this.callBackGetDetails.bind(this, restaurant));
            let sizeMap = Math.round($(this.map.getDiv()).children().eq(0).width());
            let sizeScreen = Math.round(window.innerWidth);
            $('#btn-'+restaurant.id+'').focus();
            restaurant.showDescription();
            if (sizeMap === sizeScreen) {
                restaurant.infowindow.open(this.map, restaurant.marker);
            } 
        });
    }
    
    // méthode callback pour la fonction getDetails
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
                restaurant.showDescription();
            }
        }
    }

    // méthode qui affiche le meilleure restaurants de la zone
    showBestRestaurant() {
        this.averageRestaurantRating = [];
        for (let restaurant of this.listRestaurant) {
            this.averageRestaurantRating.push(restaurant.averageStar);
        }
        this.highestRated = Math.max.apply(null, this.averageRestaurantRating);
        let bestRestaurant = this.listRestaurant.find(elt => (elt.averageStar === this.highestRated));
        this.verifRestaurantAroundUSer(bestRestaurant);
    }

    // méthode qui vérifie si il y a des restaurant dans la zone 
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

    // méthode qui retourne les restaurants selon leurs notes (définit par l'utilisateur)
    selectionRestaurantByRating() {
        $('#valForm').on('click',()=>{
            this.deleteRestaurantList();
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
                this.listRestaurant = $.grep(this.listRestaurant, (elt) => {
                    return ((elt.averageStar >= this.minStar) && (elt.averageStar <= this.maxStar)) && (((elt.lat <= north_Lat)&&(elt.lat >= south_Lat)) && ((elt.long <= north_Lng)&&(elt.long >= south_Lng)));
                });
            }
            this.findRestaurantPlace(); 
        });
    }

    // méthode pour l'ajout d'un restaurant lors du click sur la map
    clickMapForAddRestaurant() {
        this.map.addListener('click',(e)=>{
            let sizeMap = Math.round($(this.map.getDiv()).children().eq(0).width());
            let sizeScreen = Math.round(window.innerWidth);
            if (sizeMap !== sizeScreen) {
                let latClick = e.latLng.lat();
                let lngClick = e.latLng.lng();
                $('#modalAddRestaurant').modal('show');
                this.findAddress(latClick, lngClick);
                $('.closeModalAddRestaurant').click(this.closeModalAddRestaurant());
            }
            else {
                alert("L'ajout de restaurant n'est pas autoriser en fullscreen");
            }
        });
    }
    
    // méthode qui recuper l'adresse grace au coordonées GPS
    findAddress(latClick, lngClick){
        let geocoder = new google.maps.Geocoder(); 
        let latlng = {
            lat: latClick,
            lng: lngClick
        };
        geocoder.geocode({'latLng': latlng}, (results, status)=> {
            if (status == google.maps.GeocoderStatus.OK) {
                $('#form-address').val(results[0].formatted_address);
                for (let i of results[0].address_components) {
                    if(i.types[0] == 'country') {
                        this.country = i.long_name;
                    }
                }
            }
            else {
                $('#form-address').attr('placeholder', 'ex: 91 Rue Antoine de Très, 84240 La Tour-d\'Aigues')
            }
            this.findPatternPhone();
            this.addNewRestaurant(latClick, lngClick);
        });
    }

    // méthode qui définit le pattern du numéro de téléphone 
    findPatternPhone() {
        let pattern;
        if (this.country === "France") {
            pattern = '^0[1-9]{1} [0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2}'
        }
        else {
            pattern = '[0-9]'
        }
        $('#form-phone').attr('pattern', pattern);
    }
    
    // méthode qui vérifie la validation du formulaire pour l'ajout d'un restaurant
    addNewRestaurant(latClick, lngClick) {
        $('#btnFormAddrestaurant').click(()=>{
            let patt = new RegExp($('#form-phone').attr('pattern'));
            let name = $('#form-name').val();
            let address = $('#form-address').val();
            let phone = $('#form-phone').val();
            let stars = parseFloat($('#form-star').val());
            let comment = $('#form-comment').val();

            if ((name !== "") && (address !== "") && (stars !== "") && (stars >= 0) && (stars <= 5) && ($('#form-comment').val() !== "") && (phone !== "") && (patt.test(phone))) {
                let id = this.listRestaurant.length
                let restaurant = new Restaurant(id, name, address, latClick, lngClick, stars, 1);
                restaurant.recoverElt = true; 
                restaurant.phoneNumber = phone;
                restaurant.formattedAddress = address;
                restaurant.comments.push(comment);
                restaurant.stars.push(stars);
                this.listRestaurant.push(restaurant);
                this.newListRestaurant.push(restaurant);
                this.createDescription(restaurant);
                this.closeModalAddRestaurant();
                $('.messageNoRestaurant').remove();
                $('#btnFormAddrestaurant').off('click');
            }
        });
    }
    
    // méthode qui gère la ferneture de la boite modal
    closeModalAddRestaurant() {
        $('#form-name').val("");
        $('#form-star').val("");
        $('#form-comment').val("");
        $('#form-phone').val("");
        $('#modalAddRestaurant').modal('hide');
    }

    // envent gragend
    eventDragend() {
        this.map.addListener('dragend', ()=> {
            this.findRestaurantPlace(); 
        });
    }

    // envent zoom
    eventZoomChanged() {
        this.map.addListener('zoom_changed', ()=> {
            this.controlZoomForRestaurant();
            this.findRestaurantPlace(); 
        });
    }
    
    // méthode qui gére le zoom
    controlZoomForRestaurant() {
        google.maps.event.clearListeners(this.map, 'click');
        this.controlAddRestaurant();
        this.changeRadiusRequest();
    }

    // méthode qui gère l'ajout de restaurant selon le zoom
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

    // méthode qui change le raduis selon le zoom 
    changeRadiusRequest() {
        let zoom = this.map.getZoom();
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
        else if ((zoom == 11) || (zoom == 10)){
            this.radius = 20000;
        }
        else if (zoom == 9) {
            this.radius = 50000;
        }
    }
}

