$(document).ready(function() {
    $('#share-location').click(function() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                $.ajax({
                    type: 'POST',
                    url: 'save-location.php',
                    data: {latitude: latitude, longitude: longitude},
                    success: function(response) {
                        alert(response);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert('Error sharing location. Please try again later.');
                    }
                });
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });
});
