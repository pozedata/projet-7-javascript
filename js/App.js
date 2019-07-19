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
        this.newListRestaurant = this.listRestaurant;
        this.eltMap;

        this.createObjectRestaurant();
        this.selectionRestaurantByRating();
        this.test();
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
        var styledMapType = new google.maps.StyledMapType(StyleMap ,{name: 'Styled Map'});

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
        this.getLatLng();

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
                console.log('salut');
                let name = $('#form-name').val();
                let address = $('#form-address').val();
                let ratings = [{
                    stars: $('#form-star').val(),
                    comment: $('#form-comment').val()
                }];
                let id = this.listRestaurant.length
                let restaurant = new Restaurant(id, name, address, latClick, lngClick, ratings);
                this.listRestaurant.push(restaurant);
                this.createDescription(restaurant);
                this.closeModalAddRestaurant();
            }
        })
    }


    closeModalAddRestaurant() {
            $('#form-name').val("");
            $('#form-star').val("");
            $('#form-comment').val("");
            $('#modalAddRestaurant').modal('hide');
    }

    getLatLng(){
        this.map.addListener('bounds_changed', ()=> {
            let LatLng = this.map.getBounds();
            let south_Lat = LatLng.getSouthWest().lat();
            let south_Lng = LatLng.getSouthWest().lng();
            let north_Lat = LatLng.getNorthEast().lat();
            let north_Lng = LatLng.getNorthEast().lng();
            for (let restaurant of this.newListRestaurant){
                if (((restaurant.lat <= north_Lat)&&(restaurant.lat >= south_Lat)) && ((restaurant.long <= north_Lng)&&(restaurant.long >= south_Lng))) {
                    console.log(restaurant.name);
                    
                }
            }
            console.log(south_Lat,south_Lng,north_Lat,north_Lng);
            google.maps.event.clearListeners(this.map, 'bounds_changed');
         });
    }


    eventGetLatLng() {
        this.map.addListener('dragend', ()=> {
            /* On récupère les coordonnées des coins de la map */ 
            let LatLng = this.map.getBounds();
            let South_Lat = LatLng.getSouthWest().lat();
            let South_Lng = LatLng.getSouthWest().lng();
            let North_Lat = LatLng.getNorthEast().lat();
            let North_Lng = LatLng.getNorthEast().lng();
            console.log(South_Lat,South_Lng,North_Lat,North_Lng);
           });
    }

    test(){
        console.log(window.innerWidth);
        console.log($('#mapGoogle').width());
    }
}

