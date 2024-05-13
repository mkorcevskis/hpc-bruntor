/* common constants and functions */
const DEFAULT_LAT = 56.95295889915936; // hardcoded approximate value in case of problems with geolocation
const DEFAULT_LON = 24.08111179928983; // hardcoded approximate value in case of problems with geolocation
const DEFAULT_ZOOM = 17;
const TILE_LAYER_DEFAULT_OPTIONS = {
    attribution: `<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap`,
    minZoom: 6,
    maxZoom: 19,
    tileSize: 256
}
const MONTH_COEFFICIENTS = [
    3.372158218,
    3.785835459,
    3.772528162,
    3.52859127,
    3.781799795,
    4.479751984,
    3.916977087,
    3.442603687,
    3.473611111,
    3.802042371,
    3.37003373,
    3.248527266,
]
const WEEKDAY_COEFFICIENTS = [
    3.940466651,
    3.805613553,
    3.496654075,
    3.594506639,
    3.790971841,
    3.587499237,
    3.429844265,
]
function pad(number) {
    if (number < 10) {
        return "0" + number;
    }
    return number;
}
class Package {
    constructor(id, lat, lon, addr, info) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.addr = addr;
        this.info = info;
    }
}

/* the script to execute when "Index" page is loaded */
function onLoadIndex() {

}

/* the script to execute when "Calculator" page is loaded */
function onLoadCalculator() {
    const FORM = document.getElementById("calc-form");
    let formData = {};
    FORM.addEventListener("submit", (evt) => {
        evt.preventDefault();
        for (let elem of FORM.elements) {
            if (elem.name && elem.value) {
                formData[elem.name] = elem.value;
            }
        }
        console.log(formData);

        const date = new Date(formData["input-date"]);
        const month = date.getMonth();
        const weekday = date.getDay();
        const coefficient = (MONTH_COEFFICIENTS[month] + WEEKDAY_COEFFICIENTS[weekday]) / 2;
        
        const hours = Math.round((parseFloat(formData["input-packages"]) / coefficient + Number.EPSILON) * 100) / 100;
        const workers = Math.ceil(hours / parseFloat(formData["input-hours"]));
        const hoursPerWorker = Math.round((hours / workers + Number.EPSILON) * 100) / 100;
        
        FORM.elements["output-hours"].value = hours;
        FORM.elements["output-workers"].value = workers;
        FORM.elements["output-hours-per-worker"].value = hoursPerWorker;
    });
}

/* the script to execute when "Map" page is loaded */
function onLoadMap() {
    const PACKAGES = [
        new Package(1, 56.945958053284635, 24.13622451418926, "Katoļu iela 22, Rīga, LV-1003", "Latvian Samaritan Association"),
        new Package(2, 56.94738910748402, 24.13685881146942, "Kurbada iela 8, Rīga, LV-1009", "Circle K Kurbada, DUS"),
        new Package(3, 56.94800589332437, 24.134442525513567, "Lāčplēša iela 101, Rīga, LV-1011", "Art center Zuzeum"),
        new Package(4, 56.950935117002864, 24.12704071904721, "Avotu iela 4, Rīga, LV-1011", "This Place Doesn't Need A Name Avotu"),
        new Package(5, 56.950151397408256, 24.119421144311108, "Krišjāņa Barona iela 8, Rīga, LV-1050", "Euroaptieka"),
    ];

    const MAP = L.map("map", {
        center: [DEFAULT_LAT, DEFAULT_LON],
        zoom: DEFAULT_ZOOM,
        layers: [L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", TILE_LAYER_DEFAULT_OPTIONS)]
    });
    MAP.addControl(new L.Control.Fullscreen());
    let packagesFeatureGroup = L.featureGroup({type: "packages"}).addTo(MAP);
    for (let obj of PACKAGES) {
        let marker = new L.marker([obj.lat, obj.lon]).addTo(packagesFeatureGroup).bindPopup("<b>" + obj.info + "</b><br>" + obj.addr);
    }
    MAP.invalidateSize();
    MAP.fitBounds(packagesFeatureGroup.getBounds().pad(0.1));
}

/* the script to execute when "About Us" page is loaded */
function onLoadAboutUs() {

}