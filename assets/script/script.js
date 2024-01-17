apiKey = "aada82ecde2078295c905fea918b7267";

//Weather conditions and their representation using bootstrap icons 
//(Dont change property names, they match the api)
weatherConditionIcons = {
    Thunderstorm: `<i class="bi bi-cloud-lightning-rain"></i>`,
    Drizzle: `<i class="bi bi-cloud-drizzle"></i>`,
    Rain: `<i class="bi bi-cloud-rain-heavy"></i>`,
    Snow: `<i class="bi bi-snow"></i>`,
    Atmosphere: `<i class="bi bi-cloud-haze2"></i>`,
    Clear: '<i class="bi bi-sun"></i>',
    Clouds: `<i class="bi bi-cloudy"></i>`,
}

let searchHistory = [];
(function () {
    if (localStorage.getItem("search-history")) {
        searchHistory = JSON.parse(localStorage.getItem("search-history"))
        //searchHistory.forEach() do the thing
    }

})()

$("#city-input").on("keydown", function (event) {
    if (event.originalEvent.key == "Enter") {
        event.preventDefault();
        $("#city-search-btn").trigger("click");
    }
});

$("#city-search-btn").on("click", () => {
    cityCoordinates($("#city-input").val())
    $("textarea").val("")
})

function cityCoordinates(city) {
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.length == 0) {
                $("main").prepend($(
                    `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                    There are no cities by that name. Check your spelling then try again.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>`))
            } else if (data.length == 1) {
                coordinatesToForecast(data[0].lat, data[0].lon)
            } else {
                console.log(data)
                $(".modal-body").empty()
                data.forEach((city) => {
                    let citySelectorButton = $(`<button type="button" class="btn btn-secondary">${city.state}, ${city.country}</button>`)
                    $(".modal-body").append(citySelectorButton);

                    return citySelectorButton.on("click", () => {
                        coordinatesToForecast(city.lat, city.lon)
                        $("#modal").modal("hide")
                    })

                }
                )
                $("#modal").modal("show")

            }
        })
}

function coordinatesToForecast(lat, lon,) {
    fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=40`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
//            displayForecast(data);
        })
}


