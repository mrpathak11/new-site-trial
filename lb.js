$(document).ready(() => {
	$('#share-location').click(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				let latitude = position.coords.latitude;
				let longitude = position.coords.longitude;
				$.ajax({
					url: 'save-location.php',
					method: 'POST',
					data: {latitude, longitude},
					success: () => {
						alert('Location shared successfully!');
					},
					error: () => {
						alert('Error sharing location. Please try again later.');
					}
				});
			}, () => {
				alert('Error getting location. Please try again later.');
			});
		} else {
			alert('Geolocation is not supported by this browser.');
		}
	});
});
