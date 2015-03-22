var config_byValues = config_byValues_en;
var config_byDijitId = config_byDijitId_en;
var config_byId = config_byId_en;

function resetForLanguageUpdate(type){
	language = type;
	if (language == "en") {
		config_byValues = config_byValues_en;
		config_byDijitId = config_byDijitId_en;
		config_byId = config_byId_en;
		
		dojo.style("help", "width", "105px");
		dojo.style("link_options", "width", "65px");
		//dojo.style("link_language_options", "width", "70px");
		dojo.style("extentSelect", { "width": "100px", "left":"78px" });
		dojo.style("polySelect",{ "width": "100px", "left":"198px" });
		dojo.forEach(dojo.query(".drawToolText"), function(d) { dojo.style(d, "width", "75px") });
		if (dojo.byId("splashOverlay")) {
			dojo.style("exploreMap", { "background": "url(../images/splash/exploreMap_en.png)", "width":"190px" });
			dojo.style("exploreMapHover", "width", "190px" );
			dojo.byId("exploreMapHover_image").src = "images/splash/exploreMapHover_en.png";
			var centerImage = dojo.style("splashCenter", "background").replace("_es", "_en");
			dojo.style("splashCenter", "background", centerImage);
			dojo.forEach(dojo.query(".splashImage"), function(d){
				var image = d.firstChild.src.replace("_es", "_en");
				d.firstChild.src = image;
			});
		};
	}
	
	if (language == "es") {
		config_byValues = config_byValues_es;
		config_byDijitId = config_byDijitId_es;
		config_byId = config_byId_es;
		
		dojo.style("help", "width", "170px");
		dojo.style("link_options", "width", "62px");
		//dojo.style("link_language_options", "width", "58px");
		dojo.style("extentSelect", { "width": "125px", "left":"55px" });
		dojo.style("polySelect",{ "width": "120px", "left":"185px" });
		dojo.forEach(dojo.query(".drawToolText"), function(d) { dojo.style(d, "width", "100px") });
		if (dojo.byId("splashOverlay")) {
			dojo.style("exploreMap", { "background": "url(../images/splash/exploreMap_es.png)", "width":"255px" });
			dojo.style("exploreMapHover", "width", "255px" );
			dojo.byId("exploreMapHover_image").src = "images/splash/exploreMapHover_es.png";
			var centerImage = dojo.style("splashCenter", "background").replace("_en", "_es");
			dojo.style("splashCenter", "background", centerImage);
			dojo.forEach(dojo.query(".splashImage"), function(d){
				var image = d.firstChild.src.replace("_en", "_es");
				d.firstChild.src = image;
			});
		}
	}
	
	updateBaseLanguage();
	updateFilterSelectLanguage();
	
	var width = dojo.getMarginBox(dojo.query("#resultsContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
	dojox.fx.wipeTo({ node: "resultsContentDiv", duration: 150, width: width }).play();
	
	dojo.cookie("language", language, {expires: 365, path: "/" })
}

function getLanguageCookie(){
	var cookie = dojo.cookie("language");
	if (cookie) { language = cookie; }
	return language;
}

function updateBaseLanguage() {
	for (var d in config_byDijitId) {
		var widget = dijit.byId(d);
		if (widget) {
			if ((widget.declaredClass == 'dijit.TitlePane') || (widget.declaredClass == "dijit.layout.ContentPane") || (widget.declaredClass == "dijit.Dialog")) {
				var property = "title";
			} 
			if ((widget.declaredClass == 'dijit.form.Button') || (widget.declaredClass == 'dijit.Tooltip') || (widget.declaredClass == 'dijit.form.RadioButton')) {
				var property = "label";
			}
			
			var value = config_byDijitId[d];
			widget.set(property, value);
		}
	}
	
	for (var id in config_byId) {
		if (dojo.byId(id)) {
			dojo.byId(id).innerHTML = config_byId[id];
		}
	}
}

function updateFilterSelectLanguage() {
	var selectBoxs = dojo.query(".dijitComboBox");
	dojo.forEach(selectBoxs, function(box) {
		var widget = dijit.byId(box.id.split("_")[1])
		var data = widget.get("store");
		dojo.forEach(data._arrayOfAllItems, function(d) {
			d.name[0] = (config_byValues.hasOwnProperty(d.id[0])) ? config_byValues[d.id[0]] : d.id[0];
		});
		widget.set('value', filterSelectAll);
	});
}