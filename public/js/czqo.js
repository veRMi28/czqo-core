/*
Format of clearance request:
CALLSIGN request clearance via Track LETTER|route ROUTE. Estimating
ENTRY at TIME. Request Flight Level FLIGHTLEVEL, Mach MACHSPEED.
(Result will say 'Readback TMI [TMI] on readback of clearance from controller.)
*/

//Generate result
function generateOceanicClearance(){
    //Get variables from form
    var callsign = document.getElementById('callsignB').value;
    var flightLevel = document.getElementById('flightLevelB').value;
    var mach = document.getElementById('machB').value;
    var nat = document.getElementById('natB').value;
    var route = document.getElementById('routeB').value;
    var entry = document.getElementById('entryB').value;
    var time = document.getElementById('timeB').value;
    var tmi = document.getElementById('tmiB').value;

    //In case there are errors...
    var errors = [];

    //Check if fields aren't filled.
    //First, NAT/Route because there might be a reason for it not being filled.
    var routeMode;
    if (document.getElementById('natRoutePanel').style.display == 'block'){
        if (nat == ''){
            errors.push('NAT track not filled.');
        }else{routeMode = 0;}
}else{
        if (route == ''){
            errors.push('Random route not filled.');
        }else{routeMode = 1;}
    }

    //Callsign, flight level, mach, entry, estimating
    if (callsign == ''){
        errors.push('Callsign not filled');
    }
    if (flightLevel == ''){
        errors.push('Flight level not filled.');
    }
    if (mach == ''){
        errors.push('Mach speed not filled.');
    }
    if (entry == ''){
        errors.push('Entry fix not filled.');
    }
    if (time == ''){
        errors.push('Estimating time not filled.');
    }

    //There are errors... tell the user to fix 'em!
    if (errors.length >= 1){
        return invalidSubmission(errors);
    }

    //No errors? March on!
    //Generate main request transcript.
    var transcript;
    //Nat routing
    if (routeMode == 0){
        transcript = callsign + " request clearance via Track " + nat + ". Estimating " + entry + " at " + time + ". Request Flight Level " + flightLevel + ", Mach " + mach + ".";
    }else{
        transcript = callsign + " request clearance via route " + route + ". Estimating " + entry + " at"  + time + ". Request Flight Level " + flightLevel + ", Mach " + mach + ".";
    }

    //Display it!
    document.getElementById('errorA').style.display = 'none';
    document.getElementById('results').innerHTML = transcript;
    if (tmi !== ''){
        document.getElementById('results').innerHTML = document.getElementById('results').innerHTML + "<br/><strong>On readback, state you have TMI " + tmi + ".</strong>";
    }
}

//Nat/random routing select
function routingSelect(value){
    if (value == 'nat'){
        document.getElementById('natRoutePanel').style.display = 'block';
        document.getElementById('randomRoutePanel').style.display = 'none';
    }else{
        document.getElementById('natRoutePanel').style.display = 'none';
        document.getElementById('randomRoutePanel').style.display = 'block';
    }
}

/*
Format of clearance request:
CALLSIGN request clearance via Track LETTER|route ROUTE. Estimating
ENTRY at TIME. Request Flight Level FLIGHTLEVEL, Mach MACHSPEED.
(Result will say 'Readback TMI [TMI] on readback of clearance from controller.)
*/

//Generate results
function generatePositionReport(){
    //Get variables from form
    var callsign = document.getElementById('callsignB').value;
    var reporting = document.getElementById('reportingB').value;
    var time = document.getElementById('timeB').value;
    var flightLevel = document.getElementById('flightLevelB').value;
    var next = document.getElementById('nextB').value;
    var estimating = document.getElementById('estimatingB').value;
    var thereafter = document.getElementById('thereafterB').value;

    //In case there are errors...
    var errors = [];

    //Check if fields aren't filled
    if (callsign == ''){
        errors.push('Callsign not filled');
    }
    if (reporting == ''){
        errors.push('Reporting fix not filled');
    }
    if (time == ''){
        errors.push('Time not filled');
    }
    if (flightLevel == ''){
        errors.push('Flight level not filled');
    }
    if (next == ''){
        errors.push('Next fix not filled');
    }
    if (estimating == ''){
        errors.push('Estimating next fix time not filled');
    }
    if (thereafter == ''){
        errors.push('Fix thereafter not filled');
    }

    //There are errors... tell the user to fix 'em!
    if (errors.length >= 1){
        return invalidSubmission(errors);
    }

    //No errors? March on!
    //Generate main request transcript.
    var transcript;
    //Create transcript
    transcript = callsign + ', position ' + reporting + ' at ' + time + ', Flight Level ' + flightLevel + ', Estimating ' + next + ' at ' + estimating + ', ' + thereafter + ' thereafter.';


    //Display it!
    document.getElementById('errorA').style.display = 'none';
    document.getElementById('results').innerHTML = transcript;
}

//Deal with invalid submission
function invalidSubmission(errors){
    document.getElementById('errorContent').innerHTML = "";
    document.getElementById('errorA').style.display = 'block';
    for (i = 0; i < errors.length; i++) {
        document.getElementById('errorContent').innerHTML = document.getElementById('errorContent').innerHTML + '<br/>' + errors[i];
    }
}

function createNatTrakMap()
{
    var map = L.map('map').setView([50.198470, -32.708], 3);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.light',
        accessToken: 'pk.eyJ1IjoiZWx0ZWNocm9uIiwiYSI6ImNqOTlydHR4czB4NG8ycWxzYXNla2pmOXcifQ.hBI3z2L84aiEDfp5H946_Q'
    }).addTo(map);

    /* var polygon = L.polygon([
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047]
    ]).addTo(map);
    polygon.bindPopup("I am a polygon."); */

    //var marker = L.marker([51.5, -0.09]).addTo(mymap);

    //Get tracks
    let api = "https://api.flightplandatabase.com/nav/NATS";
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", api, false);
    xmlHttp.send(null);
    let apiString = xmlHttp.responseText;
    let apiJson = JSON.parse(apiString);
    console.log(apiJson);

    var processedNats = [];

    //Go through all the tracks
    for (track in apiJson) {
        //Go through the tracks and only use the good ones...
        if (checkIfNatProcessed(apiJson[track].ident) == false) {
            processedNats.push(apiJson[track].ident);
            //Create some markers
            let fixArray = [];
            for (n in apiJson[track].route.nodes) {
                if (apiJson[track].route.eastLevels.length == 0) {
                    createMarker(apiJson[track].route.nodes[n], apiJson[track].ident, 'orange');
                }else{
                createMarker(apiJson[track].route.nodes[n], apiJson[track].ident, 'blue');}
                fixArray.push([apiJson[track].route.nodes[n].lat, apiJson[track].route.nodes[n].lon]);
            }
            let polyline = new L.Polyline(fixArray, {
                color: '#1c5fc9',
                weight: 2,
                opacity: 1,
                smoothFactor: 1
            });
            if (apiJson[track].route.eastLevels.length == 0) {
                polyline.setStyle({
                    color: '#c92d1c'
                });
            }
            polyline.addTo(map);
        };
    }

    let table = document.getElementById('tableBody');
    processedNats = [];
    for (track in apiJson) {
        if (checkIfNatProcessed(apiJson[track].ident) == false) {
            processedNats.push(apiJson[track].ident);
            //Create a row
            let row = document.createElement('tr');
            table.appendChild(row);

            //Get the track ID
            let identCol = document.createElement('th');
            identCol.scope = 'row';
            identCol.innerHTML = apiJson[track].ident;
            row.appendChild(identCol);

            //Get the fixes
            let fixArray = [];
            for (n in apiJson[track].route.nodes) {
                fixArray.push(" " + apiJson[track].route.nodes[n].ident);
            }
            let fixesCol = document.createElement('td');
            fixesCol.innerHTML = fixArray;
            row.appendChild(fixesCol);

            //figure out the direction and get levels
            let levelArray = [];
            let directionCol = document.createElement('td');
            let levelsCol = document.createElement('td');
            if (apiJson[track].route.eastLevels.length == 0) {
                apiJson[track].route.westLevels.forEach(function (element) {
                    levelArray.push(" " + element);
                });
                directionCol.innerHTML = "West";
            } else {
                apiJson[track].route.eastLevels.forEach(function (element) {
                    levelArray.push(" " + element);
                });
                directionCol.innerHTML = "East";
            }
            levelsCol.innerHTML = levelArray;
            row.appendChild(directionCol);
            row.appendChild(levelsCol);

            //validity
            let validityCol = document.createElement('td');
            let validFrom = " " + apiJson[track].validFrom;
            let validTo = apiJson[track].validTo;
            validityCol.innerHTML = validFrom + " to " + validTo;
            row.appendChild(validityCol);
        };
    }


}



function checkIfNatProcessed(ident) {
    if (processedNats.indexOf(ident) > -1) {
        return true;
    } else {
        return false;
    }
}

function createMarker(node, trackId, colour) {
    let markerIcon = L.icon({
        iconUrl: 'https://nesa.com.au/wp-content/uploads/2017/05/Dot-points-1.png',
        iconSize: [10, 10],
        iconAnchor: [2,4]
    });
    let marker = L.marker([node.lat, node.lon], {icon: markerIcon}).addTo(map);
    marker.bindPopup("<b>"+node.ident+"</b><br/>"+node.type+"<br/>"+node.lat+" "+node.lon);
}

/*
Function to expand and hide policy embeds on /policies
*/
$(document).ready(function () {
$(".expandHidePolicyButton").on('click', function() {
    //Get policy id
    policyId = $(this).data("policy-id")

    //Toggle the embed
    $(`#policyEmbed${policyId}`).toggleClass('d-none');
});
});



var processedNats = [];
function createMap(planes, ganderControllers, shanwickControllers) {
    const map = L.map('map', { minZoom: 4, maxZoom: 7 }).setView([60, -30], 1);
const icon = L.icon({ iconUrl: '/img/oep.png', iconAnchor: [5, 5] });

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

// Gander OEP's

const pointsGander = [
    ['AVPUT', [ '65.03333333333333', '-60' ]],
    ['CLAVY', [ '64.23333333333333', '-59' ]],
    ['EMBOK', [ '63.46666666666667', '-58' ]],
    ['KETLA', [ '62.46666666666667', '-58' ]],
    ['LIBOR', [ '61.96666666666667', '-58' ]],
    ['MAXAR', [ '61.46666666666667', '-58' ]],
    ['NIFTY', [ '60.96666666666667', '-58' ]],
    ['PIDSO', [ '60.46666666666667', '-58' ]],
    ['RADUN', [ '59.96666666666667', '-58' ]],
    ['SAVRY', [ '59.46666666666667', '-58' ]],
    ['TOXIT', [ '58.96666666666667', '-58' ]],
    ['URTAK', [ '58.46666666666667', '-58' ]],
    ['VESMI', [ '57.96666666666667', '-58' ]],
    ['AVUTI', [ '57.46666666666667', '-58' ]],
    ['BOKTO', [ '56.96666666666667', '-58' ]],
    ['CUDDY', [ '56.7', '-57' ]],
    ['DORYY', [ '56.03333333333333', '-57' ]],
    ['ENNSO', [ '55.53333333333333', '-57' ]],
    ['HOIST', [ '55.03333333333333', '-57' ]],
    ['IRLOK', [ '54.53333333333333', '-57' ]],
    ['JANJO', [ '54.03333333333333', '-57' ]],
    ['KODIK', [ '53.46666666666667', '-57.2' ]],
    ['LOMSI', [ '53.1', '-56.78333333333333' ]],
    ['MELDI', [ '52.733333333333334', '-56.35' ]],
    ['NEEKO', [ '52.4', '-55.833333333333336' ]],
    ['PELTU', [ '52.1', '-55.166666666666664' ]],
    ['RIKAL', [ '51.8', '-54.53333333333333' ]],
    ['SAXAN', [ '51.483333333333334', '-53.85' ]],
    ['TUDEP', [ '51.166666666666664', '-53.233333333333334' ]],
    ['UMESI', [ '50.833333333333336', '-52.6' ]],
    ['ALLRY', [ '50.5', '-52' ]],
    ['BUDAR', [ '50', '-52' ]],
    ['ELSIR', [ '49.5', '-52' ]],
    ['IBERG', [ '49', '-52' ]],
    ['JOOPY', [ '48.5', '-52' ]],
    ['MUSAK', [ '48', '-52' ]],
    ['NICSO', [ '47.5', '-52' ]],
    ['OMSAT', [ '47', '-52' ]],
    ['PORTI', [ '46.5', '-52' ]],
    ['RELIC', [ '46', '-52' ]],
    ['SUPRY', [ '45.5', '-52' ]],
    ['RAFIN', [ '44.88333333333333', '-51.80472222222222' ]],
    ['JAROM', [ '44.166666666666664', '-54.88333333333333' ]],
    ['BOBTU', [ '44.117222222222225', '-52.82222222222222' ]]
];

pointsGander.forEach(point => {
    L.marker([parseFloat(point[1][0]), parseFloat(point[1][1])], {icon: icon, opacity: 0.3}).addTo(map).bindPopup(point[0]);
});

// Shanwick OEP's

const pointsShanwick = [
    ['RATSU', [ '61', '-10' ]],
    ['LUSEN', [ '60.5', '-10' ]],
    ['ATSIX', [ '60', '-10' ]],
    ['ORTAV', [ '59.5', '-10' ]],
    ['BALIX', [ '59', '-10' ]],
    ['ADODO', [ '58.5', '-10' ]],
    ['ERAKA', [ '58', '-10' ]],
    ['ETILO', [ '57.5', '-10' ]],
    ['GOMUP', [ '57', '-10' ]],
    ['AGORI', [ '57', '-13' ]],
    ['SUNOT', [ '57', '-15' ]],
    ['BILTO', [ '56.5', '-15' ]],
    ['PIKIL', [ '56', '-15' ]],
    ['ETARI', [ '55.5', '-15' ]],
    ['RESNO', [ '55', '-15' ]],
    ['VENER', [ '54.5', '-15' ]],
    ['DOGAL', [ '54', '-15' ]],
    ['NEBIN', [ '53.5', '-15' ]],
    ['MALOT', [ '53', '-15' ]],
    ['TOBOR', [ '52.5', '-15' ]],
    ['LIMRI', [ '52', '-15' ]],
    ['ADARA', [ '51.5', '-15' ]],
    ['DINIM', [ '51', '-15' ]],
    ['RODEL', [ '50.5', '-15' ]],
    ['SOMAX', [ '50', '-15' ]],
    ['KOGAD', [ '49.5', '-15' ]],
    ['BEDRA', [ '49', '-15' ]],
    ['NERTU', [ '49', '-14' ]],
    ['NASBA', [ '49', '-13' ]],
    ['OMOKO', [ '48.83888888888889', '-12' ]],
    ['TAMEL', [ '48.728611111111114', '-10.497222222222222' ]],
    ['GELPO', [ '48.64416666666666', '-9.5025' ]],
    ['LASNO', [ '48.598333333333336', '-9' ]],
    ['ETIKI', [ '48', '-8.75' ]],
    ['UMLER', [ '47.5', '-8.75' ]],
    ['SEPAL', [ '47', '-8.75' ]],
    ['BUNAV', [ '46.5', '-8.75' ]],
    ['SIVIR', [ '46', '-8.75' ]],
    ['BEGAS', [ '45', '-9' ]],
    ['DIVAT', [ '45', '-9.469722222222222' ]],
    ['DIXIS', [ '45', '-10' ]],
    ['BERUX', [ '45', '-11' ]],
    ['PITAX', [ '45', '-12' ]],
    ['PASAS', [ '45', '-13' ]],
    ['NILAV', [ '45', '-13.416666666666666' ]],
    ['GONAN', [ '45', '-14' ]]
];

pointsShanwick.forEach(point => {
    L.marker([parseFloat(point[1][0]), parseFloat(point[1][1])], {icon: icon, opacity: 0.3}).addTo(map).bindPopup(point[0]);
});

// Coordinate grid

L.latlngGraticule({
    showLabel: true,
    dashArray: [5, 5],
    zoomInterval: [ { start: 0, end: 10, interval: 5 } ]
}).addTo(map);

// OCA's, FIR's and delegated areas

const Gander = [
    [ '45', '-51' ],
    [ '45', '-50' ],
    [ '44', '-50' ],
    [ '44', '-40' ],
    [ '45', '-40' ],
    [ '45', '-30' ],
    [ '61', '-30' ],
    [ '63.5', '-39' ],
    [ '58.5', '-43' ],
    [ '58.5', '-50' ],
    [ '65', '-57.75' ],
    [ '65', '-60' ],
    [ '64', '-63' ],
    [ '61', '-63' ],
    [ '58.471111111111114', '-60.35111111111111' ],
    [ '57', '-59' ],
    [ '53', '-54' ],
    [ '49', '-51' ],
    [ '45', '-51' ]
];
L.polyline(Gander, { color: '#777', weight: 0.5 }).addTo(map);

const Shanwick = [
    [ '45', '-30' ],
    [ '45', '-8' ],
    [ '51', '-8' ],
    [ '51', '-15' ],
    [ '54', '-15' ],
    [ '54.56666666666667', '-10' ],
    [ '61', '-10' ],
    [ '61', '-30' ],
    [ '45', '-30' ]
];
L.polyline(Shanwick, { color: '#777', weight: 0.5 }).addTo(map);

const NOTA = [
    [ '54', '-15' ],
    [ '54.56666666666667', '-10' ],
    [ '57', '-10' ],
    [ '57', '-15' ],
    [ '54', '-15' ]
];
L.polyline(NOTA, { color: '#777', weight: 0.5 }).addTo(map);

const SOTA = [
    [ '49', '-15' ],
    [ '48.5769444444', '-8.75' ],
    [ '48.5769444444', '-8' ],
    [ '51', '-8' ],
    [ '51', '-15' ],
    [ '49', '-15' ]
];
L.polyline(SOTA, { color: '#777', weight: 0.5 }).addTo(map);

const BOTA = [
    [ '45', '-8.75' ],
    [ '45', '-8' ],
    [ '48.5769444444', '-8' ],
    [ '48.5769444444', '-8.75' ],
    [ '45', '-8.75' ]
];
L.polyline(BOTA, { color: '#777', weight: 0.5 }).addTo(map);

const GOTA = [
    [ '53.8', '-55' ],
    [ '62.85', '-55' ],
    [ '65', '-57.75' ],
    [ '65', '-60' ],
    [ '64', '-63' ],
    [ '61', '-63' ],
    [ '57', '-59' ],
    [ '53.8', '-55' ]
];
L.polyline(GOTA, { color: '#777', weight: 0.5 }).addTo(map);

const Nuuk = [
    [ '58.5', '-50' ],
    [ '58.5', '-43' ],
    [ '63.5', '-39' ],
    [ '63.5', '-55.80928' ],
    [ '58.5', '-50' ]
];
L.polyline(Nuuk, { color: '#777', weight: 0.5 }).addTo(map);

const GanderDomestic = [
    [ '45', '-51' ],
    [ '45', '-53' ],
    [ '44.446666666666665', '-56.05166666666666' ],
    [ '45.61194444444445', '-56.47361111111111' ],
    [ '48.5', '-62' ],
    [ '49.3', '-61' ],
    [ '49.53333333333333', '-61' ],
    [ '51', '-58' ],
    [ '51.28333333333333', '-57' ],
    [ '51.735', '-57' ],
    [ '52.19638888888888', '-58.14277777777778' ],
    [ '51.63333333333333', '-59.5' ],
    [ '51.333333333333336', '-59.5' ],
    [ '50.833333333333336', '-60' ],
    [ '50.833333333333336', '-62.083333333333336' ],
    [ '51.416666666666664', '-64' ],
    [ '53.7', '-64.91666666666667' ],
    [ '54.416666666666664', '-65.33333333333333' ],
    [ '55.083333333333336', '-65.08333333333333' ],
    [ '55.355555555555554', '-64' ],
    [ '57.55', '-64' ],
    [ '58.471111111111114', '-60.35111111111111' ],
    [ '57', '-59' ],
    [ '53', '-54' ],
    [ '49', '-51' ],
    [ '45', '-51' ]
];
L.polyline(GanderDomestic, { color: '#777', weight: 0.5 }).addTo(map);

const GanderDomesticDelegated = [
    [ '53.0833333333', '-54.0833333333' ],
    [ '49', '-51' ],
    [ '45', '-51' ],
    [ '45', '-53' ],
    [ '44.446666666666665', '-56.05166666666666' ],
    [ '43.446666666666665', '-56.05166666666666' ],
    [ '44', '-50' ],
    [ '50', '-50' ],
    [ '53.0833333333', '-54.0833333333' ]
];
L.polyline(GanderDomesticDelegated, { color: '#777', weight: 0.5 }).addTo(map);

const Moncton = [
    [ '44.446666666666665', '-56.05166666666666' ],
    [ '43.6', '-60' ],
    [ '41.86666666666667', '-67' ],
    [ '44.5', '-67' ],
    [ '44.5', '-67.11666666666666' ],
    [ '44.776666666666664', '-66.9025' ],
    [ '47.2875', '-68.57666666666667' ],
    [ '47.525277777777774', '-68' ],
    [ '47.733333333333334', '-67.95' ],
    [ '47.88333333333333', '-66.89666666666668' ],
    [ '48', '-65.94111111111111' ],
    [ '47.848333333333336', '-64.62222222222222' ],
    [ '48.5', '-62' ],
    [ '45.61194444444445', '-56.47361111111111' ],
    [ '44.446666666666665', '-56.05166666666666' ]
];
L.polyline(Moncton, { color: '#777', weight: 0.5 }).addTo(map);

const Montreal = [
    [ '47.459833333333336', '-69.22444444444444' ],
    [ '44.22141666666667', '-76.19172222222223' ],
    [ '45.837500000000006', '-76.26666666666667' ],
    [ '45.961111111111116', '-76.92777777777778' ],
    [ '46.13333333333333', '-77.25' ],
    [ '46.94688055555555', '-77.25' ],
    [ '47.11110277777778', '-77.54586388888889' ],
    [ '47.55425833333333', '-78.11756944444444' ],
    [ '47.84006388888889', '-78.56570555555555' ],
    [ '48.587047222222225', '-79' ],
    [ '49', '-79' ],
    [ '53.46666666666667', '-80' ],
    [ '62.75', '-80' ],
    [ '65', '-68' ],
    [ '65', '-60' ],
    [ '64', '-63' ],
    [ '61', '-63' ],
    [ '58.471111111111114', '-60.35111111111111' ],
    [ '57.55', '-64' ],
    [ '55.355555555555554', '-64' ],
    [ '55.083333333333336', '-65.08333333333333' ],
    [ '54.416666666666664', '-65.33333333333333' ],
    [ '53.7', '-64.91666666666667' ],
    [ '51.416666666666664', '-64' ],
    [ '50.833333333333336', '-62.083333333333336' ],
    [ '50.833333333333336', '-60' ],
    [ '51.333333333333336', '-59.5' ],
    [ '51.63333333333333', '-59.5' ],
    [ '52.19638888888888', '-58.14277777777778' ],
    [ '51.735', '-57' ],
    [ '51.28333333333333', '-57' ],
    [ '51', '-58' ],
    [ '49.53333333333333', '-61' ],
    [ '49.3', '-61' ],
    [ '48.5', '-62' ],
    [ '47.848333333333336', '-64.62222222222222' ],
    [ '48', '-65.94111111111111' ],
    [ '47.88333333333333', '-66.89666666666668' ]
];
L.polyline(Montreal, { color: '#777', weight: 0.5 }).addTo(map);

const Edmonton = [
    [ '65', '-57.75' ],
    [ '73', '-69.92' ],
    [ '73', '-80' ],
    [ '64.40833333333335', '-80' ],
    [ '62.75', '-80' ],
    [ '65', '-68' ],
    [ '65', '-60' ]

];
L.polyline(Edmonton, { color: '#777', weight: 0.5 }).addTo(map);

const Reykjavik = [
    [ '63.5', '-55.80928' ],
    [ '63.5', '-39' ],
    [ '61', '-30' ],
    [ '61', '0' ],
    [ '73', '0' ],
    [ '73', '-69.92' ],
    [ '63.5', '-55.80928' ]

];
L.polyline(Reykjavik, { color: '#777', weight: 0.5 }).addTo(map);

const Scottish = [
    [ '61', '0' ],
    [ '60', '0' ],
    [ '57', '5' ],
    [ '55', '5' ],
    [ '55', '-5.5' ],
    [ '53.916666666666664', '-5.5' ],
    [ '54.416666666666664', '-8.166666666666666' ],
    [ '55.333333333333336', '-6.916666666666667' ],
    [ '55.416666666666664', '-7.333333333333333' ],
    [ '55.333333333333336', '-8.25' ],
    [ '54.75', '-9' ],
    [ '54.56666666666667', '-10' ],
    [ '61', '-10' ],
    [ '61', '0' ]
];
L.polyline(Scottish, { color: '#777', weight: 0.5 }).addTo(map);

const London = [
    [ '55', '5' ],
    [ '51.5', '2' ],
    [ '51.11666666666667', '2' ],
    [ '51', '1.4666666666666668' ],
    [ '50.666666666666664', '1.4666666666666668' ],
    [ '50', '-0.25' ],
    [ '50', '-2' ],
    [ '48.833333333333336', '-8' ],
    [ '51', '-8' ],
    [ '52.333333333333336', '-5.5' ],
    [ '55', '-5.5' ],
    [ '55', '5' ]
];
L.polyline(London, { color: '#777', weight: 0.5 }).addTo(map);

const Brest = [
    [ '50', '-0.25' ],
    [ '46.5', '-0.25' ],
    [ '46.5', '-1.6333333333333333' ],
    [ '43.583333333333336', '-1.7833333333333332' ],
    [ '44.333333333333336', '-4' ],
    [ '45', '-8' ],
    [ '48.833333333333336', '-8' ],
    [ '50', '-2' ],
    [ '50', '-0.25' ]
];
L.polyline(Brest, { color: '#777', weight: 0.5 }).addTo(map);

const Madrid = [
    [ '45', '-13' ],
    [ '45', '-8' ],
    [ '44.333333333333336', '-4' ],
    [ '43.583333333333336', '-1.7833333333333332' ],
    [ '43.38333333333333', '-1.7833333333333332' ],
    [ '42.7', '-0.06666666666666667' ],
    [ '39.733333333333334', '-1.1' ],
    [ '35.833333333333336', '-2.1' ],
    [ '35.833333333333336', '-7.383333333333334' ],
    [ '35.96666666666667', '-7.383333333333334' ],
    [ '42', '-10' ],
    [ '43', '-13' ],
    [ '45', '-13' ]
];
L.polyline(Madrid, { color: '#777', weight: 0.5 }).addTo(map);

const Lisbon = [
    [ '43', '-13' ],
    [ '42', '-10' ],
    [ '35.96666666666667', '-7.383333333333334' ],
    [ '35.96666666666667', '-12' ],
    [ '32.25', '-14.633333333333333' ],
    [ '33.92500000', '-18.06916667' ],
    [ '36.5', '-15' ],
    [ '42', '-15' ],
    [ '43', '-13' ]
];
L.polyline(Lisbon, { color: '#777', weight: 0.5 }).addTo(map);

const SantaMaria = [
    [ '45', '-40' ],
    [ '45', '-13' ],
    [ '43', '-13' ],
    [ '42', '-15' ],
    [ '36.5', '-15' ],
    [ '33.92500000', '-18.06916667' ],
    [ '30', '-20' ],
    [ '30', '-25' ],
    [ '24', '-25' ],
    [ '17', '-37.5' ],
    [ '22.3', '-40' ],
    [ '44', '-40' ]
];
L.polyline(SantaMaria, { color: '#777', weight: 0.5 }).addTo(map);

const NewYork = [
    [ '44', '-40' ],
    [ '22.3', '-40' ],
    [ '18', '-45' ],
    [ '18', '-61.5' ],
    [ '38.331222', '-70.059528' ],
    [ '39', '-67' ],
    [ '42', '-67' ],
    [ '43.446666666666665', '-56.05166666666666' ],
    [ '44', '-50' ],
    [ '44', '-40' ]
];
L.polyline(NewYork, { color: '#777', weight: 0.5 }).addTo(map);
    //Create plane markers and controllers
    planes.forEach(function (plane) {
        let markerIcon = L.icon({
            iconUrl: '/img/planes/base.png',
            iconSize: [30, 30],
            iconAnchor: [2,4]
        });
       var marker = L.marker([plane.latitude, plane.longitude], {rotationAngle: plane.heading, icon:markerIcon}).addTo(map);
       marker.bindPopup(`<h4>${plane.callsign}</h4><br>${plane.realname} ${plane.cid}<br>${plane.planned_depairport} to ${plane.planned_destairport}<br>${plane.planned_aircraft}`)
    });
    if(ganderControllers.length > 0) {
        console.log('test');
        var ganderOca = L.polygon([
            [45.0, -30],
            [45.0, -40],
            [45,-51],
            [49,-51],
            [52.39, -53.44],
            [53, -54],
            [57,-59],
            [58.28,-60.21],
            [64,-63],
            [65, -60],
            [65,-57.45],
            [63.3,-55.5],
            [58.3,-50],
            [58.3, -43],
            [63.3, -39],
            [61,-30]
        ]).addTo(map);
        ganderOca.bindPopup('<h3>Gander OCA online</h3>')
    }
    if (shanwickControllers.length > 0) {
        var shanwickOca = L.polygon([
            [61.0, -30],
            [61.0, -10],
            [57.0, -10],
            [57.0, -15],
            [49.0,-15],
            [48.49, -8],
            [45.0, -8],
            [45.0, -30]
        ]).addTo(map);
        shanwickOca.bindPopup('<h3>Shanwick OCA online</h3>')
    }

    //Get tracks
    let api = "https://api.flightplandatabase.com/nav/NATS";
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", api, false);
    xmlHttp.send(null);
    let apiString = xmlHttp.responseText;
    let apiJson = JSON.parse(apiString);
    console.log(apiJson);

    //Go through all the tracks
    for (track in apiJson) {
        //Go through the tracks and only use the good ones...
        if (checkIfNatProcessed(apiJson[track].ident) == false) {
            processedNats.push(apiJson[track].ident);
            //Create some markers
            let fixArray = [];
            for (n in apiJson[track].route.nodes) {/*
                if (apiJson[track].route.eastLevels.length == 0) {
                    createMarker(apiJson[track].route.nodes[n], apiJson[track].ident, 'orange');
                }
                else
                {
                    createMarker(apiJson[track].route.nodes[n], apiJson[track].ident, 'blue');
                } */
                fixArray.push([apiJson[track].route.nodes[n].lat, apiJson[track].route.nodes[n].lon]);
            }
            let polyline = new L.Polyline(fixArray, {
                color: '#616161 ',
                weight: 2,
                opacity: 1,
                smoothFactor: 1
            });
            if (apiJson[track].route.eastLevels.length == 0) {
                polyline.setStyle({
                    color: '#757575 '
                });
            }
            polyline.addTo(map);
        };
    }

    let table = document.getElementById('natTrackTable');
    processedNats = [];
    for (track in apiJson) {
        if (checkIfNatProcessed(apiJson[track].ident) == false) {
            processedNats.push(apiJson[track].ident);
            //Create a row
            let row = document.createElement('tr');
            table.appendChild(row);

            //Get the track ID
            let identCol = document.createElement('th');
            identCol.scope = 'row';
            identCol.innerHTML = apiJson[track].ident;
            row.appendChild(identCol);

            //Get the fixes
            let fixArray = [];
            for (n in apiJson[track].route.nodes) {
                fixArray.push(" " + apiJson[track].route.nodes[n].ident);
            }
            let fixesCol = document.createElement('td');
            fixesCol.innerHTML = fixArray;
            row.appendChild(fixesCol);

            //figure out the direction and get levels
            let levelArray = [];
            let directionCol = document.createElement('td');
            let levelsCol = document.createElement('td');
            if (apiJson[track].route.eastLevels.length == 0) {
                apiJson[track].route.westLevels.forEach(function (element) {
                    levelArray.push(" " + element);
                });
                directionCol.innerHTML = "West";
            } else {
                apiJson[track].route.eastLevels.forEach(function (element) {
                    levelArray.push(" " + element);
                });
                directionCol.innerHTML = "East";
            }
            levelsCol.innerHTML = levelArray;
            row.appendChild(directionCol);
            row.appendChild(levelsCol);

            //validity
            let validityCol = document.createElement('td');
            let validFrom = " " + apiJson[track].validFrom;
            let validTo = apiJson[track].validTo;
            validityCol.innerHTML = validFrom + " to " + validTo;
            row.appendChild(validityCol);
        };
    }
}


function createNatTrackMap()
{
    const map = L.map('map', { minZoom: 4, maxZoom: 7 }).setView([52, -35], 1);
    const icon = L.icon({ iconUrl: '/img/oep.png', iconAnchor: [5, 5] });

    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //Get tracks
    let api = "https://api.flightplandatabase.com/nav/NATS";
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", api, false);
    xmlHttp.send(null);
    let apiString = xmlHttp.responseText;
    let apiJson = JSON.parse(apiString);
    console.log(apiJson);

    //Go through all the tracks
    for (track in apiJson) {
        //Go through the tracks and only use the good ones...
        if (checkIfNatProcessed(apiJson[track].ident) == false) {
            processedNats.push(apiJson[track].ident);
            //Create some markers
            let fixArray = [];
            for (n in apiJson[track].route.nodes) {
                if (apiJson[track].route.eastLevels.length == 0) {
                    createMarker(apiJson[track].route.nodes[n], apiJson[track].ident, 'orange', map);
                }
                else
                {
                    createMarker(apiJson[track].route.nodes[n], apiJson[track].ident, 'blue', map);
                }
                fixArray.push([apiJson[track].route.nodes[n].lat, apiJson[track].route.nodes[n].lon]);
            }
            let polyline = new L.Polyline(fixArray,{
                color: '#1c5fc9',
                weight: 2,
                opacity: 1,
                smoothFactor: 1
            });
            if (apiJson[track].route.eastLevels.length == 0) {
                polyline.setStyle({
                    color: '#c92d1c'
                });
            }
            polyline.addTo(map);
        };
    }

    let table = document.getElementById('natTrackTable');
    processedNats = [];
    for (track in apiJson) {
        if (checkIfNatProcessed(apiJson[track].ident) == false) {
            processedNats.push(apiJson[track].ident);
            //Create a row
            let row = document.createElement('tr');
            table.appendChild(row);

            //Get the track ID
            let identCol = document.createElement('th');
            identCol.scope = 'row';
            identCol.innerHTML = apiJson[track].ident;
            row.appendChild(identCol);

            //Get the fixes
            let fixArray = [];
            for (n in apiJson[track].route.nodes) {
                fixArray.push(" " + apiJson[track].route.nodes[n].ident);
            }
            let fixesCol = document.createElement('td');
            fixesCol.innerHTML = fixArray;
            row.appendChild(fixesCol);

            //figure out the direction and get levels
            let levelArray = [];
            let directionCol = document.createElement('td');
            let levelsCol = document.createElement('td');
            if (apiJson[track].route.eastLevels.length == 0) {
                apiJson[track].route.westLevels.forEach(function (element) {
                    levelArray.push(" " + element);
                });
                directionCol.innerHTML = "West";
            } else {
                apiJson[track].route.eastLevels.forEach(function (element) {
                    levelArray.push(" " + element);
                });
                directionCol.innerHTML = "East";
            }
            levelsCol.innerHTML = levelArray;
            row.appendChild(directionCol);
            row.appendChild(levelsCol);

            //validity
            let validityCol = document.createElement('td');
            let validFrom = " " + apiJson[track].validFrom;
            let validTo = apiJson[track].validTo;
            validityCol.innerHTML = validFrom + " to " + validTo;
            row.appendChild(validityCol);
        };
    }

    L.latlngGraticule({
        showLabel: true,
        dashArray: [5, 5],
        zoomInterval: [ { start: 0, end: 10, interval: 5 } ]
    }).addTo(map);

    // OCA's, FIR's and delegated areas

    const Gander = [
        [ '45', '-51' ],
        [ '45', '-50' ],
        [ '44', '-50' ],
        [ '44', '-40' ],
        [ '45', '-40' ],
        [ '45', '-30' ],
        [ '61', '-30' ],
        [ '63.5', '-39' ],
        [ '58.5', '-43' ],
        [ '58.5', '-50' ],
        [ '65', '-57.75' ],
        [ '65', '-60' ],
        [ '64', '-63' ],
        [ '61', '-63' ],
        [ '58.471111111111114', '-60.35111111111111' ],
        [ '57', '-59' ],
        [ '53', '-54' ],
        [ '49', '-51' ],
        [ '45', '-51' ]
    ];
    L.polyline(Gander, { color: '#777', weight: 0.5 }).addTo(map);

    const Shanwick = [
        [ '45', '-30' ],
        [ '45', '-8' ],
        [ '51', '-8' ],
        [ '51', '-15' ],
        [ '54', '-15' ],
        [ '54.56666666666667', '-10' ],
        [ '61', '-10' ],
        [ '61', '-30' ],
        [ '45', '-30' ]
    ];
    L.polyline(Shanwick, { color: '#777', weight: 0.5 }).addTo(map);

    const NOTA = [
        [ '54', '-15' ],
        [ '54.56666666666667', '-10' ],
        [ '57', '-10' ],
        [ '57', '-15' ],
        [ '54', '-15' ]
    ];
    L.polyline(NOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const SOTA = [
        [ '49', '-15' ],
        [ '48.5769444444', '-8.75' ],
        [ '48.5769444444', '-8' ],
        [ '51', '-8' ],
        [ '51', '-15' ],
        [ '49', '-15' ]
    ];
    L.polyline(SOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const BOTA = [
        [ '45', '-8.75' ],
        [ '45', '-8' ],
        [ '48.5769444444', '-8' ],
        [ '48.5769444444', '-8.75' ],
        [ '45', '-8.75' ]
    ];
    L.polyline(BOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const GOTA = [
        [ '53.8', '-55' ],
        [ '62.85', '-55' ],
        [ '65', '-57.75' ],
        [ '65', '-60' ],
        [ '64', '-63' ],
        [ '61', '-63' ],
        [ '57', '-59' ],
        [ '53.8', '-55' ]
    ];
    L.polyline(GOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const Nuuk = [
        [ '58.5', '-50' ],
        [ '58.5', '-43' ],
        [ '63.5', '-39' ],
        [ '63.5', '-55.80928' ],
        [ '58.5', '-50' ]
    ];
    L.polyline(Nuuk, { color: '#777', weight: 0.5 }).addTo(map);

    const GanderDomestic = [
        [ '45', '-51' ],
        [ '45', '-53' ],
        [ '44.446666666666665', '-56.05166666666666' ],
        [ '45.61194444444445', '-56.47361111111111' ],
        [ '48.5', '-62' ],
        [ '49.3', '-61' ],
        [ '49.53333333333333', '-61' ],
        [ '51', '-58' ],
        [ '51.28333333333333', '-57' ],
        [ '51.735', '-57' ],
        [ '52.19638888888888', '-58.14277777777778' ],
        [ '51.63333333333333', '-59.5' ],
        [ '51.333333333333336', '-59.5' ],
        [ '50.833333333333336', '-60' ],
        [ '50.833333333333336', '-62.083333333333336' ],
        [ '51.416666666666664', '-64' ],
        [ '53.7', '-64.91666666666667' ],
        [ '54.416666666666664', '-65.33333333333333' ],
        [ '55.083333333333336', '-65.08333333333333' ],
        [ '55.355555555555554', '-64' ],
        [ '57.55', '-64' ],
        [ '58.471111111111114', '-60.35111111111111' ],
        [ '57', '-59' ],
        [ '53', '-54' ],
        [ '49', '-51' ],
        [ '45', '-51' ]
    ];
    L.polyline(GanderDomestic, { color: '#777', weight: 0.5 }).addTo(map);

    const GanderDomesticDelegated = [
        [ '53.0833333333', '-54.0833333333' ],
        [ '49', '-51' ],
        [ '45', '-51' ],
        [ '45', '-53' ],
        [ '44.446666666666665', '-56.05166666666666' ],
        [ '43.446666666666665', '-56.05166666666666' ],
        [ '44', '-50' ],
        [ '50', '-50' ],
        [ '53.0833333333', '-54.0833333333' ]
    ];
    L.polyline(GanderDomesticDelegated, { color: '#777', weight: 0.5 }).addTo(map);

    const Moncton = [
        [ '44.446666666666665', '-56.05166666666666' ],
        [ '43.6', '-60' ],
        [ '41.86666666666667', '-67' ],
        [ '44.5', '-67' ],
        [ '44.5', '-67.11666666666666' ],
        [ '44.776666666666664', '-66.9025' ],
        [ '47.2875', '-68.57666666666667' ],
        [ '47.525277777777774', '-68' ],
        [ '47.733333333333334', '-67.95' ],
        [ '47.88333333333333', '-66.89666666666668' ],
        [ '48', '-65.94111111111111' ],
        [ '47.848333333333336', '-64.62222222222222' ],
        [ '48.5', '-62' ],
        [ '45.61194444444445', '-56.47361111111111' ],
        [ '44.446666666666665', '-56.05166666666666' ]
    ];
    L.polyline(Moncton, { color: '#777', weight: 0.5 }).addTo(map);

    const Montreal = [
        [ '47.459833333333336', '-69.22444444444444' ],
        [ '44.22141666666667', '-76.19172222222223' ],
        [ '45.837500000000006', '-76.26666666666667' ],
        [ '45.961111111111116', '-76.92777777777778' ],
        [ '46.13333333333333', '-77.25' ],
        [ '46.94688055555555', '-77.25' ],
        [ '47.11110277777778', '-77.54586388888889' ],
        [ '47.55425833333333', '-78.11756944444444' ],
        [ '47.84006388888889', '-78.56570555555555' ],
        [ '48.587047222222225', '-79' ],
        [ '49', '-79' ],
        [ '53.46666666666667', '-80' ],
        [ '62.75', '-80' ],
        [ '65', '-68' ],
        [ '65', '-60' ],
        [ '64', '-63' ],
        [ '61', '-63' ],
        [ '58.471111111111114', '-60.35111111111111' ],
        [ '57.55', '-64' ],
        [ '55.355555555555554', '-64' ],
        [ '55.083333333333336', '-65.08333333333333' ],
        [ '54.416666666666664', '-65.33333333333333' ],
        [ '53.7', '-64.91666666666667' ],
        [ '51.416666666666664', '-64' ],
        [ '50.833333333333336', '-62.083333333333336' ],
        [ '50.833333333333336', '-60' ],
        [ '51.333333333333336', '-59.5' ],
        [ '51.63333333333333', '-59.5' ],
        [ '52.19638888888888', '-58.14277777777778' ],
        [ '51.735', '-57' ],
        [ '51.28333333333333', '-57' ],
        [ '51', '-58' ],
        [ '49.53333333333333', '-61' ],
        [ '49.3', '-61' ],
        [ '48.5', '-62' ],
        [ '47.848333333333336', '-64.62222222222222' ],
        [ '48', '-65.94111111111111' ],
        [ '47.88333333333333', '-66.89666666666668' ]
    ];
    L.polyline(Montreal, { color: '#777', weight: 0.5 }).addTo(map);

    const Edmonton = [
        [ '65', '-57.75' ],
        [ '73', '-69.92' ],
        [ '73', '-80' ],
        [ '64.40833333333335', '-80' ],
        [ '62.75', '-80' ],
        [ '65', '-68' ],
        [ '65', '-60' ]

    ];
    L.polyline(Edmonton, { color: '#777', weight: 0.5 }).addTo(map);

    const Reykjavik = [
        [ '63.5', '-55.80928' ],
        [ '63.5', '-39' ],
        [ '61', '-30' ],
        [ '61', '0' ],
        [ '73', '0' ],
        [ '73', '-69.92' ],
        [ '63.5', '-55.80928' ]

    ];
    L.polyline(Reykjavik, { color: '#777', weight: 0.5 }).addTo(map);

    const Scottish = [
        [ '61', '0' ],
        [ '60', '0' ],
        [ '57', '5' ],
        [ '55', '5' ],
        [ '55', '-5.5' ],
        [ '53.916666666666664', '-5.5' ],
        [ '54.416666666666664', '-8.166666666666666' ],
        [ '55.333333333333336', '-6.916666666666667' ],
        [ '55.416666666666664', '-7.333333333333333' ],
        [ '55.333333333333336', '-8.25' ],
        [ '54.75', '-9' ],
        [ '54.56666666666667', '-10' ],
        [ '61', '-10' ],
        [ '61', '0' ]
    ];
    L.polyline(Scottish, { color: '#777', weight: 0.5 }).addTo(map);

    const London = [
        [ '55', '5' ],
        [ '51.5', '2' ],
        [ '51.11666666666667', '2' ],
        [ '51', '1.4666666666666668' ],
        [ '50.666666666666664', '1.4666666666666668' ],
        [ '50', '-0.25' ],
        [ '50', '-2' ],
        [ '48.833333333333336', '-8' ],
        [ '51', '-8' ],
        [ '52.333333333333336', '-5.5' ],
        [ '55', '-5.5' ],
        [ '55', '5' ]
    ];
    L.polyline(London, { color: '#777', weight: 0.5 }).addTo(map);

    const Brest = [
        [ '50', '-0.25' ],
        [ '46.5', '-0.25' ],
        [ '46.5', '-1.6333333333333333' ],
        [ '43.583333333333336', '-1.7833333333333332' ],
        [ '44.333333333333336', '-4' ],
        [ '45', '-8' ],
        [ '48.833333333333336', '-8' ],
        [ '50', '-2' ],
        [ '50', '-0.25' ]
    ];
    L.polyline(Brest, { color: '#777', weight: 0.5 }).addTo(map);

    const Madrid = [
        [ '45', '-13' ],
        [ '45', '-8' ],
        [ '44.333333333333336', '-4' ],
        [ '43.583333333333336', '-1.7833333333333332' ],
        [ '43.38333333333333', '-1.7833333333333332' ],
        [ '42.7', '-0.06666666666666667' ],
        [ '39.733333333333334', '-1.1' ],
        [ '35.833333333333336', '-2.1' ],
        [ '35.833333333333336', '-7.383333333333334' ],
        [ '35.96666666666667', '-7.383333333333334' ],
        [ '42', '-10' ],
        [ '43', '-13' ],
        [ '45', '-13' ]
    ];
    L.polyline(Madrid, { color: '#777', weight: 0.5 }).addTo(map);

    const Lisbon = [
        [ '43', '-13' ],
        [ '42', '-10' ],
        [ '35.96666666666667', '-7.383333333333334' ],
        [ '35.96666666666667', '-12' ],
        [ '32.25', '-14.633333333333333' ],
        [ '33.92500000', '-18.06916667' ],
        [ '36.5', '-15' ],
        [ '42', '-15' ],
        [ '43', '-13' ]
    ];
    L.polyline(Lisbon, { color: '#777', weight: 0.5 }).addTo(map);

    const SantaMaria = [
        [ '45', '-40' ],
        [ '45', '-13' ],
        [ '43', '-13' ],
        [ '42', '-15' ],
        [ '36.5', '-15' ],
        [ '33.92500000', '-18.06916667' ],
        [ '30', '-20' ],
        [ '30', '-25' ],
        [ '24', '-25' ],
        [ '17', '-37.5' ],
        [ '22.3', '-40' ],
        [ '44', '-40' ]
    ];
    L.polyline(SantaMaria, { color: '#777', weight: 0.5 }).addTo(map);

    const NewYork = [
        [ '44', '-40' ],
        [ '22.3', '-40' ],
        [ '18', '-45' ],
        [ '18', '-61.5' ],
        [ '38.331222', '-70.059528' ],
        [ '39', '-67' ],
        [ '42', '-67' ],
        [ '43.446666666666665', '-56.05166666666666' ],
        [ '44', '-50' ],
        [ '44', '-40' ]
    ];
    L.polyline(NewYork, { color: '#777', weight: 0.5 }).addTo(map);
}


function checkIfNatProcessed(ident) {
    if (processedNats.indexOf(ident) > -1) {
        return true;
    } else {
        return false;
    }
}


function createMarker(node, trackId, colour, map) {
    let markerIcon = L.icon({
        iconUrl: 'https://nesa.com.au/wp-content/uploads/2017/05/Dot-points-1.png',
        iconSize: [10, 10],
        iconAnchor: [2, 4]
    });
    let marker = L.marker([node.lat, node.lon], {icon: markerIcon}).addTo(map);
    marker.bindPopup("<b>"+node.ident+"</b><br/>"+node.type+"<br/>"+node.lat+" "+node.lon+"<br>Track "+trackId);
}

function createAboutPageMap() {
    const map = L.map('aboutPageMap').setView([55, -30], 3.48);
    const icon = L.icon({ iconUrl: '/img/oep.png', iconAnchor: [5, 5] });

    var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Gander OEP's

    const pointsGander = [
        ['AVPUT', [ '65.03333333333333', '-60' ]],
        ['CLAVY', [ '64.23333333333333', '-59' ]],
        ['EMBOK', [ '63.46666666666667', '-58' ]],
        ['KETLA', [ '62.46666666666667', '-58' ]],
        ['LIBOR', [ '61.96666666666667', '-58' ]],
        ['MAXAR', [ '61.46666666666667', '-58' ]],
        ['NIFTY', [ '60.96666666666667', '-58' ]],
        ['PIDSO', [ '60.46666666666667', '-58' ]],
        ['RADUN', [ '59.96666666666667', '-58' ]],
        ['SAVRY', [ '59.46666666666667', '-58' ]],
        ['TOXIT', [ '58.96666666666667', '-58' ]],
        ['URTAK', [ '58.46666666666667', '-58' ]],
        ['VESMI', [ '57.96666666666667', '-58' ]],
        ['AVUTI', [ '57.46666666666667', '-58' ]],
        ['BOKTO', [ '56.96666666666667', '-58' ]],
        ['CUDDY', [ '56.7', '-57' ]],
        ['DORYY', [ '56.03333333333333', '-57' ]],
        ['ENNSO', [ '55.53333333333333', '-57' ]],
        ['HOIST', [ '55.03333333333333', '-57' ]],
        ['IRLOK', [ '54.53333333333333', '-57' ]],
        ['JANJO', [ '54.03333333333333', '-57' ]],
        ['KODIK', [ '53.46666666666667', '-57.2' ]],
        ['LOMSI', [ '53.1', '-56.78333333333333' ]],
        ['MELDI', [ '52.733333333333334', '-56.35' ]],
        ['NEEKO', [ '52.4', '-55.833333333333336' ]],
        ['PELTU', [ '52.1', '-55.166666666666664' ]],
        ['RIKAL', [ '51.8', '-54.53333333333333' ]],
        ['SAXAN', [ '51.483333333333334', '-53.85' ]],
        ['TUDEP', [ '51.166666666666664', '-53.233333333333334' ]],
        ['UMESI', [ '50.833333333333336', '-52.6' ]],
        ['ALLRY', [ '50.5', '-52' ]],
        ['BUDAR', [ '50', '-52' ]],
        ['ELSIR', [ '49.5', '-52' ]],
        ['IBERG', [ '49', '-52' ]],
        ['JOOPY', [ '48.5', '-52' ]],
        ['MUSAK', [ '48', '-52' ]],
        ['NICSO', [ '47.5', '-52' ]],
        ['OMSAT', [ '47', '-52' ]],
        ['PORTI', [ '46.5', '-52' ]],
        ['RELIC', [ '46', '-52' ]],
        ['SUPRY', [ '45.5', '-52' ]],
        ['RAFIN', [ '44.88333333333333', '-51.80472222222222' ]],
        ['JAROM', [ '44.166666666666664', '-54.88333333333333' ]],
        ['BOBTU', [ '44.117222222222225', '-52.82222222222222' ]]
    ];

    pointsGander.forEach(point => {
        L.marker([parseFloat(point[1][0]), parseFloat(point[1][1])], {icon: icon, opacity: 0.3}).addTo(map).bindPopup(point[0]);
    });

    // Shanwick OEP's

    const pointsShanwick = [
        ['RATSU', [ '61', '-10' ]],
        ['LUSEN', [ '60.5', '-10' ]],
        ['ATSIX', [ '60', '-10' ]],
        ['ORTAV', [ '59.5', '-10' ]],
        ['BALIX', [ '59', '-10' ]],
        ['ADODO', [ '58.5', '-10' ]],
        ['ERAKA', [ '58', '-10' ]],
        ['ETILO', [ '57.5', '-10' ]],
        ['GOMUP', [ '57', '-10' ]],
        ['AGORI', [ '57', '-13' ]],
        ['SUNOT', [ '57', '-15' ]],
        ['BILTO', [ '56.5', '-15' ]],
        ['PIKIL', [ '56', '-15' ]],
        ['ETARI', [ '55.5', '-15' ]],
        ['RESNO', [ '55', '-15' ]],
        ['VENER', [ '54.5', '-15' ]],
        ['DOGAL', [ '54', '-15' ]],
        ['NEBIN', [ '53.5', '-15' ]],
        ['MALOT', [ '53', '-15' ]],
        ['TOBOR', [ '52.5', '-15' ]],
        ['LIMRI', [ '52', '-15' ]],
        ['ADARA', [ '51.5', '-15' ]],
        ['DINIM', [ '51', '-15' ]],
        ['RODEL', [ '50.5', '-15' ]],
        ['SOMAX', [ '50', '-15' ]],
        ['KOGAD', [ '49.5', '-15' ]],
        ['BEDRA', [ '49', '-15' ]],
        ['NERTU', [ '49', '-14' ]],
        ['NASBA', [ '49', '-13' ]],
        ['OMOKO', [ '48.83888888888889', '-12' ]],
        ['TAMEL', [ '48.728611111111114', '-10.497222222222222' ]],
        ['GELPO', [ '48.64416666666666', '-9.5025' ]],
        ['LASNO', [ '48.598333333333336', '-9' ]],
        ['ETIKI', [ '48', '-8.75' ]],
        ['UMLER', [ '47.5', '-8.75' ]],
        ['SEPAL', [ '47', '-8.75' ]],
        ['BUNAV', [ '46.5', '-8.75' ]],
        ['SIVIR', [ '46', '-8.75' ]],
        ['BEGAS', [ '45', '-9' ]],
        ['DIVAT', [ '45', '-9.469722222222222' ]],
        ['DIXIS', [ '45', '-10' ]],
        ['BERUX', [ '45', '-11' ]],
        ['PITAX', [ '45', '-12' ]],
        ['PASAS', [ '45', '-13' ]],
        ['NILAV', [ '45', '-13.416666666666666' ]],
        ['GONAN', [ '45', '-14' ]]
    ];

    pointsShanwick.forEach(point => {
        L.marker([parseFloat(point[1][0]), parseFloat(point[1][1])], {icon: icon, opacity: 0.3}).addTo(map).bindPopup(point[0], {permanent:true});
    });

    // Coordinate grid

    L.latlngGraticule({
        showLabel: true,
        dashArray: [5, 5],
        zoomInterval: [ { start: 0, end: 10, interval: 5 } ]
    }).addTo(map);

    // OCA's, FIR's and delegated areas

    const Gander = [
        [ '45', '-51' ],
        [ '45', '-50' ],
        [ '44', '-50' ],
        [ '44', '-40' ],
        [ '45', '-40' ],
        [ '45', '-30' ],
        [ '61', '-30' ],
        [ '63.5', '-39' ],
        [ '58.5', '-43' ],
        [ '58.5', '-50' ],
        [ '65', '-57.75' ],
        [ '65', '-60' ],
        [ '64', '-63' ],
        [ '61', '-63' ],
        [ '58.471111111111114', '-60.35111111111111' ],
        [ '57', '-59' ],
        [ '53', '-54' ],
        [ '49', '-51' ],
        [ '45', '-51' ]
    ];
    L.polyline(Gander, { color: '#777', weight: 0.5 }).addTo(map);

    const Shanwick = [
        [ '45', '-30' ],
        [ '45', '-8' ],
        [ '51', '-8' ],
        [ '51', '-15' ],
        [ '54', '-15' ],
        [ '54.56666666666667', '-10' ],
        [ '61', '-10' ],
        [ '61', '-30' ],
        [ '45', '-30' ]
    ];
    L.polyline(Shanwick, { color: '#777', weight: 0.5 }).addTo(map);

    const NOTA = [
        [ '54', '-15' ],
        [ '54.56666666666667', '-10' ],
        [ '57', '-10' ],
        [ '57', '-15' ],
        [ '54', '-15' ]
    ];
    L.polyline(NOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const SOTA = [
        [ '49', '-15' ],
        [ '48.5769444444', '-8.75' ],
        [ '48.5769444444', '-8' ],
        [ '51', '-8' ],
        [ '51', '-15' ],
        [ '49', '-15' ]
    ];
    L.polyline(SOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const BOTA = [
        [ '45', '-8.75' ],
        [ '45', '-8' ],
        [ '48.5769444444', '-8' ],
        [ '48.5769444444', '-8.75' ],
        [ '45', '-8.75' ]
    ];
    L.polyline(BOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const GOTA = [
        [ '53.8', '-55' ],
        [ '62.85', '-55' ],
        [ '65', '-57.75' ],
        [ '65', '-60' ],
        [ '64', '-63' ],
        [ '61', '-63' ],
        [ '57', '-59' ],
        [ '53.8', '-55' ]
    ];
    L.polyline(GOTA, { color: '#777', weight: 0.5 }).addTo(map);

    const Nuuk = [
        [ '58.5', '-50' ],
        [ '58.5', '-43' ],
        [ '63.5', '-39' ],
        [ '63.5', '-55.80928' ],
        [ '58.5', '-50' ]
    ];
    L.polyline(Nuuk, { color: '#777', weight: 0.5 }).addTo(map);

    const GanderDomestic = [
        [ '45', '-51' ],
        [ '45', '-53' ],
        [ '44.446666666666665', '-56.05166666666666' ],
        [ '45.61194444444445', '-56.47361111111111' ],
        [ '48.5', '-62' ],
        [ '49.3', '-61' ],
        [ '49.53333333333333', '-61' ],
        [ '51', '-58' ],
        [ '51.28333333333333', '-57' ],
        [ '51.735', '-57' ],
        [ '52.19638888888888', '-58.14277777777778' ],
        [ '51.63333333333333', '-59.5' ],
        [ '51.333333333333336', '-59.5' ],
        [ '50.833333333333336', '-60' ],
        [ '50.833333333333336', '-62.083333333333336' ],
        [ '51.416666666666664', '-64' ],
        [ '53.7', '-64.91666666666667' ],
        [ '54.416666666666664', '-65.33333333333333' ],
        [ '55.083333333333336', '-65.08333333333333' ],
        [ '55.355555555555554', '-64' ],
        [ '57.55', '-64' ],
        [ '58.471111111111114', '-60.35111111111111' ],
        [ '57', '-59' ],
        [ '53', '-54' ],
        [ '49', '-51' ],
        [ '45', '-51' ]
    ];
    L.polyline(GanderDomestic, { color: '#777', weight: 0.5 }).addTo(map);

    const GanderDomesticDelegated = [
        [ '53.0833333333', '-54.0833333333' ],
        [ '49', '-51' ],
        [ '45', '-51' ],
        [ '45', '-53' ],
        [ '44.446666666666665', '-56.05166666666666' ],
        [ '43.446666666666665', '-56.05166666666666' ],
        [ '44', '-50' ],
        [ '50', '-50' ],
        [ '53.0833333333', '-54.0833333333' ]
    ];
    L.polyline(GanderDomesticDelegated, { color: '#777', weight: 0.5 }).addTo(map);

    const Moncton = [
        [ '44.446666666666665', '-56.05166666666666' ],
        [ '43.6', '-60' ],
        [ '41.86666666666667', '-67' ],
        [ '44.5', '-67' ],
        [ '44.5', '-67.11666666666666' ],
        [ '44.776666666666664', '-66.9025' ],
        [ '47.2875', '-68.57666666666667' ],
        [ '47.525277777777774', '-68' ],
        [ '47.733333333333334', '-67.95' ],
        [ '47.88333333333333', '-66.89666666666668' ],
        [ '48', '-65.94111111111111' ],
        [ '47.848333333333336', '-64.62222222222222' ],
        [ '48.5', '-62' ],
        [ '45.61194444444445', '-56.47361111111111' ],
        [ '44.446666666666665', '-56.05166666666666' ]
    ];
    L.polyline(Moncton, { color: '#777', weight: 0.5 }).addTo(map);

    const Montreal = [
        [ '47.459833333333336', '-69.22444444444444' ],
        [ '44.22141666666667', '-76.19172222222223' ],
        [ '45.837500000000006', '-76.26666666666667' ],
        [ '45.961111111111116', '-76.92777777777778' ],
        [ '46.13333333333333', '-77.25' ],
        [ '46.94688055555555', '-77.25' ],
        [ '47.11110277777778', '-77.54586388888889' ],
        [ '47.55425833333333', '-78.11756944444444' ],
        [ '47.84006388888889', '-78.56570555555555' ],
        [ '48.587047222222225', '-79' ],
        [ '49', '-79' ],
        [ '53.46666666666667', '-80' ],
        [ '62.75', '-80' ],
        [ '65', '-68' ],
        [ '65', '-60' ],
        [ '64', '-63' ],
        [ '61', '-63' ],
        [ '58.471111111111114', '-60.35111111111111' ],
        [ '57.55', '-64' ],
        [ '55.355555555555554', '-64' ],
        [ '55.083333333333336', '-65.08333333333333' ],
        [ '54.416666666666664', '-65.33333333333333' ],
        [ '53.7', '-64.91666666666667' ],
        [ '51.416666666666664', '-64' ],
        [ '50.833333333333336', '-62.083333333333336' ],
        [ '50.833333333333336', '-60' ],
        [ '51.333333333333336', '-59.5' ],
        [ '51.63333333333333', '-59.5' ],
        [ '52.19638888888888', '-58.14277777777778' ],
        [ '51.735', '-57' ],
        [ '51.28333333333333', '-57' ],
        [ '51', '-58' ],
        [ '49.53333333333333', '-61' ],
        [ '49.3', '-61' ],
        [ '48.5', '-62' ],
        [ '47.848333333333336', '-64.62222222222222' ],
        [ '48', '-65.94111111111111' ],
        [ '47.88333333333333', '-66.89666666666668' ]
    ];
    L.polyline(Montreal, { color: '#777', weight: 0.5 }).addTo(map);

    const Edmonton = [
        [ '65', '-57.75' ],
        [ '73', '-69.92' ],
        [ '73', '-80' ],
        [ '64.40833333333335', '-80' ],
        [ '62.75', '-80' ],
        [ '65', '-68' ],
        [ '65', '-60' ]

    ];
    L.polyline(Edmonton, { color: '#777', weight: 0.5 }).addTo(map);

    const Reykjavik = [
        [ '63.5', '-55.80928' ],
        [ '63.5', '-39' ],
        [ '61', '-30' ],
        [ '61', '0' ],
        [ '73', '0' ],
        [ '73', '-69.92' ],
        [ '63.5', '-55.80928' ]

    ];
    L.polyline(Reykjavik, { color: '#777', weight: 0.5 }).addTo(map);

    const Scottish = [
        [ '61', '0' ],
        [ '60', '0' ],
        [ '57', '5' ],
        [ '55', '5' ],
        [ '55', '-5.5' ],
        [ '53.916666666666664', '-5.5' ],
        [ '54.416666666666664', '-8.166666666666666' ],
        [ '55.333333333333336', '-6.916666666666667' ],
        [ '55.416666666666664', '-7.333333333333333' ],
        [ '55.333333333333336', '-8.25' ],
        [ '54.75', '-9' ],
        [ '54.56666666666667', '-10' ],
        [ '61', '-10' ],
        [ '61', '0' ]
    ];
    L.polyline(Scottish, { color: '#777', weight: 0.5 }).addTo(map);

    const London = [
        [ '55', '5' ],
        [ '51.5', '2' ],
        [ '51.11666666666667', '2' ],
        [ '51', '1.4666666666666668' ],
        [ '50.666666666666664', '1.4666666666666668' ],
        [ '50', '-0.25' ],
        [ '50', '-2' ],
        [ '48.833333333333336', '-8' ],
        [ '51', '-8' ],
        [ '52.333333333333336', '-5.5' ],
        [ '55', '-5.5' ],
        [ '55', '5' ]
    ];
    L.polyline(London, { color: '#777', weight: 0.5 }).addTo(map);

    const Brest = [
        [ '50', '-0.25' ],
        [ '46.5', '-0.25' ],
        [ '46.5', '-1.6333333333333333' ],
        [ '43.583333333333336', '-1.7833333333333332' ],
        [ '44.333333333333336', '-4' ],
        [ '45', '-8' ],
        [ '48.833333333333336', '-8' ],
        [ '50', '-2' ],
        [ '50', '-0.25' ]
    ];
    L.polyline(Brest, { color: '#777', weight: 0.5 }).addTo(map);

    const Madrid = [
        [ '45', '-13' ],
        [ '45', '-8' ],
        [ '44.333333333333336', '-4' ],
        [ '43.583333333333336', '-1.7833333333333332' ],
        [ '43.38333333333333', '-1.7833333333333332' ],
        [ '42.7', '-0.06666666666666667' ],
        [ '39.733333333333334', '-1.1' ],
        [ '35.833333333333336', '-2.1' ],
        [ '35.833333333333336', '-7.383333333333334' ],
        [ '35.96666666666667', '-7.383333333333334' ],
        [ '42', '-10' ],
        [ '43', '-13' ],
        [ '45', '-13' ]
    ];
    L.polyline(Madrid, { color: '#777', weight: 0.5 }).addTo(map);

    const Lisbon = [
        [ '43', '-13' ],
        [ '42', '-10' ],
        [ '35.96666666666667', '-7.383333333333334' ],
        [ '35.96666666666667', '-12' ],
        [ '32.25', '-14.633333333333333' ],
        [ '33.92500000', '-18.06916667' ],
        [ '36.5', '-15' ],
        [ '42', '-15' ],
        [ '43', '-13' ]
    ];
    L.polyline(Lisbon, { color: '#777', weight: 0.5 }).addTo(map);

    const SantaMaria = [
        [ '45', '-40' ],
        [ '45', '-13' ],
        [ '43', '-13' ],
        [ '42', '-15' ],
        [ '36.5', '-15' ],
        [ '33.92500000', '-18.06916667' ],
        [ '30', '-20' ],
        [ '30', '-25' ],
        [ '24', '-25' ],
        [ '17', '-37.5' ],
        [ '22.3', '-40' ],
        [ '44', '-40' ]
    ];
    L.polyline(SantaMaria, { color: '#777', weight: 0.5 }).addTo(map);

    const NewYork = [
        [ '44', '-40' ],
        [ '22.3', '-40' ],
        [ '18', '-45' ],
        [ '18', '-61.5' ],
        [ '38.331222', '-70.059528' ],
        [ '39', '-67' ],
        [ '42', '-67' ],
        [ '43.446666666666665', '-56.05166666666666' ],
        [ '44', '-50' ],
        [ '44', '-40' ]
    ];
    L.polyline(NewYork, { color: '#777', weight: 0.5 }).addTo(map);
}


tabs = [
    'yourProfileTab',
    'supportTab',
    'certificationTrainingTab',
    'staffTab'
]

$(document).ready(function () {


    $(document).on('click','.myczqo-tab', function(element){
        tab = $(this).data("myczqo-tab")
        if (tab === "none") { return }
        //Hide every other tab
        tabs.forEach(element => {
            $(`#${element}`).hide();
        });
        //Show the tab
        $("#" + tab).show();
        //Make the current tab inactive
        $(".myczqo-tab.active").removeClass('active')
        //make new tab active
        $(".myczqo-tab[data-myczqo-tab="+tab+']').addClass('active')
    });
})
