//TODO Clean Up Code and Split Up in to different files
window.onload = function () {
	var messages = [];
	//onload this function will initialize a connection and privide communication between server and client
	var socket = io.connect(document.domain);
	socket.on('connect', function () {});

	$('#custom').on('click', function () {
		$.post( "8315" );
		console.log("Sending Custom Command: 8315")

	})

};


