import countries from '../json/countries.json'
import axios from "axios"

mapboxgl.accessToken = 'pk.eyJ1Ijoibm9vb29vb29vb29vb29vb2UiLCJhIjoiY2t2aTN0OXFtMGZvYzJvbjBlYmNhcnJlbiJ9.7d0EuZjxcvKMFEuyVoEAnw'

const maxCoordinates = [[-169.7827071443, -58.7187007344], [-170.8033889302, 77.5153340433], [178.6670204285, 77.895585424], [179.6877022144, -57.778978041], [-169.7827071443, -58.7187007344]];

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/noooooooooooooooe/ckvi4aw5d1jsb14oak88v6scz", // style URL
    center: [3.5, 45], // starting position [lng, lat]
    zoom: 3, // starting zoom
    pitch: 0,
    //maxBounds: maxCoordinates, // max coordinates
});

let hoveredStateId = null;

const body = document.querySelector("body");
body.style.position = "fixed"

window.addEventListener('load', (e) => {
    body.style.position = "relative"
    document.getElementById('loading').remove()
});

map.on('load', () => {
    map.addSource('countries', {
        type: 'geojson',
        data: countries,
        generateId: true
    });

    // Get the source
    const src = map.getSource('countries')._data.features

    // Border
    map.addLayer({
        'id': 'countries',
        'type': 'line',
        'source': 'countries',
        'layout': {},
        'paint': {
            'line-color': '#F9FBFE',
            'line-width': 1
        }
    });

    ///////////////////////////////////////////// COUNTRIES HOVER //////////////////////////////////////////////////////

    map.addLayer({
        'id': 'countriesHover',
        'type': 'fill',
        'source': 'countries',
        'layout': {},
        'paint': {
            'fill-color': '#7799f4',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.65,
                0
            ]
        }
    });

    map.on('mousemove', 'countriesHover', (e) => {
        if (e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    {source: 'countries', id: hoveredStateId},
                    {hover: false}
                );
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState(
                {source: 'countries', id: hoveredStateId},
                {hover: true}
            );
        }
    });

    map.on('mouseleave', 'countriesHover', () => {
        if (hoveredStateId !== null) {
            map.setFeatureState(
                {source: 'countries', id: hoveredStateId},
                {hover: false}
            );
        }
        hoveredStateId = null;
    });

    ///////////////////////////////////////////// INTERACTION MAP //////////////////////////////////////////////////////

    const firstWrapperGpd = document.querySelector('#map .map-info-wrapper .info-wrapper .pib-global-wrapper .first-wrapper')
    const secondWrapperGpd = document.querySelector('#map .map-info-wrapper .info-wrapper .pib-global-wrapper .second-wrapper')
    const thirdWrapperGpd = document.querySelector('#map .map-info-wrapper .info-wrapper .pib-global-wrapper .third-wrapper')

    let firstWrapperGpdVerification = false
    let secondWrapperGpdVerification = false
    let thirdWrapperGpdVerification = false

    firstWrapperGpd.onclick = () => {
        pibCountries().then()
        firstWrapperGpd.classList.toggle('active')
        firstWrapperGpdVerification = firstWrapperGpd.classList.contains('active');
    }

    secondWrapperGpd.onclick = () => {
        pibCountries().then()
        secondWrapperGpd.classList.toggle('active')
        secondWrapperGpdVerification = secondWrapperGpd.classList.contains('active');
    }

    thirdWrapperGpd.onclick = () => {
        pibCountries().then()
        thirdWrapperGpd.classList.toggle('active')
        thirdWrapperGpdVerification = thirdWrapperGpd.classList.contains('active');
    }

    ///////////////////////////////////////////////// DATE /////////////////////////////////////////////////////////////

    const slider = document.querySelector('#slider')

    const realDate = document.querySelector('#map .input-wrapper .realDate')

    slider.addEventListener("input", () => {
        realDate.innerHTML = slider.value
        setDate(slider, realDate)

        if (firstWrapperGpdVerification || secondWrapperGpdVerification || thirdWrapperGpdVerification) {
            pibCountries().then()
        }

        medalsCountries().then()

    })

    function setDate(slider, realValue) {
        const val = slider.value
        const min = slider.min
        const max = slider.max
        let newVal = Number(((val - min) * 100) / (max - min));
        realValue.innerHTML = val
        realValue.style.left = newVal + "%"
    }

    ///////////////////////////////////////////// COUNTRIES PIB //////////////////////////////////////////////////////

    map.addLayer({
        'id': 'countriesPib',
        'type': 'fill',
        'source': 'countries',
        'paint': {
            'fill-color': [
                "case",
                ["==", ["feature-state", "colorCountries"], 0], "#F9FBFE",
                ["==", ["feature-state", "colorCountries"], 1], "#A8D0FF",
                ["==", ["feature-state", "colorCountries"], 2], "#93BDFF",
                ["==", ["feature-state", "colorCountries"], 3], "#7C9FFF",
                "#F9FBFE"
            ],
            'fill-opacity': 0.75
        }
    });

    async function pibCountries() {
        // Get the data
        let data = await axios.get(process.env.VPS + '/gpds?year=' + slider.value)
        let finalData = data.data.sort(function (a, b) {
            if (a.country < b.country) {
                return -1;
            }
            if (a.country > b.country) {
                return 1;
            }
            return 0;
        })

        let countriesGpd
        let color = 0

        for (let i = 0; i < finalData.length; i++) {

            let indexOfFeatures = src.map(function (e) {
                return e.properties.ISO_A3;
            }).indexOf(finalData[i].country);

            countriesGpd = finalData[i].gpd

            if (countriesGpd >= 0 && countriesGpd < 5000000000) {

                if (firstWrapperGpdVerification) {

                    color = 1
                }

            } else if (countriesGpd >= 5000000000 && countriesGpd < 20000000000) {

                if (secondWrapperGpdVerification) {

                    color = 2
                }

            } else {

                if (thirdWrapperGpdVerification) {

                    color = 3
                }

            }

            map.setFeatureState(
                {
                    source: 'countries',
                    id: indexOfFeatures
                },
                {colorCountries: color},
            );

            color = null

        }

    }

    if (firstWrapperGpdVerification || secondWrapperGpdVerification || thirdWrapperGpdVerification) {
        pibCountries().then()
    }

    ///////////////////////////////////////////// COUNTRIES MEDALS /////////////////////////////////////////////////////

    map.addLayer({
        'id': 'countriesMedals',
        'type': 'fill',
        'source': 'countries',
        'paint': {
            'fill-color': [
                "case",
                ["==", ["feature-state", "circleRadius"], 0], "#F9FBFE",
                ["==", ["feature-state", "circleRadius"], 1], "#ffafa8",
                ["==", ["feature-state", "circleRadius"], 2], "#ff5753",
                ["==", ["feature-state", "circleRadius"], 3], "#ff0a00",
                "#F9FBFE"
            ],
            'fill-opacity': 0.75
        }
    });

    async function medalsCountries() {
        // Get the data
        let data = await axios.get(process.env.VPS + '/medals?year=' + slider.value)
        let finalData = data.data.sort(function (a, b) {
            if (a.country < b.country) {
                return -1;
            }
            if (a.country > b.country) {
                return 1;
            }
            return 0;
        })

        let countriesMedals
        let circleRadius = 0

        for (let i = 0; i < finalData.length; i++) {

            let indexOfFeatures = src.map(function (e) {
                return e.properties.ISO_A3;
            }).indexOf(finalData[i].country);

            countriesMedals = finalData[i].total

            if (countriesMedals >= 0 && countriesMedals < 50) {

                circleRadius = 1

            } else if (countriesMedals >= 50 && countriesMedals < 100) {

                circleRadius = 2

            } else {

                circleRadius = 3

            }

            console.log(finalData[i].country + " has " + countriesMedals + " medals, so the circle-radius is " + circleRadius)

            map.setFeatureState(
                {
                    source: 'countries',
                    id: indexOfFeatures
                },
                {circleRadius: circleRadius},
            );

            circleRadius = 0

        }

    }

    medalsCountries().then()

    ///////////////////////////////////////////////// COUNTRY //////////////////////////////////////////////////////////

    let countryRealName

    map.on('click', 'countriesHover', (e) => {
        countryRealName = Object.values(e.features[0].properties)[1]
        console.log(e.features[0])

        console.log("country = " + countryRealName)

        let bbox = turf.extent(e.features[0])

        function center() {
            map.fitBounds(bbox, {
                padding: {top: 100, bottom: 100, left: 700, right: 0},
                maxZoom: 3,
                linear: true,
                duration: 1000
            })
        }

        center()

    });


    // Mouse position
    /*map.on('mousemove', (e) => {
        // `e.point` is the x, y coordinates of the `mousemove` event
        // relative to the top-left corner of the map.
        // `e.lngLat` is the longitude, latitude geographical position of the event.
         console.log(JSON.stringify(e.point) + " " + e.lngLat.wrap())
    });*/


    // Add marker on mouse position on click
    /*map.on('click', function(e) {
        let lat = e.lngLat.wrap().lat;
        let lng = e.lngLat.wrap().lng;

        const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(map)

    });*/

    // Add popup on mouse position on click
    /*map.on('click', function(e) {
        let lat = e.lngLat.wrap().lat;
        let lng = e.lngLat.wrap().lng;

        const popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat([lng, lat])
            .setHTML('<h1>hello world</h1>')
            .addTo(map);
    });*/


    // Markers
    /*const markerParis = new mapboxgl.Marker()
        .setLngLat([2.3522219, 48.856614])
        .addTo(map)*/
});