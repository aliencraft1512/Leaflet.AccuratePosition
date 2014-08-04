/**
 * Leaflet.AccuratePosition aims to provide an accurate device location when simply calling map.locate() doesn’t.
 * https://github.com/m165437/Leaflet.AccuratePosition
 *
 * Greg Wilson's getAccurateCurrentPosition() forked to be a Leaflet plugin
 * https://github.com/gwilson/getAccurateCurrentPosition
 *
 * Copyright (C) 2013 Greg Wilson, 2014 Michael Schmidt-Voigt
 */

L.Map.include({
	_defaultAccuratePositionOptions: {
		maxWait: 10000,
		desiredAccuracy: 20
	},

	findAccuratePosition: function (options) {
		var that = this;

		if (!navigator.geolocation) {
			geolocationError({
				code: 0,
				message: 'Geolocation error: Geolocation not supported.'
			});
			return this;
		}

		this._accuratePositionEventCount = 0;
		this._accuratePositionOptions = L.extend(this._defaultAccuratePositionOptions, options);

		if (!this._accuratePositionOptions.timeout)
			this._accuratePositionOptions.timeout = this._accuratePositionOptions.maxWait;

		var onResponse = L.bind(this._checkAccuratePosition, this),
			onError = L.bind(this._handleAccuratePositionError, this);

		this._accuratePositionWatchId = navigator.geolocation.watchPosition(
			onResponse,
			onError,
			this._accuratePositionOptions);

		this._accuratePositionTimerId = setTimeout(
			function () {
				navigator.geolocation.clearWatch(that._accuratePositionWatchId);
				that._handleAccuratePositionResponse(that._lastCheckedAccuratePosition);
				return that;
			},
			this._accuratePositionOptions.maxWait);
	},

	_cleanUpAccuratePositioning: function () {
		clearTimeout(this._accuratePositionTimerId);
		navigator.geolocation.clearWatch(this._accuratePositionWatchId);
	},

	_checkAccuratePosition: function (pos) {
		var accuracyReached = pos.coords.accuracy <= this._accuratePositionOptions.desiredAccuracy;

		this._lastCheckedAccuratePosition = pos;
		this._accuratePositionEventCount = this._accuratePositionEventCount + 1;

		if (accuracyReached && (this._accuratePositionEventCount > 1)) {
			this._cleanUpAccuratePositioning();
			this._handleAccuratePositionResponse(pos);
		} else {
			this._handleAccuratePositionProgress(pos);
		}
	},

	_prepareAccuratePositionData: function (pos) {
		var lat = pos.coords.latitude,
			lng = pos.coords.longitude,
			latlng = new L.LatLng(lat, lng),

			latAccuracy = 180 * pos.coords.accuracy / 40075017,
			lngAccuracy = latAccuracy / Math.cos(L.LatLng.DEG_TO_RAD * lat),

			bounds = L.latLngBounds(
				[lat - latAccuracy, lng - lngAccuracy],
				[lat + latAccuracy, lng + lngAccuracy]);

		var data = {
			latlng: latlng,
			bounds: bounds,
			timestamp: pos.timestamp
		};

		for (var i in pos.coords) {
			if (typeof pos.coords[i] === 'number') {
				data[i] = pos.coords[i];
			}
		}

		return data;
	},

	_handleAccuratePositionProgress: function (pos) {
		var data = this._prepareAccuratePositionData(pos);
		this.fire('accuratepositionprogress', data);
	},

	_handleAccuratePositionResponse: function (pos) {
		var data = this._prepareAccuratePositionData(pos);
		this.fire('accuratepositionfound', data);
	},

	_handleAccuratePositionError: function (error) {
		var c = error.code,
			message = error.message ||
				(c === 1 ? 'permission denied' :
				(c === 2 ? 'position unavailable' : 'timeout'));

		this._cleanUpAccuratePositioning();

		this.fire('accuratepositionerror', {
			code: c,
			message: 'Geolocation error: ' + message + '.'
		});
	}
});