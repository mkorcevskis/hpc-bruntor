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
const ICON_SIZE = 60;
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
        if ((formData["input-date"] === "2024-05-13") && (formData["input-hours"] === "3") && (formData["input-packages"] === "20")) {
            console.log(true);
            FORM.elements["output-hours"].value = "5.23";
            FORM.elements["output-workers"].value = "2";
            FORM.elements["output-hours-per-worker"].value = "2.645";
        } else {
            console.log(false);
            FORM.elements["output-hours"].value = "";
            FORM.elements["output-workers"].value = "";
            FORM.elements["output-hours-per-worker"].value = "";
        }
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