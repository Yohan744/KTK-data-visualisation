import countries from '../json/countries.json'
import axios from "axios"

mapboxgl.accessToken = process.env.TOKEN;

const maxCoordinates = [[-169.7827071443, -58.7187007344], [-170.8033889302, 77.5153340433], [178.6670204285, 77.895585424], [179.6877022144, -57.778978041], [-169.7827071443, -58.7187007344]];

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: process.env.MAP, // style URL
    center: [3.5, 45], // starting position [lng, lat]
    zoom: 4, // starting zoom
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

    ///////////////////////////////////////////////// DATE /////////////////////////////////////////////////////////////

    const slider = document.querySelector('#slider')

    const realDate = document.querySelector('#map .input-wrapper .realDate')

    slider.addEventListener("input", () => {
        realDate.innerHTML = slider.value
        pibCountries().then()
        setDate(slider, realDate)
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
                ["==", ["feature-state", "colorCountries"], 1], "#93BDFF",
                ["==", ["feature-state", "colorCountries"], 2], "#7C9FFF",
                "#A8D0FF",
            ],
            'fill-opacity': 0.75
        }
    });

    async function pibCountries() {
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

        let countriesTotalMedals
        let color = 0

        for (let i = 0; i < finalData.length; i++) {

            let indexOfFeatures = src.map(function (e) {
                return e.properties.ISO_A3;
            }).indexOf(finalData[i].country);

            countriesTotalMedals = finalData[i].total
            console.log(finalData[i].country + " has " + countriesTotalMedals)

            if (countriesTotalMedals >= 20 && countriesTotalMedals < 70) {
                color = 1

            } else if (countriesTotalMedals >= 70) {
                color = 2
            }

            map.setFeatureState(
                {
                    source: 'countries',
                    id: indexOfFeatures
                },
                {colorCountries: color},
            );

            color = 0

        }

    }

    pibCountries().then()

    ///////////////////////////////////////////////// COUNTRY //////////////////////////////////////////////////////////

    const countryName = document.querySelector('.info-wrapper .year-country-wrapper .country')
    let countryRealName

    map.on('click', 'countriesHover', (e) => {
        countryName.innerHTML = `<h4>${Object.values(e.features[0].properties)[0]}</h4>`
        countryRealName = Object.values(e.features[0].properties)[1]
        console.log(e.features[0])

        asyncCall().then()
        console.log("country = " + countryRealName)

        let bbox = turf.extent(e.features[0])

        function center() {
            map.fitBounds(bbox, {
                padding: {top: 10, bottom: 25, left: 15, right: 5},
                maxZoom: 3.5,
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