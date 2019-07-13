//create map layers

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.satellite",
    accessToken: api_key
});

var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.light",
    accessToken: api_key
});


// Perform a GET request to the query URL
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
var platesUrl = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";


d3
    .json(earthquakeUrl)
    .then(function (earthquakeData) {
        console.log(earthquakeData)
        createMarkers(earthquakeData)
    });

//create markers with earthquakes and magnitude

function makeCircle(radius) {
    var customCircle = {
        radius: radius * 3.5,
        color: "black",
        weight: 0.5,
        fillOpacity: 0.9
    };

    return customCircle;
}

function createMarkers(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData.features, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, makeCircle(feature.properties.mag));
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h3>${feature.properties.place}</h3>
        <h4>${new Date(feature.properties.time)}</h4>
        <p>Magnitude: ${feature.properties.mag}</p>`)
        },
        style: function (feature) {
            var mag = feature.properties.mag;
            if (mag >= 5) {
                return { fillColor: "#da0b1f" }
            } else if (mag >= 4) {
                return { fillColor: "#dc4e08" }
            } else if (mag >= 3) {
                return { fillColor: "#dd7c07" }
            } else if (mag >= 2) {
                return { fillColor: "#dfda05" }
            } else if (mag >= 1) {
                return { fillColor: "#b6e004" }
            } else {
                return { fillColor: "#87e103" }
            };
        }
    });

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');

        var categories = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];
        var colorList = ['#87e103', '#b6e004', '#dfda05', '#dd7c07', '#dc4e08', '#da0b1f'];

        div.innerHTML = `
      <h3 style="margin: 0px; padding: 0px 0px 5px 0px; text-align: center">
        <strong>Magnitude</strong>
      </h3>
    `;

        categories.forEach((category, index) => {
            div.innerHTML += `
        <div style="height: 30px; width: 70px; margin: 0px; padding: 0px">
          <div style="background-color: ${colorList[index]}; height: 30px; width: 30px; display: inline-block; margin: 0px; padding: 0px"></div>
          <div style="height: 30px; width: 30px; float: right; line-height: 30px">${category}</div>
        </div>
        `;
        });

        return div;
    };

    // var plates = L.geoJSON(platesData.features, {
    //     fillColor: 'none',
    //     color: 'orange'
    // });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Satellite": satellite,
        "Light Map": lightmap
    };

    // Create an overlayMaps object to hold the overall score layer
    var overlayMaps = {
        'Earthquakes': earthquakes,
        // 'Fault Lines': plates
    }

    //create map

    var map = L.map("map", {
        center: [30, -100],
        zoom: 3,
        layers: [satellite, earthquakes]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);
};

