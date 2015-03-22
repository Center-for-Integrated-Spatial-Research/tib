dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.TitlePane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.Tooltip");
dojo.require("dijit.Dialog");
dojo.require("dijit.ProgressBar");

dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.DeferredList");
dojo.require("dojo.NodeList-traverse"); 

dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.fx");
dojo.require("dojo.fx.easing");
dojo.require("dojox.xml.parser");
dojo.require('dojox.image.Gallery');
dojo.require("dojox.widget.AutoRotator");
dojo.require("dojox.widget.rotator.Fade");

dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.geometry");
dojo.require("esri.toolbars.navigation");
dojo.require("esri.toolbars.draw");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.utils");

var corsServer = "tib.cisr.ucsc.edu";
var map;
var baseMapLayer;
var baseMapLayerUrl = "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer";
var imageryLayer;
var imageryLayerUrl = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer";
var ovMapLayer;
var ovMapLayerUrl = "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer";
var islandPointFeatures;
var islandPointFeaturesUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/tib_2015_02_06/MapServer/0";
var threatenedSppTable;
var threatenedSppTableUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/tib_2015_02_06/MapServer/1";
var threatenedSppIslandTable;
var numThreatenedSpp = 0;
var breedingData
var redListData
var invasiveSppTable;
var invasiveSppTableUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/tib_2015_02_06/MapServer/2";
var invasiveSppIslandTable;
var numInvasiveSpp = 0
var numZeroInvasiveSpp = 0;
var threatData;
var threatFilter = [];
var threatStatusFilter = [];
var invasiveData;
var invasiveStatusData;
var invasiveFilter = [];
var islandPointSelectionLayer;
var islandPointHighlightLayer;
var islandSymbol;
var highlightSymbol;
var selectionSymbol;
var navigationTool;
var initialExtent;
var tooltip;
var drawtoolbar;
var threatendSppImages = {};
var resultsDomNodes = {"r_threats_spp_type" : 22, "r_breeding_type" : 22, "r_invasives_spp_type" : 22, "r_invasives_status_type": 22 }
var activeSearch = "sql";
var currentQuery = "0 = 1";
var appLoaded = [];
var allLayersLoaded = 5;
var urlQueryParams;
var maxExtent;
var gp;
var printUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/ic_print/GPServer/Print%20Custom%20Web%20Map";
var exportUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/TOOLS/ConvertStringToCSV/GPServer/Convert String to CSV";

var islandPointFeaturesFields = ["OBJECTID", "Island_GID_Code", "Island_Name", "Region_ID_Name", "Country", "Region_Archipelago", "Eradication_Island", "Cat", "Dog", "Lagomorph", "Mustelid", "Rodent_Rattus", "Rodent_Mus", "Ungulate", "Corrected_Latitude", "Corrected_Longitude", "Corrected_Area_KM2", "Human_Habitation_Category", "Sensitive"];
var threatenedSppIslandFields = ["OBJECTID", "Threatened_Species", "Family", "Order_", "Scientific_Name", "Common_Name", "Red_List_Status", "Animal_Type", "Animal_Type_Corrected", "Breeding_Island", "Present_Breeding_Status", "Historic_Breeding_Status", "Threatened_Species_ID_Corrected", "Sensitive"];
var invasiveSppIslandFields = ["OBJECTID", "Island_Name", "Invasive_Species", "Scientific_Name", "Common_Name", "Trophic_Level", "InvasiveTypeCorrected", "Invasive_Status" ];

var filterSelectAll = " -- all -- ";
var islandPointsIslandID = "Island_GID_Code";
var islandPointsName = "Island_Name";
var threatenedSppIslandID = "Breeding_Island";
var invasiveSppIslandID = "Island_Name";
var threatenedSppID = "Threatened_Species_ID_Corrected";
var invasiveSppID = "Invasive_Species";

var redListSelectOrder = [filterSelectAll, "EW", "CR", "EN", "VU"];
var invasiveTypeSelectOrder = [filterSelectAll, "Rodent", "Ungulate", "Cat", "Rabbit and Hare", "Mongoose and Weasel", "Primate", "Dog and Fox", "Mammal (Other)", "Amphibian", "Reptile", "Reptile (Snake)", "Bird", "Bird (Raptor)", "Fish", "Invertebrate", "None", "Unknown"];

var redListDefs = [
["lc","Least Concern"],
["nt","Not Threatened"],
["vu","Vulnerable"],
["en","Endangered"],
["cr","Critically Endangered"],
["ew","Extinct in the Wild"],
["ex","Extinct"]
];

var presentBreedingStatusDefs = [
["confirmed", "(Present) Species is confirmed to breed on the island"],
["probable", "(Present) Breeding is not confirmed but is suspected based on a number of factors or evidence"],
["potential", "(Present) Species recorded as past breeder on the island, but current status is unclear"],
["data_deficient", "(Present) Breeding status not updated in past 20 years OR not enough data to extrapolate exact breeding island location"],
["extirpated", "(Present) Confirmed extirpated from the island"],
["extinct", "(Present) Currently listed as EX or EW by IUCN"],
["introduced", "(Present) Species introduced to an island outside of its native range or archipelago"]
];

var historicBreedingStatusDefs = [
["confirmed", "(Historic) Species is confirmed to have bred on the island"],
["probable", "(Historic) Breeding is not confirmed but is suspected based on a number of factors or evidence"],
["potential", "(Historic) Breeding status is unclear (inconclusive surveys or data)"],
["data_deficient", "(Historic) No record or history of species on island in past 21 – 200 years"],
["na", "(Historic) Species is listed as Confirmed for Present Breeding Status"],
["introduced", "(Historic) Species was introduced to an island outside of its native range or archipelago"]
];

var arkiveURL = "http://www.arkive.org/api/C1QL4332G0/portlet/latin/[SPECIES_NAME]/1?media=images";
var iucnRedListUrl = "http://www.iucnredlist.org/apps/redlist/search/external?text=";
var iucnInvasiveUrl = "http://www.issg.org/database/species/search.asp?sts=sss&st=sss&fr=1&x=33&y=4&sn=[SPECIES_NAME]&rn=&hci=-1&ei=-1&lang=EN";
var icEradicationUrl = "http://eradicationsdb.fos.auckland.ac.nz/pages/search/default.aspx?i=";
var birdLifeUrl = "http://www.birdlife.org/datazone/speciesfactsheet.php?id=[SPECIES_NAME]";
var diiseUrl = "http://diise.islandconservation.org";
var pdfDownloadUrl = "";
var tableDownloadUrl = "";
var csvString = "";
var language = "en";
var csvTerms = false;
var printTerms = false;
var splashRotatorWidget;
var queryDefinition = [];

