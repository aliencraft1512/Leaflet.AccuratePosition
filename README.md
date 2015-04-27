# Leaflet.AccuratePosition

[Leaflet.AccuratePosition](https://github.com/m165437/Leaflet.AccuratePosition) aims to provide an accurate device location when simply calling map.locate() doesn’t.

(It’s Greg Wilson’s [getAccurateCurrentPosition()](https://github.com/gwilson/getAccurateCurrentPosition) forked to be a [Leaflet](http://leafletjs.com) plugin.)

## Background

map.locate() relies on navigator.geolocation.getCurrentPosition() to return the device location. However geolocation.getCurrentPosition() quickly returns the last position available which might not be very accurate if the device’s GPS has not been used recently. Firing this method several times will eventually give you better results because the GPS has had more time to acquire satellites.

A better way to do this is to use navigator.geolocation.watchPosition() that fires a callback every time the location changes (and seems to include accuracy improvements). After several callbacks the greatest possible accuracy can be expected, a fact this plugin works upon.

## Demo

Check out the demo at https://m165437.github.io/Leaflet.AccuratePosition  
and how it's done at https://github.com/M165437/Leaflet.AccuratePosition/tree/gh-pages

![QR Code](https://chart.googleapis.com/chart?cht=qr&chl=https%3A%2F%2Fm165437.github.io%2FLeaflet.AccuratePosition%2F&chs=180x180&choe=UTF-8&chld=L|2 "Scan QR code with mobile phone")

## Usage

```javascript
var map = L.map('map').setView([51.505, -0.09], 13);

function onAccuratePositionProgress (e) {
    console.log(e.accuracy);
    console.log(e.latlng);
}

function onAccuratePositionFound (e) {
    console.log(e.accuracy);
    console.log(e.latlng);
}

function onAccuratePositionError (e) {
    console.log(e.message)
}

map.on('accuratepositionprogress', onAccuratePositionProgress);
map.on('accuratepositionfound', onAccuratePositionFound);
map.on('accuratepositionerror', onAccuratePositionError);

map.findAccuratePosition({
    maxWait: 15000, // defaults to 10000
    desiredAccuracy: 30 // defaults to 20
});
```

This will attempt to find the device location with an accuracy of at least 30 meters in max. 15 seconds.

## Options

The option parameters are identical to getCurrentPosition() with the following additions:

* **desiredAccuracy**: The accuracy in meters that you consider "good enough". Once a location is found that meets this criterion, the accuratepositionfound event fires. Defaults to 20.
* **maxWait**: How long you are willing to wait (in milliseconds) for your desired accuracy. Once the function runs for maxWait milliseconds, it will stop trying and return the last location it was able to acquire. NOTE: If the desired accuracy is not achieved before the timeout, the onSuccess is still called. You will need to check the accuracy to confirm that you got what you expected. It's a *desired* accuracy, not a *required* accuracy. Defaults to 10000.

The following params also exist for getCurrentPosition() but are set for you by default:

* **timeout**: If no timeout is specified, it will be set to the maxWait value
* **enableHighAccuracy**: This is forced to true (otherwise, why are you using this function?!)
* **maximumAge**: This is forced to zero since we only want current location information

## License

Leaflet.AccuratePosition is free software, and may be redistributed under the MIT-LICENSE.
