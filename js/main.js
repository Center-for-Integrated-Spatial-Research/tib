function splashInit() {
	urlQueryParams = dojo.queryToObject(decodeURI(window.location.search.slice(1)));
	if (urlQueryParams.name) {
		//var stripped_url = removeVariableFromURL(window.location.href, "id");
		var type = urlQueryParams.lng;
		resetForLanguageUpdate(type);
		toggleSplashLanguage(type);
		launchTibApp();
	} else {
		var type = getLanguageCookie();
		resetForLanguageUpdate(type);
		toggleSplashLanguage(type);
		
		dojo.style("splashCenter", "background","url(images/splash/" + images[random][0] + "_" + type + ".jpg) no-repeat");
		dojo.style("splashFloater", { "opacity": 1 });
		dojo.style("exploreMapHover", {"opacity":"0", "display":"block" });
		dojo.connect(dojo.byId("exploreMap"), "onclick", function(evt) {
			launchTibApp();
		});
		
		var panes = [];
		for (var i=0; i<images.length; i++) {
			var next = ((random + i) < images.length) ? (random + i) : Math.abs((random + i) - images.length);
			for (var k=0; k<images[next][1]; k++) {
				panes.push({ className: "splashImage", innerHTML: '<img src="images/splash/'+ images[next][0] +'_' + k + '_' + type + '.jpg">' } );
			}
		}
		
		splashRotatorWidget = new dojox.widget.AutoRotator({
				id: "splashRotatorWidget",
				transition: "dojox.widget.rotator.crossFade",
				transitionParams: "duration: 2000, onEnd: function() { var curr = this.current.node.innerHTML.split('/').pop().split('_')[0]; var next = this.next.node.innerHTML.split('/').pop().split('_')[0]; if (curr != next) { if(dojo.byId('splashCenter')){ dojo.style('splashCenter', 'background', 'url(images/splash/' + next + '_' + language + '.jpg) no-repeat'); } } }",
				duration: 1500,
				pauseOnManualChange: false,
				suspendOnHover: false,
				panes: panes
			},
			dojo.byId("splashRotator")
		);
		dojo.style("splashCenter", "background","url(images/splash/" + images[random][0] + "_+ " + type + ".jpg) no-repeat");
		dojo.style(dojo.query("body")[0], "overflow", "auto");
		dojo.style(dojo.query("html")[0], "overflow", "auto");
		
		new dijit.Tooltip({ id:"splash_language_english_tooltip", connectId: "en", label:(config_byDijitId.hasOwnProperty('splash_language_english_tooltip')) ? config_byDijitId['splash_language_english_tooltip'] : "English", position: ["below", "above", "before", "after"], showDelay:10 });
		new dijit.Tooltip({ id:"splash_language_spanish_tooltip", connectId: "es", label:(config_byDijitId.hasOwnProperty('splash_language_spanish_tooltip')) ? config_byDijitId['splash_language_spanish_tooltip'] : "Spanish", position: ["below", "above", "before", "after"], showDelay:10 });
	}
}

function toggleSplashLanguage(id) {
	dojo.query(".language_circle").style({ "background":"#1c1c1c", "color":"#666" });
	dojo.query('div[id^="' + id +'"]').style( { "background":"#3c3c3c", "color":"#fff" } );
}

function removeVariableFromURL(url_string, variable_name) {
	var URL = String(url_string);
	var regex = new RegExp( "\\?" + variable_name + "=[^&]*&?", "gi");
	URL = URL.replace(regex,'?');
	regex = new RegExp( "\\&" + variable_name + "=[^&]*&?", "gi");
	URL = URL.replace(regex,'&');
	URL = URL.replace(/(\?|&)$/,'');
	regex = null;
	return URL;
}

function hoverGoToMap(image) {
	var fadeArgs = { node: "exploreMapHover", duration: 350 };
	if (image == "exploreMapHover") {
		dojo.fadeIn(fadeArgs).play();
	} else {
		dojo.fadeOut(fadeArgs).play();
	}
}

function launchTibApp() {
	var fadeArgs = {
		node: "splashFloater",
		duration: 1000,
		onEnd: function(){
			//splashRotatorWidget.destroy();
			dojo.destroy("splashOverlay");
			mapInit();
		}
	};
	dojo.fadeOut(fadeArgs).play();
}

function mapInit(){
	dijit.byId("application").resize();
	dojo.style("progressBarDiv", { 
			display:"block",
			top: dojo.style("mapDiv", "height")/2 - dojo.style("progressBarDiv", "height")/2 + dojo.style("topDiv", "height")/2 + "px",
			left: dojo.style("mapDiv", "width")/2 - dojo.style("progressBarDiv", "width")/2 + "px"
	});
	
	var width = (language == 'en') ? 70 : 85;
	dojox.fx.wipeTo({ node: "resultsContentDiv", duration: 150, width: width }).play();
	
	//turn off map slider labels
	esri.config.defaults.map.sliderLabel = null;
	esri.config.defaults.map.slider = { right:"20px", top:"10px", width:"125px", height:null};
	esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
	esri.config.defaults.io.corsEnabledServers.push(corsServer);
	esri.config.defaults.io.proxyUrl = "/proxy/proxy.ashx"
	
	var popupOptions = {
	  "markerSymbol": new esri.symbol.SimpleMarkerSymbol("circle", 8, null, new dojo.Color([0, 0, 0, 0.25]))
	};
	var popup = new esri.dijit.Popup(popupOptions, dojo.create("div"));
	
	var template = new esri.InfoTemplate();
	template.setTitle("<b>${Island_Name}</b>");
	
	//set initial extent and levels of detail (lods) for map
	initialExtent = new esri.geometry.Extent({
		"xmin": -32169593.472203825,
		"ymin": -7024868.647519005,
		"xmax": -939258.2035679845,
		"ymax": 7611905.0247489195,
		"spatialReference": { "wkid": 102100 } 
	});
	
	var lods = [
      //{"level" : 0, "resolution" : 156543.033928, "scale" : 591657527.591555}, 
      //{"level" : 1, "resolution" : 78271.5169639999, "scale" : 295828763.795777}, 
      {"level" : 2, "resolution" : 39135.7584820001, "scale" : 147914381.897889},
	  {"level" : 3, "resolution" : 19567.8792409999, "scale" : 73957190.948944}, 
      {"level" : 4, "resolution" : 9783.93962049996, "scale" : 36978595.474472}, 
      {"level" : 5, "resolution" : 4891.96981024998, "scale" : 18489297.737236}, 
      {"level" : 6, "resolution" : 2445.98490512499, "scale" : 9244648.868618}, 
      {"level" : 7, "resolution" : 1222.99245256249, "scale" : 4622324.434309}, 
      {"level" : 8, "resolution" : 611.49622628138, "scale" : 2311162.217155}, 
      {"level" : 9, "resolution" : 305.748113140558, "scale" : 1155581.108577}, 
      {"level" : 10, "resolution" : 152.874056570411, "scale" : 577790.554289}, 
      //{"level" : 11, "resolution" : 76.4370282850732, "scale" : 288895.277144}, 
      //{"level" : 12, "resolution" : 38.2185141425366, "scale" : 144447.638572}
    ];
	
	map = new esri.Map("mapDiv", {	
		"extent":initialExtent,
		"fitExtent": false,
		"lods": lods,
		"logo": false,
		"fadeOnZoom": true,
		"force3DTransforms": true,
		"navigationMode": "css-transforms",
		"wrapAround180": true,
		"infoWindow": popup,
		"slider": false
	});
	
	ovMapLayer = new esri.layers.ArcGISTiledMapServiceLayer(ovMapLayerUrl,{ id:'ovmap', visible: true });
	map.addLayer(ovMapLayer);
	
	baseMapLayer = new esri.layers.ArcGISTiledMapServiceLayer(baseMapLayerUrl,{id:'basemap'});
	map.addLayer(baseMapLayer);
	
	imageryLayer = new esri.layers.ArcGISTiledMapServiceLayer(imageryLayerUrl,{id:'imagery', visible: false });
	map.addLayer(imageryLayer);
	
	islandPointFeatures = new esri.layers.FeatureLayer(islandPointFeaturesUrl, {
	  id:'islands',
	  mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
	  outFields: islandPointFeaturesFields
	});
	
	islandSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([210,210,210,1]), 1), new dojo.Color([130,130,130,1]));
	
	selectionSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255,1]), 1), new dojo.Color([194,75,79,1]));
	
	highlightSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([246,247,146,1]), 4), new dojo.Color([194,75,79,1]));
	
	islandPointFeatures.setRenderer(new esri.renderer.SimpleRenderer(islandSymbol));
	islandPointFeatures.setSelectionSymbol(islandSymbol);
	map.addLayer(islandPointFeatures);
	
	//dojo.connect(islandPointFeatures, "onSelectionComplete", processIslandData);
	
	islandPointSelectionLayer = new esri.layers.GraphicsLayer({id:'selectionLayer'});
	islandPointSelectionLayer.setRenderer(new esri.renderer.SimpleRenderer(selectionSymbol))
	map.addLayer(islandPointSelectionLayer);
	islandPointSelectionLayer.show();
	
	islandPointHighlightLayer = new esri.layers.GraphicsLayer({id:'highlightLayer'});
	islandPointHighlightLayer.setRenderer(new esri.renderer.SimpleRenderer(highlightSymbol))
	map.addLayer(islandPointHighlightLayer);
	islandPointHighlightLayer.show();	
	
	var query = new esri.tasks.Query();
	query.where = ("Sensitive <> 1");
	query.returnGeometry = true;
	islandPointFeatures.queryFeatures(query, function(results) {
		islandPointFeaturesLayer = results;
		if (!dijit.byId("islandSelect")) {
			var data = filterSelectData(results.features, "Island_Name", ["Country", "Region_ID_Name"], true);
			populateFilterSelect(data, "islandSelect", false, "", "", [{ filter: "countrySelect", link: "Country" },{ filter: "regionSelect", link: "Region_ID_Name" }]);

			dojo.connect(dijit.byId("islandSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("islandSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}
		
		if (!dijit.byId("countrySelect")) {
			var data = filterSelectData(results.features, "Country", ["Region_ID_Name"], true);

			populateFilterSelect(data, "countrySelect", true, ["islandSelect"], "Country", [{ filter: "regionSelect", link: "Region_ID_Name" }]);

			dojo.connect(dijit.byId("countrySelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("countrySelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});		
		}		

		if (!dijit.byId("regionSelect")) {
			var data = filterSelectData(results.features, "Region_ID_Name", "#", true);
			populateFilterSelect(data, "regionSelect", true, ["islandSelect", "countrySelect"], "Region_ID_Name");
			dojo.connect(dijit.byId("regionSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("regionSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});
		}
		appLoaded.push("islandPointFeaturesSelect");
		checkAppLoaded();		
	});	

	var queryTask = new esri.tasks.QueryTask(threatenedSppTableUrl);
	var query = new esri.tasks.Query();
	query.where = ("Sensitive = 0");
	query.outFields = threatenedSppIslandFields;
	queryTask.execute(query, function(results) {
		threatenedSppIslandTable = results;
		dojo.forEach(threatenedSppIslandTable.features, function(item){
			item.attributes["Order_"] = item.attributes["Order_"][0] + item.attributes["Order_"].slice(1).toLowerCase();
		})
		if (!dijit.byId("threatenedStatusSelect")) {
			var data = filterSelectData(threatenedSppIslandTable.features, "Red_List_Status", "#", true);

			var items = [];
			dojo.forEach(redListSelectOrder, function(item){
				var check = (config_byValues.hasOwnProperty(item)) ? config_byValues[item] : item;
				dojo.some(data.items, function(obj) {
					if (obj.name == check) { items.push(obj); }
				});
			});
			data.items = items;
			
			populateFilterSelect(data, "threatenedStatusSelect", true, "", "");
			dojo.connect(dijit.byId("threatenedStatusSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("threatenedStatusSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}
		
		if (!dijit.byId("threatenedTypeSelect")) {
			var data = filterSelectData(threatenedSppIslandTable.features, "Animal_Type_Corrected", "#", true);
			populateFilterSelect(data, "threatenedTypeSelect", true, ["threatenedCommonSelect", "threatenedScientificSelect", "threatenedFamilySelect", "threatenedOrderSelect"], "Animal_Type_Corrected" );
			dojo.connect(dijit.byId("threatenedTypeSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("threatenedTypeSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}
		
		if (!dijit.byId("threatenedOrderSelect")) {
			var data = filterSelectData(threatenedSppIslandTable.features, "Order_", ["Animal_Type_Corrected"], true);
			populateFilterSelect(data, "threatenedOrderSelect", true, ["threatenedFamilySelect","threatenedCommonSelect", "threatenedScientificSelect"], "Order_", [{ filter: "threatenedTypeSelect", link: "Animal_Type_Corrected" }]);
			dojo.connect(dijit.byId("threatenedOrderSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("threatenedOrderSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}
		
		if (!dijit.byId("threatenedFamilySelect")) {
			var data = filterSelectData(threatenedSppIslandTable.features, "Family", ["Animal_Type_Corrected", "Order_"], true);
			populateFilterSelect(data, "threatenedFamilySelect", true, ["threatenedCommonSelect", "threatenedScientificSelect"], "Family", [{ filter: "threatenedTypeSelect", link: "Animal_Type_Corrected" },{ filter: "threatenedOrderSelect", link: "Order_" }]);
			dojo.connect(dijit.byId("threatenedFamilySelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("threatenedFamilySelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}

		if (!dijit.byId("threatenedScientificSelect")) {
			var data = filterSelectData(threatenedSppIslandTable.features, "Scientific_Name", ["Animal_Type_Corrected", "Order_", "Family", "Common_Name"], true);
			populateFilterSelect(data, "threatenedScientificSelect", false, "", "", [{ filter: "threatenedCommonSelect", link: "Common_Name" },{ filter: "threatenedTypeSelect", link: "Animal_Type_Corrected" },{ filter: "threatenedOrderSelect", link: "Order_" },{ filter: "threatenedFamilySelect", link: "Family" }]);
			dojo.connect(dijit.byId("threatenedScientificSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("threatenedScientificSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}

		if (!dijit.byId("threatenedCommonSelect")) {
			var data = filterSelectData(threatenedSppIslandTable.features, "Common_Name", ["Animal_Type_Corrected", "Order_", "Family", "Scientific_Name"], true);
			populateFilterSelect(data, "threatenedCommonSelect", true, "", "", [{ filter: "threatenedScientificSelect", link: "Scientific_Name" },{ filter: "threatenedTypeSelect", link: "Animal_Type_Corrected" },{ filter: "threatenedOrderSelect", link: "Order_" },{ filter: "threatenedFamilySelect", link: "Family" }]);
			dojo.style("threatenedCommonSelectDiv", "display", "none");
			dojo.connect(dijit.byId("threatenedCommonSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("threatenedCommonSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}		
		appLoaded.push("threatenedSppIslandTable");
		checkAppLoaded();
	});
	
	var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
	var query = new esri.tasks.Query();
	query.where = ("1=1");
	query.outFields = invasiveSppIslandFields;
	queryTask.execute(query, function(results) {
		invasiveSppIslandTable = results;
		if (!dijit.byId("invasiveTypeSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "InvasiveTypeCorrected", "#", true);
			
			var items = [];
			dojo.forEach(invasiveTypeSelectOrder, function(item){
				var check = (config_byValues.hasOwnProperty(item)) ? config_byValues[item] : item;
				dojo.some(data.items, function(obj) {
					if (obj.name == check) { items.push(obj); }
				});
			});
			data.items = items;			
			
			populateFilterSelect(data, "invasiveTypeSelect", true, ["invasiveCommonSelect", "invasiveScientificSelect"], "InvasiveTypeCorrected");
			dojo.connect(dijit.byId("invasiveTypeSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("invasiveTypeSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});				
		}
		
		if (!dijit.byId("invasiveScientificSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "Scientific_Name", ["InvasiveTypeCorrected"], true);
			populateFilterSelect(data, "invasiveScientificSelect", false, "", "");
			dojo.connect(dijit.byId("invasiveScientificSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("invasiveScientificSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});				
		}
	
		if (!dijit.byId("invasiveCommonSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "Common_Name", ["InvasiveTypeCorrected"], true);
			populateFilterSelect(data, "invasiveCommonSelect", true, "", "");
			dojo.style("invasiveCommonSelectDiv", "display", "none");
			dojo.connect(dijit.byId("invasiveCommonSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("invasiveCommonSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});				
		}
		
		appLoaded.push("invasiveSppIslandTable");
		checkAppLoaded();
	});		
	
	navigationTool = new esri.toolbars.Navigation(map);
	
	dojo.connect(map, "onExtentChange", function(extent, delta, levelChange, lod){
			navigationTool.deactivate();
			dojo.style("mapDiv_layers", "cursor", "default");	
	});
	
	dojo.connect(map, 'onLoad', function() {
		dojo.connect(dijit.byId('mapDiv'), 'resize', function(){
				map.resize();
				map.reposition();
		});
		dojo.style(dojo.query("a.action.zoomTo")[0], "display", "none");
		
		tooltip = dojo.create("div", { "class": "maptooltip", "innerHTML": "" }, map.container);
		dojo.style(tooltip, { "position": "fixed", "display": "none" });

		dojo.connect(islandPointFeatures, "onMouseMove", function(evt) {
			showToolTip(evt);
		});
		
		dojo.connect(islandPointSelectionLayer, "onMouseMove", function(evt) {
			showToolTip(evt);
		});
		
		dojo.connect(islandPointHighlightLayer, "onMouseMove", function(evt) {
			showToolTip(evt);
		});		
		
		//add the overview map
		var overviewMapDijit = new esri.dijit.OverviewMap({
		map: map,
		visible:true,
		expandFactor:200
		},dojo.byId("ovContent"));
		overviewMapDijit.startup();
		
		ovMapLayer.hide();
		
		maxExtent = map.extent;
    });
	
	dojo.connect(islandPointFeatures,"onUpdateEnd", function () { 
			appLoaded.push("islandPointFeatures");
			checkAppLoaded();
	});
	
	dojo.connect(islandPointFeatures,"onMouseOut", function () { 
			if (tooltip) { tooltip.style.display = "none";} 
	});
	
	dojo.connect(islandPointSelectionLayer,"onMouseOut", function () { 
			if (tooltip) { tooltip.style.display = "none";} 
	});
	
	dojo.connect(islandPointHighlightLayer,"onMouseOut", function () { 
			if (tooltip) { tooltip.style.display = "none";} 
	});
	
	dojo.connect(islandPointFeatures, "onClick", function(evt) {
			var geo = evt.graphic;
			showInfoWindow(geo);
			
			var selectedFeatures = islandPointFeatures.getSelectedFeatures();
			var ids = dojo.map(selectedFeatures, function(item) { return item.attributes[islandPointsIslandID][0]; });
			var selected = false;
			dojo.some(ids, function(id){
				if (id == geo.attributes[islandPointsIslandID]) { selected = true; }
			});
			if (selected) {
				setHighlightSymbol(geo);
				if(dataTable) {
					var dp = dataTable.store;
					var id = geo.attributes["OBJECTID"];
					dp.fetchItemByIdentity({
						identity: id,
						onItem : function(item, request) {
							dataTable.selection.clear();
							dataTable.selection.setSelected(dataTable.getItemIndex(item), true);
							dataTable.scrollToRow(dataTable.getItemIndex(item));
						},
						onError : function(item, request) {
							alert("Error selecting the item in the data table");
						}
					});
				}	
			}
	});	

	dojo.connect(islandPointSelectionLayer, "onClick", function(evt) {
			var geo = evt.graphic;
			setHighlightSymbol(geo);
			showInfoWindow(geo);		
			if(dataTable) {
				var dp = dataTable.store;
				var id = geo.attributes["OBJECTID"];
				dp.fetchItemByIdentity({
					identity: id,
					onItem : function(item, request) {
						dataTable.selection.clear();
						dataTable.selection.setSelected(dataTable.getItemIndex(item), true);
						dataTable.scrollToRow(dataTable.getItemIndex(item));
					},
					onError : function(item, request) {
						alert("Error selecting the item in the data table");
					}
				});
			}
	});

	dojo.connect(islandPointHighlightLayer, "onClick", function(evt) {
			var geo = evt.graphic;
			setHighlightSymbol(geo);
			showInfoWindow(geo);		
			if(dataTable) {
				var dp = dataTable.store;
				var id = geo.attributes["OBJECTID"];
				dp.fetchItemByIdentity({
					identity: id,
					onItem : function(item, request) {
						dataTable.selection.clear();
						dataTable.selection.setSelected(dataTable.getItemIndex(item), true);
						dataTable.scrollToRow(dataTable.getItemIndex(item));
					},
					onError : function(item, request) {
						alert("Error selecting the item in the data table");
					}
				});
			}
	});		
	
	dojo.connect(map, "onUpdateEnd", function(){
			if (dojo.indexOf(appLoaded, "map") === -1 ) { 
				appLoaded.push("map");
			} else {
				dojo.style("progressBarDiv", { "display":"none" });
				if (pdfDownloadUrl != "") { resetMapExport();}
			}
			checkAppLoaded();
	});
	
	dojo.connect(dojo.byId("zoomInToolDiv"), "onclick", function() {
		navigationTool.activate(esri.toolbars.Navigation.ZOOM_IN);
		dojo.style("mapDiv_layers", "cursor", "crosshair");
	});
	
	dojo.connect(dojo.byId("zoomInIncrementDiv"), "onclick", function() {
		map.setLevel(map.getLevel() + 1);
	});

	dojo.connect(dojo.byId("zoomOutIncrementDiv"), "onclick", function() {
		map.setLevel(map.getLevel() - 1);
	});	

	dojo.connect(dojo.byId("zoomFullToolDiv"), "onclick", function() {
		map.setExtent(maxExtent);
	});
	
	dojo.connect(dojo.byId("printSelector"), "onclick", function() {
		var display = dojo.style("printSelectorOptionsDiv","display");
		if (display=="none") {
			dojo.fx.wipeIn({
				node: "printSelectorOptionsDiv",
				duration: 300
			}).play();
		} else {
			dojo.fx.wipeOut({
				node: "printSelectorOptionsDiv",
				duration: 300
			}).play();	
		}
		toggleToolState(this.id);

		if (dojo.style("csvSelectorOptionsDiv","display") == "block") {
			dojo.fx.wipeOut({
				node: "csvSelectorOptionsDiv",
				duration: 300
			}).play();
		}

		if (dojo.style("baseMapSelectorOptions","display") == "block") {
			dojo.fx.wipeOut({
				node: "baseMapSelectorOptions",
				duration: 300
			}).play();
		}		
	});

	dijit.byId("printButton").set('disabled', true);
	dijit.byId("printContinueButton").set('disabled', true);
	dojo.connect(dojo.byId("printButton"), "onclick", function() {
		dojo.style('csvTermsDiv', 'display', 'none');
		if (printTerms) {
			printButtonClick();
		} else {
			dojo.style('printTermsDiv', 'display', 'block');
			dijit.byId('termsOfUse').show();
		}
	});
	
	dijit.byId("csvButton").set('disabled', true);
	dijit.byId("csvContinueButton").set('disabled', true);
	dojo.connect(dojo.byId("csvButton"), "onclick", function() {		
		dojo.style('printTermsDiv', 'display', 'none');
		if (csvTerms) {
			csvButtonClick();
		} else {
			dojo.style('csvTermsDiv', 'display', 'block');
			dijit.byId('termsOfUse').show();
		}
	});

	dojo.connect(dojo.byId("csvSelector"), "onclick", function() {
		var display = dojo.style("csvSelectorOptionsDiv","display");
		if (display=="none") {
			dojo.fx.wipeIn({
				node: "csvSelectorOptionsDiv",
				duration: 300
			}).play();
		} else {
			dojo.fx.wipeOut({
				node: "csvSelectorOptionsDiv",
				duration: 300
			}).play();	
		}
		toggleToolState(this.id);
		
		if (dojo.style("printSelectorOptionsDiv","display") == "block") {
			dojo.fx.wipeOut({
				node: "printSelectorOptionsDiv",
				duration: 300
			}).play();
		}

		if (dojo.style("baseMapSelectorOptions","display") == "block") {
			dojo.fx.wipeOut({
				node: "baseMapSelectorOptions",
				duration: 300
			}).play();
		}
	});	
	
	dojo.connect(dojo.byId("baseMapSelector"), "onclick", function() {
		var display = dojo.style("baseMapSelectorOptions","display");
		if (display=="none") {
			dojo.fx.wipeIn({
				node: "baseMapSelectorOptions",
				duration: 300
			}).play();
		} else {
			dojo.fx.wipeOut({
				node: "baseMapSelectorOptions",
				duration: 300
			}).play();	
		}
		toggleToolState(this.id);
		
		if (dojo.style("printSelectorOptionsDiv","display") == "block") {
			dojo.fx.wipeOut({
				node: "printSelectorOptionsDiv",
				duration: 300
			}).play();
		}

		if (dojo.style("csvSelectorOptionsDiv","display") == "block") {
			dojo.fx.wipeOut({
				node: "csvSelectorOptionsDiv",
				duration: 300
			}).play();
		}
	});	
	
	dojo.connect(dojo.byId("searchButton"), "onclick", function() {
		getSearchQueryData();
	});	
	
	dojo.connect(dojo.byId("clearButton"), "onclick", function() {
		clearSearchQueryData();
	});		
	
	dojo.connect(dijit.byId("inv_sci"), "onChange", function(isChecked) {
		if(isChecked){
			dojo.style("invasiveCommonSelectDiv", "display", "none");
			dojo.style("invasiveScientificSelectDiv", "display", "block");
			dijit.byId("invasiveCommonSelect").set('value', filterSelectAll);
		}			
	});

	dojo.connect(dijit.byId("inv_com"), "onChange", function(isChecked) {
		if(isChecked){
			dojo.style("invasiveCommonSelectDiv", "display", "block");
			dojo.style("invasiveScientificSelectDiv", "display", "none");
			dijit.byId("invasiveScientificSelect").set('value', filterSelectAll);
		}
	});	
	
	dojo.connect(dijit.byId("thr_sci"), "onChange", function(isChecked) {
		if(isChecked){
			dojo.style("threatenedCommonSelectDiv", "display", "none");
			dojo.style("threatenedScientificSelectDiv", "display", "block");
			dijit.byId("threatenedCommonSelect").set('value', filterSelectAll);
		}
	});

	dojo.connect(dijit.byId("thr_com"), "onChange", function(isChecked) {
		if(isChecked){
			dojo.style("threatenedCommonSelectDiv", "display", "block");
			dojo.style("threatenedScientificSelectDiv", "display", "none");
			dijit.byId("threatenedScientificSelect").set('value', filterSelectAll);
		}
	});
	
	dojo.connect(dijit.byId("searchContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;

		if (state == true) {		
			if ( (dijit.byId("geography").open == false) && (dijit.byId("threatened").open == false) && (dijit.byId("invasive").open == false) ) {
				dojox.fx.wipeTo({ node: this.id, duration: 150, width: 330 }).play();
				dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
			} else {
				dojox.fx.wipeTo({ node: this.id, duration: 150, width: 350 }).play();
				dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();			
			}
			setTimeout(function() { checkResultsTableOverlap("resultsContentDiv"); }, this.duration);
		} else {
			var width = dojo.getMarginBox(dojo.query("#searchContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: width }).play();
		}		  
	}); 
	
	dojo.connect(dijit.byId("resultsContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		//var results_text_translate = (config_byValues.hasOwnProperty('Results')) ? config_byValues['Results'] : "Results";
		if (state == true) {
			dijit.byId("resultsContentDiv").set("title", config_byDijitId["resultsContentDiv"]);
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 330 }).play();
			setTimeout(function() { checkResultsTableOverlap(this.id); },  this.duration);
		} else {
			if (islandPointFeatures.getSelectedFeatures().length > 0) {
				var islands_text_translate = (config_byValues.hasOwnProperty('islands')) ? config_byValues['islands'] : "islands";
				var text = config_byDijitId["resultsContentDiv"] + ": " + islandPointFeatures.getSelectedFeatures().length + " " + islands_text_translate;
				dijit.byId("resultsContentDiv").set("title", text);
			}
			var width = dojo.getMarginBox(dojo.query("#resultsContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: width }).play();	
			if (dijit.byId("r_threatened_on_islands").open == true) { dijit.byId("r_threatened_on_islands").toggle(); };
			if (dijit.byId("r_invasives_on_islands").open == true) { dijit.byId("r_invasives_on_islands").toggle(); };			
		}
	});
	
	dojo.connect(dijit.byId("islandContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		var selectedTab = dijit.byId("infoTabs").selectedChildWidget.title;
		
		var islandWidth = (state == true) ? 255 : dojo.getMarginBox(dojo.query("#islandContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
		islandWidth = ((selectedTab == "Threatened") && (state == true)) ? 330 : islandWidth;
		
		var ovWidth = dojo.marginBox("ovContentDiv").w;
		var rightWidth = (ovWidth >= islandWidth) ? ovWidth : islandWidth;

		dojo.fx.combine([
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: islandWidth }),
			dojox.fx.wipeTo({ node: "rightDiv", duration: 150, width: rightWidth }),
			dojo.fx.slideTo({ node: this.id, duration: 150, top: 0, left: (rightWidth - islandWidth).toString(), unit: "px"  }),
			dojo.fx.slideTo({ node: "ovContentDiv", duration: 150, top: 0, left: (rightWidth - ovWidth).toString(), unit: "px" })
		]).play();
		
		setTimeout(function() { checkResultsTableOverlap(this.id); },  this.duration);
	});
	
	dojo.connect(dijit.byId("ovContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		var width = dojo.getMarginBox(dojo.query("#ovContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
		var ovWidth = (state == true) ? 255 : width;
		var islandWidth = dojo.marginBox("islandContentDiv").w;
		var rightWidth = (ovWidth >= islandWidth) ? ovWidth : islandWidth;

		dojo.fx.combine([
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: ovWidth }),
			dojox.fx.wipeTo({ node: "rightDiv", duration: 150, width: rightWidth }),
			dojo.fx.slideTo({ node: "ovContentDiv", duration: 150, top:0, left: (rightWidth - ovWidth).toString(), unit: "px", onEnd: function(node) { dojo.fx.slideTo({ node: node, duration: 150, top:0, left: (rightWidth - ovWidth).toString(), unit: "px" }).play(); } }),
			dojo.fx.slideTo({ node: "islandContentDiv", duration: 150, top: 0, left: (rightWidth - islandWidth).toString(), unit: "px" })
		]).play();
		
		setTimeout(function() { checkResultsTableOverlap("islandContentDiv"); },  this.duration);
	});
	
	dojo.connect(dijit.byId("infoTabs"), "selectChild", function() {
		var selectedTab = this.selectedChildWidget.title;
		var islandWidth = (selectedTab == "Threatened") ? 330 : 255;
		var ovWidth = dojo.marginBox("ovContentDiv").w;
		var rightWidth = (ovWidth >= islandWidth) ? ovWidth : islandWidth;
		
		dojo.fx.combine([
			dojox.fx.wipeTo({ node:"islandContentDiv", duration: 150, width: islandWidth }),
			dojox.fx.wipeTo({ node:"islandContent", duration: 150, width: (islandWidth - 20) }),
			dojox.fx.wipeTo({ node: "rightDiv", duration: 150, width: rightWidth }),
			dojo.fx.slideTo({ node: "islandContentDiv", duration: 150, top: 0, left: (rightWidth - islandWidth).toString(), unit: "px"  }),
			dojo.fx.slideTo({ node: "ovContentDiv", duration: 150, top: 0, left: (rightWidth - ovWidth).toString(), unit: "px" })
		]).play();	
	
		dojo.style("islandContent", "overflow","");
		this.resize({w: (islandWidth - 20) });

	});	

	dojo.connect(dijit.byId("geography"), "toggle", function () {
		var state = this.open;
		if ( (state == false) && (dijit.byId("threatened").open == false) && (dijit.byId("invasive").open == false) ) {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 330 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
		} else {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 350 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();			
		}

		if (dijit.byId("resultsContentDiv").open == true) { dijit.byId("resultsContentDiv").toggle(); };
	});
	
	dojo.connect(dijit.byId("geography"), "onShow", function () {	
		if (dijit.byId("threatened").open == true) { dijit.byId("threatened").toggle(); };
		if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); };
	});		
	
	dojo.connect(dijit.byId("threatened"), "toggle", function () {
		var state = this.open;
		if ( (state == false) && (dijit.byId("geography").open == false) && (dijit.byId("invasive").open == false) ) {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 330 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
		} else {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 350 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();		
		}

		if (dijit.byId("resultsContentDiv").open == true) { dijit.byId("resultsContentDiv").toggle(); };
	});
	
	dojo.connect(dijit.byId("threatened"), "onShow", function () {	
		if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); };
		if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); };
	});	

	dojo.connect(dijit.byId("invasive"), "toggle", function () {
		var state = this.open;
		if ( (state == false) && (dijit.byId("geography").open == false) && (dijit.byId("threatened").open == false) ) {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 330 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
		} else {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 350 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();		
		}
		
		if (dijit.byId("resultsContentDiv").open == true) { dijit.byId("resultsContentDiv").toggle(); };
	});
	
	dojo.connect(dijit.byId("invasive"), "onShow", function () {
		if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); };
		if (dijit.byId("threatened").open == true) { dijit.byId("threatened").toggle(); };
	});		
	
	dojo.connect(dijit.byId("r_threatened_on_islands"), "toggle", function () {
		dojo.style("r_threats_spp_type", "display", "none");
		dojo.style("r_breeding_type", "display", "none");
		setTimeout(function() { checkResultsTableOverlap("resultsContentDiv"); }, this.duration);	
	});
	
	dojo.connect(dijit.byId("r_threatened_on_islands"), "onShow", function () {
		if (dijit.byId("r_invasives_on_islands").open == true) { dijit.byId("r_invasives_on_islands").toggle(); };
	});
	
	dojo.connect(dijit.byId("r_invasives_on_islands"), "toggle", function () {
		dojo.style("r_invasives_spp_type", "display", "none");
		dojo.style("r_invasives_status_type", "display", "none");
		setTimeout(function() { checkResultsTableOverlap("resultsContentDiv"); }, this.duration);	
	});	
	
	dojo.connect(dijit.byId("r_invasives_on_islands"), "onShow", function () {
		if (dijit.byId("r_threatened_on_islands").open == true) { dijit.byId("r_threatened_on_islands").toggle(); };
	});	

	dojo.style("searchContentDiv", "display", "block");
	dojo.style("resultsContentDiv", "display", "block");
	dojo.style("islandContentDiv", "display", "block");
	dojo.style("ovContentDiv", "display", "block");
	dojo.style("zoomToolsDiv", "display", "block");
	dojo.style("baseMapOptionDiv", "display", "block");
	createToolbar(map);
	
	new dijit.Tooltip({ id:"csvTool_tooltip", connectId: "csvSelector", label:(config_byDijitId.hasOwnProperty('csvTool_tooltip')) ? config_byDijitId['csvTool_tooltip'] : "Click to export and download a .csv file of the results table.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"printTool_tooltip", connectId: "printSelector", label:(config_byDijitId.hasOwnProperty('printTool_tooltip')) ? config_byDijitId['printTool_tooltip'] : "Click to export and download a high-resolution PDF.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"basemap_tooltip", connectId: "baseMapSelector", label:(config_byDijitId.hasOwnProperty('basemap_tooltip')) ? config_byDijitId['basemap_tooltip'] : "Click to change the underlying basemap.",  position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"zoomfull_tooltip", connectId: "zoomFullToolDiv", label:(config_byDijitId.hasOwnProperty('zoomfull_tooltip')) ? config_byDijitId['zoomfull_tooltip'] : "Click to zoom out to the full extent of the map.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"zoomin_tooltip", connectId: "zoomInToolDiv", label:(config_byDijitId.hasOwnProperty('zoomin_tooltip')) ? config_byDijitId['zoomin_tooltip'] : "Click to zoom in to the map using a custom drawn extent.", position: ["below", "above", "before", "after"], showDelay:50 });
	
	new dijit.Tooltip({ id:"splitter_tooltip", connectId: dojo.query(".dijitSplitterThumb")[0], label:(config_byDijitId.hasOwnProperty('splitter_tooltip')) ? config_byDijitId['splitter_tooltip'] : "Click and drag to increase or decrease the viewable table.", showDelay:50 });
	new dijit.Tooltip({ id:"close_tooltip", connectId: "tableClose", label:(config_byDijitId.hasOwnProperty('close_tooltip')) ? config_byDijitId['close_tooltip'] : "Click to hide or show the table.", showDelay:50 });
	new dijit.Tooltip({ id:"search_tooltip", connectId: dijit.byId("searchContentDiv").titleBarNode, label: (config_byDijitId.hasOwnProperty('search_tooltip')) ? config_byDijitId['search_tooltip'] : "Build a custom search.", showDelay:50 });
	new dijit.Tooltip({ id:"results_tooltip", connectId: dijit.byId("resultsContentDiv").titleBarNode, label:(config_byDijitId.hasOwnProperty('results_tooltip')) ? config_byDijitId['results_tooltip'] : "Results from your custom search.", showDelay:50 });
	new dijit.Tooltip({ id:"island_tooltip", connectId: dijit.byId("islandContentDiv").titleBarNode, label:(config_byDijitId.hasOwnProperty('island_tooltip')) ? config_byDijitId['island_tooltip'] : "Detailed information on a specific island.", showDelay:50 });
	new dijit.Tooltip({ id:"r_breeding_tooltip", connectId: "r_breeding", label:(config_byDijitId.hasOwnProperty('r_breeding_tooltip')) ? config_byDijitId['r_breeding_tooltip'] : "Shift + Click for complete definitions of Breeding Status.", showDelay:50 });
	new dijit.Tooltip({ id:"experts_tooltip", connectId: "experts", label:(config_byDijitId.hasOwnProperty('experts_tooltip')) ? config_byDijitId['experts_tooltip'] : "Click for a list of contributing experts and the TIB data collection team.", showDelay:50 });
	new dijit.Tooltip({ id:"donate_tooltip", connectId: "donateDiv", label:(config_byDijitId.hasOwnProperty('donate_tooltip')) ? config_byDijitId['donate_tooltip'] : "Click to donate towards TIB development via the Island Conservation Paypal site.", showDelay:10, position:['above'] });
	new dijit.Tooltip({ id:"app_language_english_tooltip", connectId: "en_language_app", label:(config_byDijitId.hasOwnProperty('app_language_english_tooltip')) ? config_byDijitId['app_language_english_tooltip'] : "English", position: ["below", "above", "before", "after"], showDelay:10 });
	new dijit.Tooltip({ id:"app_language_spanish_tooltip", connectId: "es_language_app", label:(config_byDijitId.hasOwnProperty('app_language_spanish_tooltip')) ? config_byDijitId['app_language_spanish_tooltip'] : "Spanish", position: ["below", "above", "before", "after"], showDelay:10 });
	
	dojo.style('ovContentDiv', {"boxShadow":"2px 2px 6px #6a6a6a", "MozBoxShadow":"2px 2px 6px #6a6a6a", "WebkitBoxShadow":"2px 2px 6px #6a6a6a"});
	//hack to set css width not honored in style sheet
	dojo.style('rectangle', 'width', '78px');
	
}

function toggleLanguage(id) {
	dojo.query(".language_circle").style({ "background":"#1c1c1c", "color":"#666" });
	dojo.query('div[id^="' + id +'"]').style( { "background":"#3c3c3c", "color":"#fff" } );
}

function checkAppLoaded() {
	if (appLoaded.length == allLayersLoaded) {
		dojo.style("progressBarDiv", { "display":"none" });
		if (urlQueryParams.name) {
			queryMapfromUrlParams(urlQueryParams)
		}
	}
}

function printButtonClick() {
	var printButtonLabel = dijit.byId("printButton").get('label');
	printButtonLabel = (config_byValues.hasOwnProperty(printButtonLabel)) ? config_byValues[printButtonLabel] : printButtonLabel;
	var exportText = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : "Export";
	if ((printButtonLabel == exportText) && (dijit.byId("printButton").get('disabled') == false))  {
		var text = (config_byValues.hasOwnProperty('Exporting Map')) ? config_byValues['Exporting Map'] : "Exporting Map";
		dojo.byId("printOptionsTextNode").innerHTML =  text + '...';
		
		var label = (config_byValues.hasOwnProperty('Processing')) ? config_byValues['Processing'] : "Processing";
		dijit.byId("printButton").set('label', label + '...');
		dijit.byId("printButton").set('disabled', true);
		dojo.byId("printButton").innerHTML = label + '...';
		
		printMap();
	}
	var downloadText = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : "Download";
	if ( (printButtonLabel == downloadText) && (dijit.byId("printButton").get('disabled') == false) ){
		window.open(pdfDownloadUrl,'_blank','left=10000,screenX=10000');
		dojo.fx.wipeOut({ 
			node: "printSelectorOptionsDiv",
			duration:300
		}).play();
		toggleToolState("printToolDiv");				
	}
}

function csvButtonClick() {
	var tableButtonLabel = dijit.byId("csvButton").get('label');
	tableButtonLabel = (config_byValues.hasOwnProperty(tableButtonLabel)) ? config_byValues[tableButtonLabel] : tableButtonLabel;
	var exportText = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : "Export";
	if ((tableButtonLabel == exportText) && (dijit.byId("csvButton").get('disabled') == false)) {
		var text = (config_byValues.hasOwnProperty('Exporting to CSV')) ? config_byValues['Exporting to CSV'] : "Exporting to CSV";
		dojo.byId("csvOptionsTextNode").innerHTML = text + '...';
		
		var label = (config_byValues.hasOwnProperty('Processing')) ? config_byValues['Processing'] : "Processing";
		dijit.byId("csvButton").set('label', label + '...');
		dijit.byId("csvButton").set('disabled', true);
		dojo.byId("csvButton").innerHTML = label + '...';
		
		if (dijit.byId("islandsDivGrid") != undefined) {
			csvProgress();			
			exportToCsv();
		}	
	}
	
	var downloadText = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : "Download";
	if ((tableButtonLabel == downloadText) && (dijit.byId("csvButton").get('disabled') == false)){
		window.open(tableDownloadUrl);
		dojo.fx.wipeOut({ 
			node: "csvSelectorOptionsDiv",
			duration:300,
			onEnd: function(){
			}
		}).play();
		toggleToolState("exportTableToolDiv");				
	}
}

function queryMapfromUrlParams(urlQueryParams){
	dijit.byId("islandSelect").set('value', urlQueryParams.name);
	delete urlQueryParams.name;
	getSearchQueryData();
}

function filterSelectData(features, nameField, linkFields, unique) {

	var names = dojo.map(features, function(feature) {
			var name = feature.attributes[nameField];
			
			var links = [name];
			if (linkFields != "#") {
				dojo.forEach(linkFields, function(link) {
					links.push(feature.attributes[link]);
				});
			} else {
				links.push(name);
			}
			
			if (name != "null") { 
				return links;
			}
	});
	
	var n = [];
	if (unique) {
		n = getUniqueValuesMultiple(names);
	} else {
		n = names
	}
	
	if (nameField == 'Animal_Type_Corrected') {
		n.push(['Bird - All', 'bird'])
	}
	
	n.sort(function (a,b) {
		// this sorts the multidimensional array using the first element    
		return ((a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0));
	});
		
	var data = [];
	dojo.forEach(n, function(item) {
		if ((item[0] != "AR") || (item[0] != "EX")) {
			var obj = { "name": ((config_byValues.hasOwnProperty(item[0])) ? config_byValues[item[0]] : item[0]), "id": item[0] };
			dojo.forEach(linkFields, function(link, i) {
				obj[link] = item[1+i];
			});
			data.push(obj);
		}
	});
	
	var obj = { "name": ((config_byValues.hasOwnProperty(filterSelectAll)) ? config_byValues[filterSelectAll] : filterSelectAll), "id": filterSelectAll };
	dojo.forEach(linkFields, function(link, i) {
		obj[link] = filterSelectAll;
	});
	data.splice(0,0, obj);
	
	return { label:"name", identifier:"id", items: data };

}

function populateFilterSelect(data, domNode, onChange, changeNodes, property, updateNodes) {

	var store = new dojo.data.ItemFileReadStore({ data: data });
	
	if (onChange) {
		new dijit.form.FilteringSelect({
			store: store,
			autoComplete: true,
			required: false,
			searchAttr: "name",
			value: filterSelectAll,
			maxHeight: 100,
			style: "width: 305px;",
			onChange: function(name) {
					var item = this.item;
					dojo.forEach(updateNodes, function (u) {
						var v = item[u.link];
						if (v!= filterSelectAll) {
							dijit.byId(u.filter).set('value', v );
						}
					});

					dojo.forEach(changeNodes, function (d) {
						var query = {};
						var field = (item['#']) ? '#' : 'id';
						query[property] = (name == filterSelectAll) ? "*" : new RegExp("(" + item[field][0] + "|" + filterSelectAll + ")");
						dijit.byId(d).query = query;
						dijit.byId(d).store.fetch( { query: query, onComplete: function(items, request) {
							var y = dijit.byId(d).get('value');
							var names = dojo.map(items, function(item){ return item.name;  })
							if (dojo.indexOf(names,y) == -1) { dijit.byId(d).set('value', filterSelectAll); }
						}
						} );
						
					});
			}
		}, domNode);
	} else {
		new dijit.form.FilteringSelect({
			store: store,
			autoComplete: true,
			required: false,
			searchAttr: "name",
			value: filterSelectAll,
			maxHeight: 100,
			style: "width: 305px;"
		}, domNode);	
	}
}

function showToolTip(evt) {
	var px, py;        
	if (evt.clientX || evt.pageY) {
	  px = evt.clientX;
	  py = evt.clientY;
	} else {
	  px = evt.clientX + dojo.body().scrollLeft - dojo.body().clientLeft;
	  py = evt.clientY + dojo.body().scrollTop - dojo.body().clientTop;
	}
	
	content = evt.graphic.attributes[islandPointsName];;
	tooltip.innerHTML = content;
	
	tooltip.style.display = "none";
	dojo.style(tooltip, { left: (px + 15) + "px", top: (py) + "px" });
	tooltip.style.display = "";
}

function showInfoWindow(geo) {
	map.infoWindow.hide();
	var title = (geo.attributes[islandPointsName] == null) ? 'Island Details' : geo.attributes[islandPointsName];;
	dojo.style("islandTitle", "display", "none");
	dijit.byId("islandContentDiv").set("title", title);
	if (dijit.byId("islandContentDiv").open == false) { dijit.byId("islandContentDiv").toggle(); }
	
	var name = (geo.attributes[islandPointsName] == null) ? '' : geo.attributes[islandPointsName];
	var r = geo.attributes["Region_ID_Name"];
	var a = geo.attributes["Region_Archipelago"];
	var c = geo.attributes["Country"];
	var er = ((geo.attributes["Eradication_Island"] == 0) || (geo.attributes["Eradication_Island"] == "no")) ? "no" : "yes";
	var h = geo.attributes["Human_Habitation_Category"];
	var lat = geo.attributes["Corrected_Latitude"]
	var lon = geo.attributes["Corrected_Longitude"]
	var attr = { name: name, region: r, archipelago: a, country: c, eradicate: er, human: h, lat: lat, lon: lon } 
	var content = getInfoWindowContent(attr, geo.attributes[islandPointsIslandID]);

}

function getInfoWindowContent(attr, id) {
	dojo.forEach(redListDefs, function(item) {
		if (dijit.byId("i_" + item[0])) { dijit.byId("i_" + item[0]).destroyRecursive(); }	
	});
	
	dojo.forEach(presentBreedingStatusDefs, function(item) {
		if (dijit.byId("i_present_" + item[0])) { dijit.byId("i_present_" + item[0]).destroyRecursive(); }	
	});
	
	dojo.forEach(historicBreedingStatusDefs, function(item) {
		if (dijit.byId("i_historic_" + item[0])) { dijit.byId("i_historic_" + item[0]).destroyRecursive(); }	
	});
	
	if (dijit.byId("i_breeding_tooltip")) { dijit.byId("i_breeding_tooltip").destroyRecursive(); }	
	
	if (dijit.byId("island_threats_tooltip")) { dijit.byId("island_threats_tooltip").destroyRecursive(); }	
	if (dijit.byId("island_invasives_tooltip")) { dijit.byId("island_invasives_tooltip").destroyRecursive(); }	
	if (dijit.byId("island_eradication_tooltip")) { dijit.byId("island_eradication_tooltip").destroyRecursive(); }	
	
	var decimal = 10
	var infoContent = "<div id=\"island_details\">" + ((config_byValues.hasOwnProperty('Name')) ? config_byValues['Name'] : 'Name') + ":<b> " + ((config_byValues.hasOwnProperty(attr.name)) ? config_byValues[attr.name] : attr.name) + "</b><br>" +
	((config_byValues.hasOwnProperty('Coordinates')) ? config_byValues['Coordinates'] : 'Coordinate') + ":<b> " + (Math.round((attr.lat)*decimal)/decimal).toFixed(1) + ", " + (Math.round((attr.lon)*decimal)/decimal).toFixed(1) + "</b><br>" +
	((config_byValues.hasOwnProperty('Region')) ? config_byValues['Region'] : 'Region') + ":<b> " + ((config_byValues.hasOwnProperty(attr.region)) ? config_byValues[attr.region] : attr.region) + "</b><br>" +
	((config_byValues.hasOwnProperty('Country')) ? config_byValues['Country'] : 'Country') + ":<b> " + ((config_byValues.hasOwnProperty(attr.country)) ? config_byValues[attr.country] : attr.country) + "</b><br>" +
	((config_byValues.hasOwnProperty('Archipelago')) ? config_byValues['Archipelago'] : 'Archipelago') + ":<b> " + ((config_byValues.hasOwnProperty(attr.archipelago)) ? config_byValues[attr.archipelago] : attr.archipelago) + "</b><br>";
	
	var t_count = dojo.filter(dojo.map(threatenedSppIslandTable.features, function(feature){ return feature.attributes; }), function(record) { return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX")); }).length;
	
	infoContent += "<span id=\"island_threats\">" + ((config_byValues.hasOwnProperty('Threatened Species')) ? config_byValues['Threatened Species'] : 'Threatened Species') + "</span>: <b>" + t_count + "</b><br>";
	
	var i_count = dojo.filter(dojo.map(invasiveSppIslandTable.features, function(feature){ return feature.attributes; }), function(record) { return ((record[invasiveSppIslandID] == id) && (record["InvasiveTypeCorrected"] != "None")) }).length;

	var eradication = ((config_byValues.hasOwnProperty('Eradication(s)')) ? config_byValues['Eradication(s)'] : 'Eradication(s)');
	infoContent += "<span id=\"island_invasives\">" + ((config_byValues.hasOwnProperty('Invasive Species')) ? config_byValues['Invasive Species'] : 'Invasive Species') + "</span>: <b>" + i_count + "</b><br>";	
	infoContent += (attr.eradicate == "yes") ? "<span id=\"island_eradication\">" + eradication + "</span>: <span id=\"island_eradication_yes\" class=\"eradicationLink\" onmouseover=\"hover(this,'eradicationLinkOver');\" onmouseout=\"hover(this,'eradicationLink');\" onclick=\"getEradicationPage(" + id + ",'" + attr.name + "')\"><b>" + ((config_byValues.hasOwnProperty(attr.eradicate)) ? config_byValues[attr.eradicate] : attr.eradicate) + "</b> (" + ((config_byValues.hasOwnProperty('search in the DIISE')) ? config_byValues['search in the DIISE'] : 'search in the DIISE') + ")</span><br>" : "<span id=\"island_eradication\">" + eradication + "</span>:<b> " + ((config_byValues.hasOwnProperty(attr.eradicate)) ? config_byValues[attr.eradicate] : attr.eradicate) + "</b><br>"
	infoContent += ((config_byValues.hasOwnProperty('Human Population')) ? config_byValues['Human Population'] : 'Human Population') + ":<b> " + ((config_byValues.hasOwnProperty(attr.human)) ? config_byValues[attr.human] : attr.human) + "</b><br>";
	
	infoContent += "</div>"
	
	infoDetails.set("content", infoContent);
	var value = (config_byValues.hasOwnProperty('total_threaten_record_tooltip')) ? config_byValues['total_threaten_record_tooltip'] : "All threatened species on an island"; 
	new dijit.Tooltip({ id:"island_threats_tooltip", connectId: "island_threats", label: value, position: ["before", "after", "below", "above"], showDelay:50 });
	var value = (config_byValues.hasOwnProperty('total_invasive_record_tooltip')) ? config_byValues['total_invasive_record_tooltip'] : "All invasive species on an island"; 
	new dijit.Tooltip({ id:"island_invasives_tooltip", connectId: "island_invasives", label: value, position: ["before", "after", "below", "above"], showDelay:50 });
	var value = (config_byValues.hasOwnProperty('eradication_record_tooltip')) ? config_byValues['eradication_record_tooltip'] : "Any eradication effort on an island from the Database of Island Invasive Species Eradications (DIISE)."; 
	new dijit.Tooltip({ id:"island_eradication_tooltip", connectId:"island_eradication", label: value, position: ["before", "after", "below", "above"], showDelay:50 });	
	
	infoThreatened.set("content", getThreatendSppInfoData(id));
	infoInvasive.set("content", getInvasiveSppInfoData(id));
	
	getThreatenedSppImages(id);
	dijit.byId("infoTabs").domNode.style.display = "block";
	dijit.byId("infoTabs").resize();	
	dijit.byId("infoTabs").selectChild(infoDetails);
	
	dojo.forEach(redListDefs, function(item) {
		if (dojo.query(".i_red_list." + item[0]).length > 0) {
			var value = (config_byValues.hasOwnProperty(item[1])) ? config_byValues[item[1]] : item[1];
			new dijit.Tooltip({ id:"i_" + item[0], connectId: dojo.query(".i_red_list." + item[0]), label: value, showDelay:50 });
		}	
	});
	
	var clickDefs = (config_byValues.hasOwnProperty("click_for_complete_definitions")) ? config_byValues["click_for_complete_definitions"] : "Click for complete definitions.";
	
	dojo.forEach(presentBreedingStatusDefs, function(item) {
		if (dojo.query(".i_present_breeding." + item[0]).length > 0) {
			var value = (config_byValues.hasOwnProperty(item[1])) ? config_byValues[item[1]] : item[1];
			new dijit.Tooltip({ id:"i_present_" + item[0], connectId: dojo.query(".i_present_breeding." + item[0]), label: value + ". " + clickDefs, showDelay:50 });
		}	
	});
	
	dojo.forEach(historicBreedingStatusDefs, function(item) {
		if (dojo.query(".i_historic_breeding." + item[0]).length > 0) {
			var value = (config_byValues.hasOwnProperty(item[1])) ? config_byValues[item[1]] : item[1];
			new dijit.Tooltip({ id:"i_historic_" + item[0], connectId: dojo.query(".i_historic_breeding." + item[0]), label: value + ". " + clickDefs, showDelay:50 });
		}	
	});
	var value = (config_byValues.hasOwnProperty('breeding_status_tooltip')) ? config_byValues['breeding_status_tooltip'] : "Breeding status of the threatened species on the island."; 
	new dijit.Tooltip({ id:"i_breeding_tooltip", connectId: "i_breeding", label: value, showDelay:50 });
}

function getThreatenedSppImages(id) {
	dojo.style("galleryContentDiv", "display", "block");
	if (dojo.byId("gallery")) { dojo.query(".jcarousel-skin-tango").forEach(dojo.destroy); }
	
	if (threatendSppImages[id] !== undefined) {
			populateThreatenedSppImageGallery(threatendSppImages[id]);
	} else {	
		var data = threatenedSppIslandTable.features;
		var attributes = dojo.map(data, function(feature){ return feature.attributes; });
		var t = dojo.map(dojo.filter(attributes, function(record) { return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX")); }), function(item) {
			return item["Scientific_Name"].replace(/\s*$/, '');
		});
		
		threatendSppImages[id] = [];
		
		if (t.length > 0) {
			var imageRequests = [];
			dojo.forEach(t, function(name) {
				//if (name.split(".").length > 1) { name = name.split(" ")[0] + " " + name.split(" ")[1] }
				if (name.search(" ssp.") > -1) { name = name.substring(0, name.search(" ssp.") ) }	
				var imageRequest = esri.request({
					url : arkiveURL.replace("[SPECIES_NAME]",name),
					handleAs:"json",
					timeout: 10000 },
					{ useProxy: true }
				).then(
					function(response) {		
						return [name, response.results[0]];
					},
					function(error) {
						return [name, "No image found"];
					}
				);
				imageRequests.push(imageRequest);
			});
			var images = new dojo.DeferredList(imageRequests);
			images.then(function(results){		
				
				var arkive = dojo.filter(results, function(data) {
					return data[1][1] != "No image found";
				});
				threatendSppImages[id] = arkive;
				populateThreatenedSppImageGallery(arkive);
			
			});
		} else {
			var div = dojo.create("div", {id: "gallery", innerHTML: "<div id=\"noThumbnails\">" + ((config_byValues.hasOwnProperty('No thumbnail images found')) ? config_byValues['No thumbnail images found'] : 'No thumbnail images found') + "...</div>"}, "galleryContent", "first");
			dojo.attr(div, "class", "jcarousel-skin-tango");
			dojo.style("gallery", { background: "#eeeeee", border:"1px solid #cccccc" })
		}
	}
	
}

function populateThreatenedSppImageGallery(images) {
	if (images.length > 0) {
		var ul = dojo.create("ul", {id: "gallery", className:"jcarousel-skin-tango"}, "galleryContent", "first");
		dojo.forEach(images, function(data){
			//console.log(data[1][1].replace("<a", "<a target=\"_blank\""))
			dojo.create("li", { innerHTML: data[1][1].replace("<a", "<a target=\"_blank\"") }, ul);
		});
		
		jQuery('#gallery').jcarousel({
			buttonNextHTML: "<div></div>",
			buttonPrevHTML: "<div></div>",
			wrap: 'circular',
			easing: 'easeout',
			animation:"slow",
			scroll: 1
		});
		
		if (images.length < 3) {
			dojo.query(".jcarousel-next-horizontal")[0].style.visibility = "hidden";
			dojo.query(".jcarousel-prev-horizontal")[0].style.visibility = "hidden";
		}
	} else {
		var div = dojo.create("div", {id: "gallery", className:"jcarousel-skin-tango", innerHTML: "<div id=\"noThumbnails\">" + ((config_byValues.hasOwnProperty('No thumbnail images found')) ? config_byValues['No thumbnail images found'] : 'No thumbnail images found') + "...</div>"}, "galleryContent", "first");
		dojo.style("gallery", { background: "#eeeeee", border:"1px solid #cccccc" })
	}
}

function getThreatendSppInfoData(id){
	var data = threatenedSppIslandTable.features;
	var attributes = dojo.map(data, function(feature){ return feature.attributes; });
	var ex = dojo.filter(attributes, function(record) {
		return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX"));
	});
	ex.sort(function (a,b) { 
			return ((a["Scientific_Name"] < b["Scientific_Name"]) ? -1 : ((a["Scientific_Name"] > b["Scientific_Name"]) ? 1 : 0));
	});
	var exTypes = getUniqueValues(dojo.map(ex, function(record) { return record["Animal_Type"]; })).sort();
	
	var t = dojo.filter(attributes, function(record) {
		return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX"));
	});
	t.sort(function (a,b) { 
			return ((a["Scientific_Name"] < b["Scientific_Name"]) ? -1 : ((a["Scientific_Name"] > b["Scientific_Name"]) ? 1 : 0));
	});
	var types = getUniqueValues(dojo.map(t, function(record) { return record["Animal_Type"]; })).sort();
	
	var content = '';
	content += '<div id="island_threat_types">'	
	dojo.forEach(types, function(type) {
		var s = dojo.filter(t, function(record) {
			return record["Animal_Type"] == type;
		});
		
		var display_value = (config_byValues.hasOwnProperty(type)) ? config_byValues[type] : type;
		var sci_name = (config_byValues.hasOwnProperty('Scientific Name')) ? config_byValues['Scientific Name'] : 'Scientific Name';
		var com_name = (config_byValues.hasOwnProperty('Common Name')) ? config_byValues['Common Name'] : 'Common Name';
		var pre_breed = (config_byValues.hasOwnProperty('Present Breeding')) ? config_byValues['Present Breeding'] : 'Present Breeding';
		var his_breed = (config_byValues.hasOwnProperty('Historic Breeding')) ? config_byValues['Historic Breeding'] : 'Historic Breeding';
		var status_name = (config_byValues.hasOwnProperty('IUCN Status')) ? config_byValues['IUCN Status'] : 'IUCN Status';
		
		var linkFunction = ((type == "Landbird") || (type == "Seabird")) ? "getBirdLifePage" : "getRedListPage";
		
		content += '<div class="islandSummaryItem" id="island_threat_'+ type +'" onclick="toggleSubItem(this.id)"><span class="toggleImages" id="island_threat_'+ type +'_toggle"><img src="images\\plus.png"></span>&nbsp;' + display_value + ': ' + s.length + ' ' + ((config_byValues.hasOwnProperty('species')) ? config_byValues['species'] : 'species') + '</div>';
		
		content += '<div class="summarySubItem" id="island_threat_'+ type +'_type">';
		content += '<table class="summarySubItemTable" id="island_threat_'+ type +'_type_table">';
		content += '<tr class="i_header">' +
		'<td id="i_red_list" class="i_red_list" style="width:10%;">' + status_name + '</td>' +
		'<td style="width:52%;text-align:center;"><span class="i_scientific_name">' + sci_name + '</span><br><span class="i_common_name">(' + com_name + ')</span></td>' +
		'<td id="i_breeding" style="width:38%;text-align:center;" onclick="definitions.show();"><span class="i_present_breeding">' + pre_breed + '</span><br><span class="i_historic_breeding">(' + his_breed + ')</span></td>' +
		'</tr>';
		
		dojo.forEach(s, function(item, i){
			var scientific_name = item["Scientific_Name"];
			var species_id = String(item["Threatened_Species_ID_Corrected"]);
			var common_name = (item["Common_Name"] != null) ? item["Common_Name"] : 'no common name';
			common_name = (config_byValues.hasOwnProperty(common_name)) ? config_byValues[common_name] : common_name;
			var red_list = item["Red_List_Status"].toLowerCase();
			var present_breeding = item["Present_Breeding_Status"].replace(" Breeding", "");
			var present_breeding_display = (config_byValues.hasOwnProperty(present_breeding)) ? config_byValues[present_breeding] : present_breeding;
			var historic_breeding = item["Historic_Breeding_Status"].replace(" Breeding", "").replace("EX - ","");
			var historic_breeding_display = (config_byValues.hasOwnProperty(historic_breeding)) ? config_byValues[historic_breeding] : historic_breeding;
			
			var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
			
			var link = (linkFunction == "getBirdLifePage") ? species_id.substring(species_id.length, species_id.length - 5) : scientific_name;
			
			content += "<tr class=\"" + styleClass + "\" onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\">" +
			"<td id=\"i_red_list_" + i + "\" class=\"i_red_list " + red_list + " \"><img src=\"images\\iucn\\iucn_" + red_list + ".png\" ></td>" +
			"<td style=\"text-align:center;\" onclick=\"" + linkFunction + "('" + link + "')\" ><span class=\"i_scientific_name\">" + scientific_name + "</span><br><span class=\"i_common_name\">(" + common_name + ")</span></td>" +
			"<td style=\"text-align:center;\" onclick=\"definitions.show()\"><span class=\"i_present_breeding " + present_breeding.replace(" ","_").toLowerCase() + "\">" + present_breeding_display + "</span><br><span class=\"i_historic_breeding " + historic_breeding.replace(" ","_").toLowerCase() + "\">(" + historic_breeding_display + ")</span></td>" +
			"</tr>";
		});
		content += '</table>';
		content += '</div>';
	});
	content += '</div>';
	return content;
}

function getInvasiveSppInfoData(id){
	var data = invasiveSppIslandTable.features;
	var attributes = dojo.map(data , function(feature){ return feature.attributes; });
	var t = dojo.filter(attributes, function(record) {
		return record[invasiveSppIslandID] == id;
	});
	
	var content = "<div id=\"island_invasive_types\">";
	t.sort(function (a,b) { 
			return ((a["Scientific_Name"] < b["Scientific_Name"]) ? -1 : ((a["Scientific_Name"] > b["Scientific_Name"]) ? 1 : 0));
	});
	
	var types = getUniqueValues(dojo.map(t, function(record) { return record["InvasiveTypeCorrected"]; })).sort();
	dojo.forEach(types, function(type) {
		if (type != "None") {
			s = dojo.filter(t, function(record) {
				return record["InvasiveTypeCorrected"] == type;
			});
			
			var display_value = (config_byValues.hasOwnProperty(type)) ? config_byValues[type] : type;
			var scientific_name = (config_byValues.hasOwnProperty('Scientific Name')) ? config_byValues['Scientific Name'] : 'Scientific Name';
			var common_name = (config_byValues.hasOwnProperty('Common Name')) ? config_byValues['Common Name'] : 'Common Name';
			var status_name = (config_byValues.hasOwnProperty('Status')) ? config_byValues['Status'] : 'Status';
			
			content += '<div class="islandSummaryItem" id="island_invasive_'+ type +'" onclick="toggleSubItem(this.id)"><span class="toggleImages" id="island_invasive_'+ type +'_toggle"><img src="images\\plus.png"></span>&nbsp;' + display_value + ': ' + s.length + ' ' + ((config_byValues.hasOwnProperty('species')) ? config_byValues['species'] : 'species') + '</div>';
			
			content += '<div class="summarySubItem" id="island_invasive_'+ type +'_type">';
			content += '<table class="summarySubItemTable" id="island_invasive_'+ type +'_type_table">';
			content += '<tr class="i_header">' +
			'<td style="width:60%;text-align:center;"><span class="i_scientific_name">' + scientific_name + '</span><br><span class="i_common_name">(' + common_name + ')</span></td>' +
			'<td class=\"i_status\" style="width:40%;text-align:center;">' + status_name + '</td>' +
			'</tr>';
			
			dojo.forEach(s, function(item, i){
				var scientific_name_value = item["Scientific_Name"];
				var common_name_value = (item["Common_Name"] != null) ? item["Common_Name"] : 'no common name';
				common_name_value = (config_byValues.hasOwnProperty(common_name_value)) ? config_byValues[common_name_value] : common_name_value;
				var status_value = (config_byValues.hasOwnProperty(item["Invasive_Status"])) ? config_byValues[item["Invasive_Status"]] : item["Invasive_Status"];
				var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";

				content += "<tr class=\"" + styleClass + "\" onclick=\"getInvasiveListPage('" + scientific_name_value + "')\" onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\" >" +
				"<td style=\"text-align:center;\"><span class=\"i_scientific_name\">" + scientific_name_value + "</span><br>" +
				"<span class=\"i_common_name\">" + common_name_value + "</span></td>" +
				"<td class=\"i_status\">" + status_value + "</td>" +
				"</tr>";
			});
			content += '</table>';
			content += '</div>';
		}
	});
	content += '</div>';
	return content;	
}

//search by drawing tools
function createToolbar(map) {
	drawtoolbar = new esri.toolbars.Draw(map);
	var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,0,0,0.2]));	
	drawtoolbar.setFillSymbol(symbol);
	dojo.connect(drawtoolbar, "onDrawEnd", queryByGeometry);
}

function printMap() {
	var extent = map.extent;
    var centralMeridian = esri.geometry.webMercatorToGeographic(extent.getCenter()).x;
	
	var xmin = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmin, map.extent.ymin, map.spatialReference)).x
	var xmax = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmax, map.extent.ymax, map.spatialReference)).x
	//console.log("xmin=" + xmin + "; xmax=" + xmax);
	
	var pt3 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(0, 0, new esri.SpatialReference(4326)))
	var pt4 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(1, 1, new esri.SpatialReference(4326)))
	var dist = new esri.geometry.Extent(pt3.x,pt3.y,pt4.x,pt4.y,map.spatialReference).getWidth();
	//console.log(dist);
	
	/*if ((xmin > 0) && (xmax > 0) && (centralMeridian < 0)) {
		var width = ((180 - xmin)*dist) + (xmax*dist) + (180*dist);
		extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
	} else if ((xmin > 0) && (xmax < 0) ) {
		var width = ((180 - xmin)*dist) + ((180 + xmax)*dist)
		extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
	} else {
		centralMeridian = 0.0;
		extent = extent.xmin + ";" + extent.ymin + ";" + extent.xmax + ";" + extent.ymax;
	}	*/
	
    var query = currentQuery;
	if (queryDefinition.length > 0) {
		var queryDefinition_translate = dojo.map(queryDefinition, function(d){ return ((config_byValues.hasOwnProperty(d)) ? config_byValues[d] : d) });
	}
    var filter = (queryDefinition_translate) ? queryDefinition_translate.join("  |  ") : "< " + ((config_byValues.hasOwnProperty("None")) ? config_byValues["None"] : "None") + " >";
    var islands = dijit.byId("r_threatened_on_islands").get("title").split(": ").pop();
    var species = dojo.byId("threats_sum").innerHTML;
    var basemap = "Basic";
    var scale = Math.round(map.getScale());
	var format = "Letter";
	if (dijit.byId("A4").checked == true) {
		format = "A4";
	} else if (dijit.byId("PPT").checked == true) {
		format = "PPT"
	}

    if (imageryLayer.visible == true) {
        basemap = "Satellite";
    }
    if (baseMapLayer.visible == true) {
        basemap = "Topographic";
   }
   gp = new esri.tasks.Geoprocessor(printUrl)
   var params = {
        "app": 'tib',
        "language": language,
        "query": query,
        "filter": filter,
        "islands": islands,
        "species": species,
        "basemap": basemap,
        "scale": scale,
		"centralMeridian": centralMeridian,
		"format": format
   }
   //console.log(params);
   gp.submitJob(params, getMapExport, checkMapExportStatus, getMapExportErrors);
   
}

function getMapExport(jobInfo) {
	gp.getResultData(jobInfo.jobId,"output", function(output) {
		dijit.byId("printProgressBar").set({ "value": dijit.byId("printProgressBar").get("maximum") });
		var text = (config_byValues.hasOwnProperty('Download Map')) ? config_byValues['Download Map'] : 'Download Map';
		dojo.byId("printOptionsTextNode").innerHTML = text;
		
		var label = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : 'Download';
		dijit.byId("printButton").set('label', label);
		dojo.byId("printButton").innerHTML = label;
		dijit.byId("printButton").set('disabled', false);
		pdfDownloadUrl = output.value.url;
		if (dijit.byId("PPT").checked == true) {
			pdfDownloadUrl = pdfDownloadUrl.replace('.pdf', '.jpg')
		}
	});
}

function checkMapExportStatus(jobInfo) {
	var value = parseInt(dijit.byId("printProgressBar").get("value")) + 1;
	var max = parseInt(dijit.byId("printProgressBar").get("maximum"));
	if (value == max - 1) {
		dijit.byId("printProgressBar").set("maximum", max + 1)
	}
	dijit.byId("printProgressBar").set({ "value": value });
}

function resetMapExport(){
	var text = (config_byValues.hasOwnProperty('Export Map')) ? config_byValues['Export Map'] : 'Export Map';
	dojo.byId("printOptionsTextNode").innerHTML = text;
	dijit.byId("printProgressBar").set({ "value": 0 });
	var label = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : 'Export';
	dijit.byId("printButton").set('label', 'Export');
	dojo.byId("printButton").innerHTML = label;
	pdfDownloadUrl = "";
}

function exportToCsv() {
	gp = new esri.tasks.Geoprocessor(exportUrl);
	var params = { "Input_CSV_String": csvString };
	gp.submitJob(params, getTableExport, checkTableExportStatus, getTableExportErrors);
}

function getTableExport(jobInfo) {
	gp.getResultData(jobInfo.jobId,"Output_CSV_File", function(output) {
		dijit.byId("csvProgressBar").set({ "value": dijit.byId("csvProgressBar").get("maximum") });
		var text = (config_byValues.hasOwnProperty('Download CSV')) ? config_byValues['Download CSV'] : 'Download CSV';
		dojo.byId("csvOptionsTextNode").innerHTML = text;
		
		var label = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : 'Download';
		dijit.byId("csvButton").set('label', label);
		dojo.byId("csvButton").innerHTML = label;
		dijit.byId("csvButton").set('disabled', false);
		tableDownloadUrl = output.value.url;
	});
}

function checkTableExportStatus(jobInfo) {
	var value = parseInt(dijit.byId("csvProgressBar").get("value")) + 1;
	var max = parseInt(dijit.byId("csvProgressBar").get("maximum"));
	if (value == max - 1) {
		dijit.byId("csvProgressBar").set("maximum", max + 1)
	}
	dijit.byId("csvProgressBar").set({ "value": value });
}

function resetCsvExport(){
	var text = (config_byValues.hasOwnProperty('Export to CSV')) ? config_byValues['Export to CSV'] : 'Export to CSV';
	dojo.byId("csvOptionsTextNode").innerHTML = text;
	dijit.byId("csvProgressBar").set({ "value": 0 });
	var label = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : 'Export';
	dijit.byId("csvButton").set('label', label);
	dojo.byId("csvButton").innerHTML = label;
	tableDownloadUrl = "";
}

function csvProgress(){
	var value = parseInt(dijit.byId("csvProgressBar").get("value")) + 1;
	var max = parseInt(dijit.byId("csvProgressBar").get("maximum"));
	dijit.byId("csvProgressBar").set("maximum", max + 1)
	dijit.byId("csvProgressBar").set({ "value": value });
}

function getMapExportErrors(error) {
	console.log(error);
	resetMapExport();
}

function getTableExportErrors(error) {
	console.log(error);
	resetCsvExport();
}

function changeBaseMap(node,layer) {
	var layers = [baseMapLayer, imageryLayer, ovMapLayer];
	dojo.fx.wipeOut({
		node: "baseMapSelectorOptions",
		duration: 300,
		onEnd: function(){
			dojo.style("baseMapSelector",{
				"borderRadius":"4px 4px 4px 4px"
			});
			dojo.forEach(layers, function(layer){
					layer.hide();
			});
			layer.show()
			if (layer == ovMapLayer) {
				var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([210,210,210,1]), 1), new dojo.Color([100,100,100,1]))
				islandPointFeatures.setRenderer(new esri.renderer.SimpleRenderer(symbol));
				islandPointFeatures.setSelectionSymbol(symbol);
				islandPointFeatures.refresh();
				dojo.style("centerDiv", "backgroundColor", "#D0CFD4")
			} else {
				islandPointFeatures.setRenderer(new esri.renderer.SimpleRenderer(islandSymbol));
				islandPointFeatures.setSelectionSymbol(islandSymbol);
				islandPointFeatures.refresh();
				if (layer == imageryLayer) {
				dojo.style("centerDiv", "backgroundColor", "#020514")
				}
				if (layer == baseMapLayer) {
					dojo.style("centerDiv", "backgroundColor", "#5992C9")
				}				
			}
			toggleToolState("baseMapSelector");			
		}
	}).play();	
}

function toolHover(id, action){
	var tool = dojo.byId(id);
	var height = dojo.style(id, "height");
	var state = tool.getAttribute('data-state');
	
	if (action == "over") {
		var y = (height * 2) + "px";
		var position = "0px -" + y;
	} else {
		var y = height + "px";
		var position = (state == "on") ? "0px -" + y  : "0px 0px";
		
	}
	dojo.style(id, { "backgroundPosition": position });
}

function toggleToolState(id) {
	var tool = dojo.byId(id);
	var height = dojo.style(id, "height");
	var state = tool.getAttribute('data-state');
	
	if (state == "on") {
		tool.setAttribute('data-state', 'off');
		var position =  "0px 0px";
	} else {
		tool.setAttribute('data-state', 'on');
		var position = "0px -" + height + "px";
	}
	dojo.style(id, { "backgroundPosition": position });
}


function toggleOptions(id) {
	toggle(id);
}

function toggle(id) {
	var display = dojo.style(id,"display");
	if (display=="none") {
		dojo.fx.wipeIn({
			node: id,
			duration: 300
		}).play();
	} else {
		dojo.fx.wipeOut({
			node: id,
			duration: 300
		}).play();	
	}
}

function agreeToTerms(id) {
	if (id == 'csv') {
		 if (dijit.byId('csvTermsCheck').checked) {
			csvTermsConnect = dojo.connect(dijit.byId('termsOfUse'), 'hide', function() {
				if (!csvTerms) {
					csvTerms = true;
					dojo.style('csvTermsDiv', 'display', 'none');
					csvButtonClick();
					dojo.disconnect(csvTermsConnect);
				};
			});
			dijit.byId('termsOfUse').hide();
		 } else {
			csvTerms = false;
		 }
	}
	
	if (id == 'print') {
		 if (dijit.byId('printTermsCheck').checked) {
			printTermsConnect = dojo.connect(dijit.byId('termsOfUse'), 'hide', function() {
				if (!printTerms) {
					printTerms = true;
					dojo.style('printTermsDiv', 'display', 'none');
					printButtonClick();
					dojo.disconnect(printTermsConnect);
				};
			});
			dijit.byId('termsOfUse').hide();
		 } else {
			printTerms = false;
		 }
	}
}

function updateTermsContinueButton(id) {
	if (id == 'csv') {
		if (dijit.byId('csvTermsCheck').checked) {
			dijit.byId("csvContinueButton").set('disabled', false);
		} else {
			dijit.byId("csvContinueButton").set('disabled', true);
		}
	}
	
	if (id == 'print') {
		if (dijit.byId('printTermsCheck').checked) {
			dijit.byId("printContinueButton").set('disabled', false);
		} else {
			dijit.byId("printContinueButton").set('disabled', true);
		}
	}
}