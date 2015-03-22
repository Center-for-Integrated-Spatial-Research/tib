function getUniqueValues(values) {
	var unique = [];
	var test = {};
	unique = dojo.filter(values, function(val){
		return test[val] ? false : (test[val] = true);
	})
	return unique;
}

function getUniqueValuesMultiple(values){
	var n = new Array();
	n[0] = values[0];
	for (var i=0; i<values.length; i++) {
		var flag = true;
		for (var j=0; j < n.length; j++) {
			if (n[j][0] == values[i][0]) {
				flag = false;
			}
		}
		if (flag == true) { n.push(values[i]) };
	}
	return n;
}

function getSumValues(values) {
    var a = values[0];
    for (var i = 1; i < values.length; i++) {
        a = a + values[i];
    }
    return a;
}

function hover(t, style) {
	t.className=style;
}

function hoverLanguage(t, action) {
	var color = (action == "over") ? "#666" : "#1a1a1a";
	dojo.style(t.id, "background", color);
}

function toggleDefinition(id) {
	var display = dojo.style(id + "_sub", "display");
	if (display=="none") {
		dojo.style(id + "_sub", "display", "block");
		dojo.byId(id + "_toggle").innerHTML = "[--]";
	}
	else {
		dojo.style(id + "_sub", "display", "none");
		dojo.byId(id + "_toggle").innerHTML = "[+]";
	}
}