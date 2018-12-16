const yargs = require('yargs');
const axios = require('axios');
const moment = require('moment-timezone');





const argv = yargs
.options({
	a:{
		demand: true,
		describe: 'Address to get weather',
		string: true
	}
})
.alias('help','h')
.alias('address','a')
.help()
.argv;





var encodeAddr =  encodeURIComponent(argv.address);
var geoCodeUrl =  `http://www.mapquestapi.com/geocoding/v1/address?key=TTqtVLK8mn5rtPq11z0kEtRW9GeYcGLv&location=${encodeAddr}`;
//using axios to send a http request, it returns a promise
axios.get(geoCodeUrl).then((response)=>{
	if(response.data.results[0].locations[0].geocodeQualityCode === 'A1XAX'){
		throw new Error('Wrong address');
	}
	console.log(`Location: ${response.data.results[0].locations[0].adminArea5} Region: ${response.data.results[0].locations[0].adminArea3} Country: ${response.data.results[0].locations[0].adminArea1}`);
	var lat = response.data.results[0].locations[0].latLng.lat;
	var lng = response.data.results[0].locations[0].latLng.lng;
	var weatherUrl =  `https://api.darksky.net/forecast/8ecea963f903583e34008dfb2d46b352/${lat},${lng}?units=auto`;
	console.log(weatherUrl);
	return axios.get(weatherUrl);	
}).then((response) => {
	var timezone = response.data.timezone;
	var date = changeTime(response.data.currently.time,timezone);

	console.log(typeof date);
	console.log(`今天是: ${date}`);
	console.log(`天气: ${response.data.currently.summary}`);
	console.log(`温度: ${response.data.currently.temperature}`);
	console.log(`体感温度: ${response.data.currently.apparentTemperature}\n\n`);


	for(var i = 0 ; i<response.data.daily.data.length ;i++){
		var date = changeTime(response.data.daily.data[i].time, response.data.timezone);


		console.log(`日期: ${date}`);
		console.log(`天气: ${response.data.daily.data[i].summary}`);
		console.log(`最高温度: ${response.data.daily.data[i].apparentTemperatureHigh}`);
		console.log(`最低温度: ${response.data.daily.data[i].apparentTemperatureLow}`);
		console.log('\n\n')
	}
}).catch((e)=> {
	if(e.code === 'ENOTFOUND'){
		console.log('Unable to connect to location server');
	}else{
		console.log(e.message);
	}
});

	function changeTime(date, timezone){
		var myDate = (new Date(date * 1000)).toISOString();
		var ISOdate = (moment.tz(myDate, timezone)).toString();
		var RealDate = new Date(ISOdate);
		var date = `${RealDate.getFullYear()}年 ${(RealDate.getMonth()+1)}月 ${RealDate.getDate()}日;`;
		return ISOdate;
	}



