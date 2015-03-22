//start query functions
function getSearchQueryData(){
	dojo.style("progressBarDiv", { "display":"block" });
	dijit.byId("searchButton").setDisabled(true);
	dijit.byId("clearButton").setDisabled(true);
	toggleSensitiveSpeciesWarning(false);
	resetCsvExport();
	
	var geo = false;
	var threat = false;
	var invasive = false;
	
	var region = dijit.byId("regionSelect").get('value');
	var country = dijit.byId("countrySelect").get('value');
	var island = dijit.byId("islandSelect").get('value');
	var threatType = dijit.byId("threatenedTypeSelect").get('value');
	var threatOrder = dijit.byId("threatenedOrderSelect").get('value');
	var threatFamily = dijit.byId("threatenedFamilySelect").get('value');
	var threatScientific = dijit.byId("threatenedScientificSelect").get('value');
	var threatCommon = dijit.byId("threatenedCommonSelect").get('value');
	var threatStatus = dijit.byId("threatenedStatusSelect").get('value');
	var invasiveType = dijit.byId("invasiveTypeSelect").get('value');
	var invasiveScientific = dijit.byId("invasiveScientificSelect").get('value');
	var invasiveCommon = dijit.byId("invasiveCommonSelect").get('value');
	
	queryDefinition = [];
	
	var islandSql = "";
	if (((region != filterSelectAll) && (region != "")) || ((island != filterSelectAll) && (island != ""))) { 
		geo = true;
		
		if ((island != filterSelectAll) && (island != "")) {
			islandSql = "Island_Name = '" + island.replace("'","''") + "'"
			threatSql = (threatSql != "") ? " AND " + sql : sql;
			var text = island;		
		} else if ((country != filterSelectAll) && (country != "")) {
			islandSql = "Country = '" + country + "'";
			var text = country;		
		} else if ((region != filterSelectAll) && (region != "")) {
			islandSql = "Region_ID_Name = '" + region + "'";
			var text = region;			
		} 		
		queryDefinition.push(text);
	}
	
	var threatSql = "Red_List_Status <> 'EX'";
	if ( ((threatType != filterSelectAll) && (threatType != "")) || ((threatOrder != filterSelectAll) && (threatOrder != "")) || ((threatFamily != filterSelectAll) && (threatFamily != "")) || ((threatStatus != filterSelectAll) && (threatStatus != "")) || ((threatCommon != filterSelectAll) && (threatCommon != "")) || ((threatScientific != filterSelectAll) && (threatScientific != "")) ) {
		threat = true;
		
		threatSql += " AND "
		
		if ((threatStatus != filterSelectAll) && (threatStatus != "")) {
			threatSql += "Red_List_Status = '" + threatStatus + "'";
			var text = threatStatus;
			queryDefinition.push(text);	
			text = '';
			threatStatusFilter = ["Red_List_Status", threatStatus];
		}
		
		if ((threatCommon != filterSelectAll) && (threatCommon != "")) {
			var sql = "Common_Name = '" + threatCommon.replace("'","''") + "'";
			threatSql = (threatStatusFilter.length > 0) ? threatSql + " AND " + sql : threatSql + sql;
			var text = threatCommon;
			threatFilter = ["Common_Name", threatCommon];
			queryDefinition.push(text);
		} else if ((threatScientific != filterSelectAll) && (threatScientific != "")) {
			var sql = "Scientific_Name = '" + threatScientific + "'";
			threatSql = (threatStatusFilter.length > 0) ? threatSql + " AND " + sql : threatSql + sql;
			var text = threatScientific;
			threatFilter = ["Scientific_Name", threatScientific];
			queryDefinition.push(text);			
		} else if ((threatFamily != filterSelectAll) && (threatFamily != "")) {
			var sql = "Family = '" + threatFamily + "'";
			threatSql = (threatStatusFilter.length > 0) ? threatSql + " AND " + sql : threatSql + sql;
			var text = threatFamily;
			threatFilter = ["Family", threatFamily];
			queryDefinition.push(text);
		} else if ((threatOrder != filterSelectAll) && (threatOrder != "")) {
			var sql = "Order_ = '" + threatOrder.toUpperCase() + "'";
			threatSql = (threatStatusFilter.length > 0) ? threatSql + " AND " + sql : threatSql + sql;
			var text = threatOrder;
			threatFilter = ["Order_", threatOrder.toUpperCase()];
			queryDefinition.push(text);		
		} else if ((threatType != filterSelectAll) && (threatType != "")) {
			if (threatType == "Bird - All") {
				var sql = "Animal_Type_Corrected LIKE 'Bird -%'";
				threatFilter = ["Animal_Type_Corrected", 'bird'];
				var text = "Bird - All";
			} else {
				var sql = "Animal_Type_Corrected = '" + threatType + "'";
				threatFilter = ["Animal_Type_Corrected", threatType];
				var text = threatType;
			}
			
			threatSql = (threatStatusFilter.length > 0) ? threatSql + " AND " + sql : threatSql + sql;
			queryDefinition.push(text);
		}
	
	}
	
	var invasiveSql = "";
	if ( ((invasiveType != filterSelectAll)&& (invasiveType != "")) || ((invasiveCommon != filterSelectAll) && (invasiveCommon != "")) || ((invasiveScientific != filterSelectAll) && (invasiveScientific != "")) ) {
		invasive = true;
		if ((invasiveCommon != filterSelectAll) && (invasiveCommon != "")) {
			invasiveSql = "Common_Name = '" + invasiveCommon.replace("'","''") + "'";
			var text = invasiveCommon;
			invasiveFilter = ["Common_Name", invasiveCommon];	
		} else if ((invasiveScientific != filterSelectAll)&& (invasiveScientific != "")) {
			invasiveSql = "Scientific_Name = '" + invasiveScientific + "'"; 
			var text = invasiveScientific;
			invasiveFilter = ["Scientific_Name", invasiveScientific];				
		} else if ((invasiveType != filterSelectAll)&& (invasiveType != "")) {
			invasiveSql = "InvasiveTypeCorrected = '" + invasiveType + "'";
			var text = invasiveType;
			invasiveFilter = ["InvasiveTypeCorrected", invasiveType];	
		}
		queryDefinition.push(text);
	}
	
	if (threat) {
		var queryTask = new esri.tasks.QueryTask(threatenedSppTableUrl);
		var query = new esri.tasks.Query();
		query.where = (threatSql);
		query.outFields = [threatenedSppIslandID, "Sensitive"];
		queryTask.execute(query, function(records) {
			if (records.features.length > 0) {
				var thr_data = records.features;
				var values = dojo.map(thr_data, function(feature){ return feature.attributes[threatenedSppIslandID] });
				values = getUniqueValues(values);
				
				if (geo) { islandSql = islandSql + " AND " }
				
				if (invasive) {
					var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
					var query = new esri.tasks.Query();	
					invasiveSql = invasiveSql + " AND Island_Name IN (" + values.join(",") + ")";
					query.where = (invasiveSql);
					query.outFields = [invasiveSppIslandID];
					queryTask.execute(query, function(records) {
						if (records.features.length > 0) {
							var inv_data = records.features;
							var values = dojo.map(inv_data, function(feature){ return feature.attributes[invasiveSppIslandID] });
							values = getUniqueValues(values);
							
							islandSql += "Island_GID_Code IN (" + values.join(",") + ")";
							currentQuery = sql;
							getIslandData(islandSql);
						} else {
							processEmptyResults();
						}						
					});
				} else {
						islandSql += "Island_GID_Code IN (" + values.join(",") + ")";
						currentQuery = sql;
						getIslandData(islandSql);
				}
			} else {
				processEmptyResults();
			}
		});
	} else if (invasive) {
		if (geo) { islandSql = islandSql + " AND " }
		var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
		var query = new esri.tasks.Query();
		query.where = (invasiveSql);
		query.outFields = [invasiveSppIslandID];
		queryTask.execute(query, function(records) {
			if (records.features.length > 0) {		
				var inv_data = records.features;
				var values = dojo.map(inv_data, function(feature){ return feature.attributes[invasiveSppIslandID] });
				values = getUniqueValues(values);	
				
				islandSql += "Island_GID_Code IN (" + values.join(",") + ")";
				currentQuery = sql;
				getIslandData(islandSql);
			} else {
				processEmptyResults();
			}			
		});		
	} else if (geo) {
		getIslandData(islandSql);
	} else if (islandSql == "") {
		alert((config_byValues.hasOwnProperty("no_filter")) ? config_byValues["no_filter"] : "No search filters chosen.  Please select items from the Search pane to filter by ...");
		dojo.style("progressBarDiv", { "display":"none" });
		queryDefinition.push("&lt;" + ((config_byValues.hasOwnProperty('None')) ? config_byValues['None'] : "None") + "&gt;")
	}
	var queryDefinition_translate = dojo.map(queryDefinition, function(d){ return ((config_byValues.hasOwnProperty(d)) ? config_byValues[d] : d) })
	dojo.byId("queryDefinition").innerHTML = ((config_byValues.hasOwnProperty('Filter')) ? config_byValues['Filter'] : "Filter") + ": <b>" + queryDefinition_translate.join("&nbsp;&nbsp;|&nbsp;&nbsp;") + "</b>";
}

function getIslandData(sql) {
	var query = new esri.tasks.Query();
	query.where = (sql);
	currentQuery = sql;
	islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(results) {
		processIslandData(results);
	});
}

//search by drawing tools
function searchToolActivate(tool){
	var active = (dojo.style(tool, "backgroundColor") == "rgb(217, 232, 249)") ? true : false;
	if (active) { 
		searchToolDeactivate();
	} else {
		dojo.style("extentSelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
		dojo.style("polySelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
		
		dojo.style(tool, { "backgroundColor":"rgb(217, 232, 249)", "border":"1px solid #a6b2bf" });
		switch (tool) {
		case "polySelect":
			drawtoolbar.activate(esri.toolbars.Draw.POLYGON);
			break;
		case "extentSelect":
			drawtoolbar.activate(esri.toolbars.Draw.EXTENT);
			break;	
		};
		
		var selectBoxs = dojo.query(".dijitComboBox");
		dojo.forEach(selectBoxs, function(box) {
			dijit.byId(box.id.split("_")[1]).set('value', filterSelectAll);
			dijit.byId(box.id.split("_")[1]).setDisabled(true);
		});
		dijit.byId("searchButton").setDisabled(true);
		dijit.byId("clearButton").setDisabled(true);
		activeSearch = "shape";
	}

}

function searchToolDeactivate() {
	dojo.style("extentSelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
	dojo.style("polySelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
	var selectBoxs = dojo.query(".dijitComboBox");
	dojo.forEach(selectBoxs, function(box) {
		dijit.byId(box.id.split("_")[1]).setDisabled(false);
	});
	dijit.byId("searchButton").setDisabled(false);
	dijit.byId("clearButton").setDisabled(false);
	drawtoolbar.deactivate();
	activeSearch = "sql";	
}

function queryByGeometry(geometry) {
	dojo.byId("queryDefinition").innerHTML = ((config_byValues.hasOwnProperty('Filter')) ? config_byValues['Filter'] : "Filter") + ": <b>&lt;" + ((config_byValues.hasOwnProperty('Graphic')) ? config_byValues['Graphic'] : "Graphic") + "&gt;</b>";
	queryDefinition = ["< " + ((config_byValues.hasOwnProperty('Graphic')) ? config_byValues['Graphic'] : "Graphic") + " >" ];
	var query = new esri.tasks.Query();	
	query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
	query.geometry = geometry;
	islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(results) {
		var ids = dojo.map(results, function(feature){
			return feature.attributes[islandPointsIslandID];
		});
		currentQuery = "Island_GID_Code IN (" + ids.join(",") + ")";
		processIslandData(results);
	});
	
	switch (geometry.type) {
	  case "polygon":
		var graphicExtent = geometry.getExtent();
		break;
	  case "extent":
		var graphicExtent = geometry;
		break;
	}	
	
	var extent = new esri.geometry.Extent(graphicExtent.xmin,graphicExtent.ymin,graphicExtent.xmax,graphicExtent.ymax, map.spatialReference);
	map.setExtent(extent.expand(1.1),true);
	
	searchToolDeactivate();
}