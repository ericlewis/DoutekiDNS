var http = require('http');
var request = require('request');
var api_url = null;

if(process.argv.length < 6){
	console.error('Usage: node client.js --action exampleapi.com username password');
	return false;
}

process.argv.forEach(function (val, index, array) {

  if(index == 2 && val.replace('--', '') == 'register'){
  	  api_url = array[3];
	  registerUser(array[4], array[5]);
  }else if(index == 2 && val.replace('--', '') == 'update'){
      api_url = array[3];
      setTimeout(attemptUpdate, 5000, array[4], array[5]);
  }else if(index == 2 && val.replace('--', '') != 'update' || index == 2 && val.replace('--', '') != 'register'){
  	  console.error('invalid action, available actions: update, register.');
	  return false;
  }
});

function registerUser(username, password){
	var options = {
		host: api_url,
		path: '/api/v1/register/'+username+'/'+password
	};
	
	var callback = function(response) {
		var str = '';
		
		response.on('data', function (chunk) {
			str += chunk;
		});
		
		response.on('end', function () {
			var result = JSON.parse(str);
			
			if(result.success == true){
				console.log('User registered!');
				setTimeout(attemptUpdate, 5000, username, password);
			}else{
				console.error('Error registering.');
				return false;
			}
		});
	}
	
	http.request(options, callback).end();

}

function attemptUpdate(username, password){

	var url = "http://" + username + ":" + password + "@"+api_url;

	request(
	    {
	        url : url
	    },
	    function (error, response, body) {
	        // Do more stuff with 'body' here
	        console.log(body);
	        var result = JSON.parse(body);

			if(result.success == true){
				console.log('IP Updated!');
			}else{
				console.log('No need to update!');
			}
			
			setTimeout(attemptUpdate, 5000, username, password);
	    }
	);

};