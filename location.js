$(document).ready(function() {
	$("#share-location-btn").on("click", function() {
	  if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
		  var lat = position.coords.latitude;
		  var lon = position.coords.longitude;
		  var url = "save-location.php?lat=" + lat + "&lon=" + lon;
		  $.ajax({
			url: url,
			success: function(data) {
			  alert(data);
			},
			error: function() {
			  alert("Error saving location. Please try again later.");
			}
		  });
		}, function(error) {
		  alert("Error sharing location. Please try again later.");
		});
	  } else {
		alert("Geolocation is not supported by this browser.");
	  }
	});
  });
  