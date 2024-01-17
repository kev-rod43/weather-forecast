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

//on load, it will check for the search history data, and display it

if (localStorage.getItem("search-history")) {
    searchHistory = JSON.parse(localStorage.getItem("search-history"))
    displaySearchHistory()
    }

function displaySearchHistory(){
    $("#previous-cities").empty()
    searchHistory.forEach(
        (searchEntry)=>{
            let citySelectorButton = $(`<button type="button" class="btn btn-secondary">${searchEntry.cityName}</button>`)
            $("#previous-cities").append(citySelectorButton)
            return citySelectorButton.on("click",()=> coordinatesToForecast(searchEntry.lat,searchEntry.lon))
    })
}

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
            displayForecast(data);
        })
}

function displayForecast(data) {
    //add valitation before saving to queue
    searchHistory.unshift({ cityName: data.city.name, lat: data.city.coord.lat, lon: data.city.coord.lon })
    if (searchHistory.length > 7) {
        searchHistory.pop()
    }
    displaySearchHistory()
    console.log(searchHistory)
    localStorage.setItem("search-history", JSON.stringify(searchHistory))

    if ($("#weather-info").attr("style") == "display: none") {
        $("#weather-info").toggle()
    }

    $("#weather-current").empty()
    $("#weather-next-5-days").empty()

    console.log(data)
    let currentWeather = data.list[0].weather[0].main
    let { temp, humidity } = data.list[0].main;
    $("#weather-current").append($(`<h1>${data.city.name} ${dayjs().format("MM/DD/YYYY")} ${weatherConditionIcons[currentWeather]}</h1>`))
    $("#weather-current").append($(`<p>Temp: ${temp}°F</p>`))
    $("#weather-current").append($(`<p>Wind: ${data.list[0].wind.speed} MPH</p>`))
    $("#weather-current").append($(`<p>Humidity: ${humidity} %</p>`))

    let futureDayIndexes = [7, 15, 23, 31, 39];
    let futureDayCounter = 1;
    futureDayIndexes.forEach((index) => {
        console.log(index)
        let futureWeather = data.list[index].weather[0].main
        let { temp, humidity } = data.list[index].main;
        let div = $("<div class= 'future-day'></div>")
        div.append($(`<h2> ${dayjs().add(futureDayCounter, "day").format("MM/DD/YYYY")} ${weatherConditionIcons[futureWeather]}<h2>`))
        futureDayCounter++
        div.append($(`<p>Temp: ${temp}°F</p>`))
        div.append($(`<p>Wind: ${data.list[index].wind.speed} MPH</p>`))
        div.append($(`<p>Humidity: ${humidity} %</p>`))
        $("#weather-next-5-days").append(div)
    })
}
