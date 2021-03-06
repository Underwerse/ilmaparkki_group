// Google mapsin API:n skripti
'use strict';

var map, infoWindow, markerCurrentPlace, markerSearchPlace;

/**
 * Rajapinnan yleisfunktio
 */
function initMap() {
  var API_KEY_GEOCODE = 'AIzaSyCCwRrNbVDo_cepl_VaXyxVQEa_nL50AdY';
  // Peruskarttaasetukset
  var opt = {
    center: {
      lat: 60.223907,
      lng: 24.758295,
    },
    zoom: 11,
    scrollwheel: false,
  }

  // Karttaa luominen Google-rajapinnan kautta
  map = new google.maps.Map(document.getElementById('map'), opt)
  // Ponnahdusilmoitusta luominen (olion)
  infoWindow = new google.maps.InfoWindow();

  /**
   * Merkin ikonia asentaminen funktio
   * @param {object} marker   Merkki-olio
   * @param {number} size     Ikonin koko pikselilla
   * @param {number} iconName Ikonin tiedoston nimi
   */
  const setMarkerIcon = (marker, size, iconName) => {
    marker.setIcon(({
      url: `../media/img/${iconName}`,
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(size, size),
    }));
  }

  /**
   * Osoitetta yksityikohtia antaminen koordinoiden perusteella
   * @param {object} map     sivustolla oleva kartta
   * @param {object} coords  koordinaatit
   * @param {object} marker  paikan luottu merkki
   */
  const getAddressFromCoords = (map, coords, marker) => {
    const lat = coords.lat;
    const lng = coords.lng;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY_GEOCODE}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        printLocationData(map, data.results[0], marker);
      })
      .catch(err => console.log(err.message));
  }

  /**
   * Osoitteen tietojen tulostaminen funktio
   * @param {*} map     sivustolla oleva kartta
   * @param {*} place   löydetty paikka
   * @param {*} marker  luottu merkki
   */
  const printLocationData = (map, place, marker) => {
    var address = '';
    if (place.formatted_address) {
      address = place.formatted_address.split(',', 2);
    }

    let durationMsg = '';

    // Ponnahdusilmoituksen viestiä luominen merkin tyypin perusteella
    if (marker.type === 'currentLocation') {
      durationMsg = `<div><strong>Osoitteesi:</strong><br>${address}`;
    } else if (marker.type === 'searchLocation') {
      durationMsg = `${address}`;
    } else {
      durationMsg = `
        <strong>Osoite:</strong><br>${address} 
        ${getDurationMsg(marker)}
        <p
          id='infoWindowText'><strong>Reittiohjeet</strong>
          <img id='findRouteBtn' src="../media/img/route.png">
        </p>`;
    }

    // Ponnahdusilmoitusta löydettysijainnissa luominen
    infoWindow.setContent(durationMsg);
    infoWindow.open(map, marker);

    // Löytöosoitteen tietojen laittaminen taulukkoon sivulle
    for (var i = 0; i < place.address_components.length; i++) {
      if (place.address_components[i].types[0] == 'postal_code') {
        document.getElementById('postal_code').innerHTML = place.address_components[i].long_name;
      }
      if (place.address_components[i].types[0] == 'country') {
        document.getElementById('country').innerHTML = place.address_components[i].long_name;
      }
    }
    document.getElementById('location').innerHTML = place.formatted_address;

    // Osoitetietotaulukkoa sivulta saaminen
    var receivedGeoData = document.querySelector('.geoData');
    // Osoitetietojen taulukkoa näyttäminen sivulle
    receivedGeoData.classList.remove('hidden');
  }

  /**
   * Klikatun merkin tietojen tuloste funktio
   * @param {object} map 
   * @param {object} marker 
   */
  const getClickedMarkerAddress = (map, marker) => {
    // Google API:n linkki
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${marker.address}&key=${API_KEY_GEOCODE}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Otetun merkin tietojen tulosteeseen antaminen
        printLocationData(map, data.results[0], marker);
        // Klikatun merkin linkille tapahtumankäsitteliäjn nimeäminen
        setTimeout(() => {
          document.querySelector('#findRouteBtn')
            .addEventListener(
              'click', () => {
                // Tapahtumankäsittelijän funktio (reititystä varten)
                getDirection(data.results[0].formatted_address)
              }
            );
        }, 100);
      })
      .catch(err => console.log(err.message));
  }

  /**
   * Lisätään kartalle nykysijainti-nappia
   */
  const setCurrentLocationFunctionality = () => {

    // Luodaan napin
    const locationButton = document.createElement("div");

    locationButton.classList.add("custom-map-control-button");
    locationButton.id = "currentLocation";

    // Lisätään luovaa nappia kartalle
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    // Napin toiminto
    locationButton.addEventListener("click", () => {
      removeNonPlaceMarkers();
      hideRoute();
      // Kun sijaintihaku onnistuu (laitteen GPS on päällä)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Nykyistä positiota saaminen
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Nykyisen position merkkiä luominen kartalle
            markerCurrentPlace = new google.maps.Marker({
              position: pos,
              map,
            });

            markerCurrentPlace.type = 'currentLocation';

            setMarkerIcon(markerCurrentPlace, 50, 'currentPlace.png');

            // Ponnahdusilmoitusta nykysijainnissa luominen
            infoWindow.setPosition(pos);
            infoWindow.setContent("Olet tässä");
            // Ponnahdusilmoitusta näyttäminen
            infoWindow.open(map, markerCurrentPlace);
            map.setCenter(pos);
            map.setZoom(17);

            getAddressFromCoords(map, pos, markerCurrentPlace);
            document.querySelector('.geoData').classList.remove('hidden');
          },
          // Virhekäsittely
          () => {
            handleLocationError(true, infoWindow, map.getCenter());
          }
        );
      } else {
        // Kun sijaintihaku ei onnistunut
        handleLocationError(false, infoWindow, map.getCenter());
      }
    });

    // Sijaintihakua epäonnistumista funktio
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(
        browserHasGeolocation ?
        "Error: The Geolocation service failed." :
        "Error: Your browser doesn't support geolocation."
      );
      // Ponnahdusilmoitusta näyttäminen (virheen saattuessa)
      infoWindow.open(map);
    }
  }

  setCurrentLocationFunctionality();

  /**
   * Lisätään kartalle osoitehaku-toimintoa
   */
  const setSearchLocationFunctionality = () => {
    // Hakukenttaa sivulta saaminen
    var input = document.getElementById('searchInput');
    // Lisätään hakukenttaa kartalle
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(input);

    /*
    Google-rajapinnan 'Autocomplete' käyttäminen
    (osakirjattuvaa osoitetta haku ja täyttäminen automaattisesti)
    */
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);


    // Osoitehakukentan muutosten seuranta toiminto
    autocomplete.addListener('place_changed', function () {
      // Viimeistä ponnahdusilmoitusta sulkeminen
      infoWindow.close();
      removeNonPlaceMarkers();
      hideRoute();
      // Löydetyn osoitteen merkkiä luominen kartalle
      markerSearchPlace = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
      });
      markerSearchPlace.type = 'searchLocation';
      // Löytyvää osoiteetta saaminen
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert(`Autocomplete's returned place contains no geometry`);
        return;
      }

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      // Löytyvää positiota merkkiä luominen kartalle
      setMarkerIcon(markerSearchPlace, 50, 'searchPlace.png');

      markerSearchPlace.setPosition(place.geometry.location);
      markerSearchPlace.setVisible(true);

      // Osoiteilmoitustietojen luominen (kartan merkille antamista varten)
      printLocationData(map, place, markerSearchPlace);
    });
  }

  setSearchLocationFunctionality();

  // Reititys-toimintoa lisääminen
  // Luodaan Google Directions-API:n oliot
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();

  /**
   * Reititys-toiminnan pääfunktio
   * @param {String} destination  Toimituspisteen osoite
   */
  function getDirection(destination) {
    // Otetaan nykysijäinnin osoitteen
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Nykyistä positiota saaminen
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=${API_KEY_GEOCODE}`;
        fetch(url)
          .then(response => response.json())
          .then(data => {
            origin = data.results[0].formatted_address;
            // console.log(origin);
            hideRoute();

            // Luodaan reititys lähde- ja toimituspisteiden perusteella
            directionsDisplay.setMap(map);
            var request = {
              origin: origin,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING,
            }

            // Reitityksen käsittely
            directionsService.route(request, (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                let distance = result.routes[0].legs[0].distance.text;
                let duration = result.routes[0].legs[0].duration.text;
                // Taulukkoon reitityksen tietojen tuloste
                document.getElementById('routeDistance').innerText = distance;
                document.getElementById('routeDuration').innerText = duration;
                document.getElementById('routeDistanceRow').classList.remove('hidden');
                document.getElementById('routeDurationRow').classList.remove('hidden');
                // Reitityksen näyttö kartalle
                directionsDisplay.setDirections(result);
              } else {
                hideRoute();
              }
            })
          })
          .catch(err => console.log(err.message));
      }
    );
  }

  /**
   * Kartalla olevan reitityksen poisto funktio
   */
  function hideRoute() {
    directionsDisplay.setDirections({
      routes: []
    });
    // Taulukolla olevien reitityksen tietojen poisto
    document.getElementById('routeDistanceRow').classList.add('hidden');
    document.getElementById('routeDurationRow').classList.add('hidden');
  }

  /* 
  Nykyisiä merkkeja tietojen lukeminen
  (tietokannasta, joka on tällä hetkellä paikallinen json-tiedosto)
  */
  var markers = [];
  var placesFromFile = [];
  var places = [];
  // Tietokannan tiedoston paikallinen osoite
  var placesFile = '../places.json';

  /**
   * Paikallista json-tiedostoa lukeminen-funktio ('XMLHttpRequestin' kautta)
   * @param {*} file      paikallisen json-tiedoston osoite
   * @param {*} callback  tuloskäsittely-funktio
   */
  const readPlacesFile = (file, callback) => {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
  }

  // Json-tiedoston lukeminen-toiminto
  readPlacesFile(placesFile, function (text) {
    placesFromFile = JSON.parse(text);
    places = JSON.parse(JSON.stringify(placesFromFile));
    // Jokaiselle json-tiedostosta löydetylle kohteelle asetuksia antaminen
    places.forEach(place => {
      place.icon = '../media/img/parkkiMerkki48.ico';
      place.animation = google.maps.Animation.DROP;
      place.map = map;
      place.draggable = false;
      markers.push(new google.maps.Marker(place));
    });
    // Animaatio-toiminta merkeille
    markers.forEach(el => {
      el.addListener("click", toggleBounce);
    });
    return placesFromFile;
  });

  /**
   * Tarkastellaan pysäköinnin aikaa ja tulostaa sen pituus sekä osoite
   * @param {object} place    merkki-olio
   * @returns                 sallittu pysäköintiaika (String)
   */
  const getDurationMsg = place => {
    let msg = '';
    if (place.duration !== 0) {
      msg += `
        <p id='infoWindowText'><strong>Sallittu aika:</strong> ${place.duration} t.</p>
      `
    } else {
      msg += `
        <p id='infoWindowText'>Sallittu aika: ei rajoituksia</p>
      `
    }

    return msg;
  }

  /**
   * Poistetaan kaikki kartalla olevia merkkeja,
   * paitsi json-tiedostosta ladattua
   */
  const removeNonPlaceMarkers = () => {
    // Nykysijäinnin merkkiä poistetaan
    if (markerCurrentPlace) {
      markerCurrentPlace.setVisible(false);
      markerCurrentPlace.setMap(null);
      markerCurrentPlace = null;
    }
    // Hakuosoitteen merkkiä poistetaan
    if (markerSearchPlace) {
      markerSearchPlace.setVisible(false);
      markerSearchPlace.setMap(null);
      markerSearchPlace = null;
    }
  }

  /**
   * Merkkien animaatio-funktio
   */
  function toggleBounce() {
    // Tarkistetaan, onko joka toinen merkki avattuna ja suljetaan tätä, kun on
    if (this.getAnimation() !== null) {
      this.setAnimation(null);
      infoWindow.close();
    } else {
      // Animaatio ei tällä hetkellä ole käytössä
      /* this.setAnimation(google.maps.Animation.BOUNCE); */
      // Painetulla merkilla tietojen näyttö
      removeNonPlaceMarkers();
      getClickedMarkerAddress(map, this);

    }
  }

  /**
   * Osoitehaun kentän kartalle ilmestyminen kartan luomisen jälkeen
   */
  const searchFieldSet = () => {
    document.getElementById('searchInput').classList.remove('hidden');
  }

  setTimeout(searchFieldSet, 2000);
}