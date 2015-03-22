function getArkive(results) {
	var requestHandle = esri.request({
		url : arkiveURL.replace("[SPECIES_NAME]",results),
		//load: requestSucceededArkive,
		handleAs:"json",
		//error: requestFailedArkive,
		timeout: 10000 },
		{ useProxy: true }
	).then(
		function(response) {
			console.log(results);
			console.log(response);	
			images.push([results, response.results[0]]);
		},
		function(error) {
			console.log(results);
			console.log(error);
			images.push([results, "No image Found"]);
		}
	
	);
}
	  
function requestFailedArkive(error) {
	console.log(error)
}

function requestSucceededArkive(arkiveresponse, io) {
	//alert("success");
	console.log(arkiveresponse)
//loop through the items and add to the feature layer
/*var jsonObj = [];
dojo.byId("arkiveCount").innerHTML = "(" + arkiveresponse.results.length + " found)";
dojo.publish("loadObservationAPIComplete", ["ARKive Loaded"]);
	for (k = 0; k < arkiveresponse.results.length; ++k) 
{

var xml = arkiveresponse.results[k];
var jsdom = dojox.xml.DomParser.parse(xml);
var linkURL = jsdom.getElementsByTagName("a")[0].attributes[0].nodeValue;
var imageURL = jsdom.getElementsByTagName("img")[0].attributes[0].nodeValue;
arkiveImages += "<div class='panel'><a href='" +linkURL +"'  target='_new'><img border='0'  src='" + imageURL + "' style='max-height:150px;max-width:170px;border: 1px solid #999999;'/></a></div>";
	
jsonObj.push({medium_url: imageURL,link_url:linkURL});


}
oPhotos["arkiveLibrary"] = jsonObj;
if (arkiveresponse.results.length>0){
dojo.publish("loadSpeciesThumbnail", [oPhotos["arkiveLibrary"][0].medium_url,oPhotos["arkiveLibrary"][0].link_url,"arkive"]);
}
else
{
dojo.publish("noSpeciesThumbnail", ["no Arkive images"]);	
}		
*/
}