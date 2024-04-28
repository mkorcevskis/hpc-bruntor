/* the script to execute when "Index" page is loaded */
function onLoadIndex() {

}

/* the script to execute when "Calculator" page is loaded */
function onLoadCalculator() {

}

/* the script to execute when "Map" page is loaded */
function onLoadMap() {
    const MAP = L.map("map", {
        center: [DEFAULT_LAT, DEFAULT_LON],
        zoom: DEFAULT_ZOOM,
        layers: [L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", TILE_LAYER_DEFAULT_OPTIONS)]
    });
    MAP.addControl(new L.Control.Fullscreen());

    let alertsFeatureGroup = L.featureGroup({type: "alerts"});
    let workersFeatureGroup = L.featureGroup({type: "workers"});
    let problemsFeatureGroup = L.featureGroup({type: "problems"});
    let polylinesFeatureGroup = L.featureGroup({type: "polylines"});
    alertsFeatureGroup.addTo(MAP);
    workersFeatureGroup.addTo(MAP);
    problemsFeatureGroup.addTo(MAP);
    polylinesFeatureGroup.addTo(MAP);

    let PROBLEM_STATUS_CHOICES = [];
    const CHOICES = document.getElementById("problem-status-choices").getElementsByTagName("span");
    for (let elem of CHOICES) {
        PROBLEM_STATUS_CHOICES.push({
            value: elem.getAttribute("data-value"),
            name: elem.getAttribute("data-name")
        });
    }

    const ALERTS = document.getElementById("alerts").getElementsByTagName("span");
    for (let elem of ALERTS) {
        let marker = new L.marker([elem.getAttribute("data-alert-latitude"), elem.getAttribute("data-alert-longitude")], {icon: createCustomDivIconClass(elem.getAttribute("data-alert-status-code"), "alert")}).addTo(alertsFeatureGroup);
        const DISPLAY_TEXT = `<div class="leaflet-popup-content-row"><span>Type</span><span>Alert</span></div>` +
            `<div class="leaflet-popup-content-row problem-location"><span>Location</span><span>` + elem.getAttribute("data-alert-latitude") + " / " + elem.getAttribute("data-alert-longitude") + `</span><span class="leaflet-popup-content-subrow"><i class="bi bi-info-circle-fill"></i>Station: ` + elem.getAttribute("data-alert-station") + `</span></div>` +
            `<div class="leaflet-popup-content-row"><span>Added By</span><span>` + elem.getAttribute("data-alert-user") + `</span></div>` +
            `<div class="leaflet-popup-content-row"><span>Status</span><span class="leaflet-popup-content-subrow ` + elem.getAttribute("data-alert-status-code") + `"><i class="bi bi-circle-fill"></i>` + elem.getAttribute("data-alert-status") + `</span></div>` +
            `<div class="leaflet-popup-content-row"><a href="/platform/issue/` + elem.getAttribute("data-alert-id") + `" target="_blank" rel="noopener noreferrer" class="filled">View Details</a></div>`;
        marker.bindPopup(DISPLAY_TEXT);
    }
    const WORKER_COLUMN = document.getElementById("online-worker-col");
    const WORKERS = document.getElementsByClassName("online-worker");
    for (let elem of WORKERS) {
        if (elem.getAttribute("data-worker-latitude").length !== 0 && elem.getAttribute("data-worker-longitude").length !== 0) {
            let marker = new L.marker([elem.getAttribute("data-worker-latitude"), elem.getAttribute("data-worker-longitude")], {icon: createCustomDivIconClass(elem.querySelector("img").getAttribute("src"), "user")}).addTo(workersFeatureGroup);
            marker.getElement().id = "marker-worker-id-" + elem.getAttribute("data-worker-id");
        }
        elem.addEventListener("click", (e) => {
            if (e.currentTarget.getAttribute("data-worker-id") !== WORKER_COLUMN.getAttribute("data-active-worker-id")) {
                if (e.currentTarget.getAttribute("data-worker-latitude").length === 0 && e.currentTarget.getAttribute("data-worker-longitude").length === 0) {
                    e.preventDefault();
                    showModalAlert();
                }
                document.getElementById("online-worker-first-name").textContent = e.currentTarget.getAttribute("data-worker-first-name");
                document.getElementById("online-worker-last-name").textContent = e.currentTarget.getAttribute("data-worker-last-name");
                document.getElementById("online-worker-problems-list").textContent = "";
                //
                const CURRENT_DATE = new Date();
                const TIME_ZONE = -CURRENT_DATE.getTimezoneOffset();
                const START_DATE = e.currentTarget.getAttribute("data-worker-first-location-date");
                const END_DATE = pad(CURRENT_DATE.getDate()) + "." + pad(CURRENT_DATE.getMonth() + 1) + "." + pad(CURRENT_DATE.getFullYear());
                const START_TIME = e.currentTarget.getAttribute("data-worker-first-location-time");
                const END_TIME = pad(CURRENT_DATE.getHours()) + ":" + pad(CURRENT_DATE.getMinutes()) + ":" + pad(CURRENT_DATE.getSeconds());
                const USER = e.currentTarget.getAttribute("data-worker-id");
                $.ajax({
                    url: $("#for-ajax").attr("data-url-reports-users"),
                    type: "POST",
                    data: {
                        "START_DATE": START_DATE,
                        "END_DATE": END_DATE,
                        "START_TIME": START_TIME,
                        "END_TIME": END_TIME,
                        "USER": USER,
                        "TIME_ZONE": TIME_ZONE,
                        "csrfmiddlewaretoken": $("#for-ajax").attr("data-token")
                    },
                    dataType: "json",
                    success: (resp) => {
                        if (resp.message === "success") {
                            document.getElementById("online-worker-started").textContent = START_DATE + " " + START_TIME;
                            document.getElementById("online-worker-walked").textContent = resp.results[0].distance.toFixed(2);
                            //
                            problemsFeatureGroup.clearLayers();
                            const LINE = 0;
                            const STATION = 0;
                            $.ajax({
                                url: $("#for-ajax").attr("data-url-reports-problems"),
                                type: "POST",
                                data: {
                                    "START_DATE": START_DATE,
                                    "END_DATE": END_DATE,
                                    "START_TIME": START_TIME,
                                    "END_TIME": END_TIME,
                                    "LINE": LINE,
                                    "STATION": STATION,
                                    "USER": USER,
                                    "TIME_ZONE": TIME_ZONE,
                                    "csrfmiddlewaretoken": $("#for-ajax").attr("data-token")
                                },
                                dataType: "json",
                                success: (resp) => {
                                    if (resp.message === "success") {
                                        let filteredArray = resp.results.filter(obj => obj.status !== "Done");
                                        if (filteredArray.length !== 0) {
                                            let newRow;
                                            filteredArray.forEach((obj) => {
                                                newRow = document.createElement("div");
                                                newRow.classList.add("online-worker-problem", "filled");
                                                newRow.setAttribute("data-worker-problem-id", obj.ID);
                                                newRow.setAttribute("data-worker-problem-latitude", obj.latitude);
                                                newRow.setAttribute("data-worker-problem-longitude", obj.longitude);
                                                newRow.setAttribute("data-worker-problem-type-code", obj.type_code);
                                                newRow.setAttribute("data-worker-problem-status-code", obj.status_code);
                                                let newCell;
                                                newCell = document.createElement("a");
                                                newCell.setAttribute("href", "/platform/issue/" + obj.ID);
                                                newCell.setAttribute("target", "_blank");
                                                newCell.setAttribute("rel", "noopener noreferrer");
                                                newCell.textContent = "SUH-" + obj.ID;
                                                newRow.appendChild(newCell);
                                                newCell.addEventListener("click", (e) => {
                                                    e.stopPropagation();
                                                });
                                                newCell = document.createElement("span");
                                                newCell.textContent = obj.name;
                                                newRow.appendChild(newCell);
                                                newCell = document.createElement("select");
                                                let newOption;
                                                for (let choice of PROBLEM_STATUS_CHOICES) {
                                                    newOption = document.createElement("option");
                                                    newOption.setAttribute("value", choice.value);
                                                    newOption.textContent = choice.name;
                                                    if (choice.name === obj.status) {
                                                        newOption.selected = true;
                                                    }
                                                    newCell.appendChild(newOption);
                                                }
                                                newCell.addEventListener("change", (e) => {
                                                    if (e.target.value !== obj.status) {
                                                        //
                                                        const CURRENT_NEW_DATE = new Date();
                                                        const TIME_ZONE = -CURRENT_NEW_DATE.getTimezoneOffset() / 60;
                                                        const CURRENT_DATE = pad(CURRENT_NEW_DATE.getDate()) + "." + pad(CURRENT_NEW_DATE.getMonth() + 1) + "." + pad(CURRENT_NEW_DATE.getFullYear());
                                                        const CURRENT_TIME = pad(CURRENT_NEW_DATE.getHours()) + ":" + pad(CURRENT_NEW_DATE.getMinutes()) + ":" + pad(CURRENT_NEW_DATE.getSeconds());
                                                        $.ajax({
                                                            url: $("#for-ajax").attr("data-url-problem") + "/" + obj.ID,
                                                            type: "POST",
                                                            data: {
                                                                "ACTION": "UPDATE_STATUS",
                                                                "CURRENT_DATE": CURRENT_DATE,
                                                                "CURRENT_TIME": CURRENT_TIME,
                                                                "TIME_ZONE": TIME_ZONE,
                                                                "NEW_STATUS": e.target.value,
                                                                "csrfmiddlewaretoken": $("#for-ajax").attr("data-token")
                                                            },
                                                            dataType: "json",
                                                            success: (resp) => {
                                                                if (resp.message === "success") {
                                                                    let markerToChange = document.getElementById(`marker-problem-id-` + e.target.parentElement.getAttribute("data-worker-problem-id"));
                                                                    // let popupToChange = document.querySelector(".leaflet-popup");
                                                                    if (e.target.value === "done") {
                                                                        e.target.parentElement.remove();
                                                                        markerToChange.style.display = "none";
                                                                        // popupToChange.style.display = "none";
                                                                    } else {
                                                                        markerToChange = markerToChange.firstChild;
                                                                        markerToChange.classList.replace(markerToChange.classList[markerToChange.classList.length - 1], e.target.value);
                                                                        // popupToChange = popupToChange.querySelector(".bi.bi-circle-fill");
                                                                        // popupToChange = popupToChange.parentElement;
                                                                        // popupToChange.classList.replace(popupToChange.classList[popupToChange.classList.length - 1], e.target.value);
                                                                        // popupToChange.textContent = e.target.value;
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                                newRow.appendChild(newCell);
                                                newRow.addEventListener("click", (e) => {
                                                    if (e.currentTarget.getAttribute("data-worker-problem-id") !== MAP._container.getAttribute("data-active-worker-problem-id")) {
                                                        if (MAP._container.getAttribute("data-active-worker-problem-id") !== "0") {
                                                            if (document.querySelector(`div[data-worker-problem-id="` + MAP._container.getAttribute("data-active-worker-problem-id") + `"]`)) {
                                                                document.querySelector(`div[data-worker-problem-id="` + MAP._container.getAttribute("data-active-worker-problem-id") + `"]`).classList.remove("selected");
                                                            }
                                                        }
                                                        MAP._container.setAttribute("data-active-worker-problem-id", e.currentTarget.getAttribute("data-worker-problem-id"));
                                                        e.currentTarget.classList.add("selected");
                                                        //
                                                        MAP.setView([e.currentTarget.getAttribute("data-worker-problem-latitude"), e.currentTarget.getAttribute("data-worker-problem-longitude")], MAP.getMaxZoom());
                                                        MAP.panBy(new L.Point(WORKER_COLUMN.offsetWidth / 2, 0, true), {animate: false});
                                                    } else {
                                                        MAP._container.setAttribute("data-active-worker-problem-id", "0");
                                                        e.currentTarget.classList.remove("selected");
                                                        //
                                                        MAP.fitBounds(polylinesFeatureGroup.getBounds().extend(problemsFeatureGroup.getBounds()).pad(0.1));
                                                        const CURRENT_ZOOM = MAP.getZoom();
                                                        const POLYLINE_CENTER = polylinesFeatureGroup.getBounds().extend(problemsFeatureGroup.getBounds()).pad(0.1).getCenter();
                                                        const TARGET_POINT = MAP.project(POLYLINE_CENTER, CURRENT_ZOOM).subtract(new L.Point(-(WORKER_COLUMN.offsetWidth / 2), 0, true));
                                                        const TARGET_LAT_LNG = MAP.unproject(TARGET_POINT, CURRENT_ZOOM);
                                                        MAP.setView(TARGET_LAT_LNG, CURRENT_ZOOM);
                                                        MAP.panBy(new L.Point(WORKER_COLUMN.offsetWidth / 2, 0, true), {animate: false});
                                                    }
                                                });
                                                document.getElementById("online-worker-problems-list").appendChild(newRow);
                                                //
                                                let marker = new L.marker([obj.latitude, obj.longitude], {icon: createCustomDivIconClass(obj.status_code, obj.type_code)}).addTo(problemsFeatureGroup);
                                                const DISPLAY_TEXT = `<div class="leaflet-popup-content-row"><span>Type</span><span>` + obj.type + `</span></div>` +
                                                    `<div class="leaflet-popup-content-row problem-location"><span>Location</span><span>` + obj.latitude + " / " + obj.longitude + `</span><span class="leaflet-popup-content-subrow"><i class="bi bi-info-circle-fill"></i>Station: ` + obj.station + `</span></div>` +
                                                    `<div class="leaflet-popup-content-row"><span>Added By</span><span>` + obj.user + `</span></div>` +
                                                    `<div class="leaflet-popup-content-row"><span>Status</span><span class="leaflet-popup-content-subrow ` + obj.status_code + `"><i class="bi bi-circle-fill"></i>` + obj.status + `</span></div>` +
                                                    `<div class="leaflet-popup-content-row"><a href="/platform/issue/` + obj.ID + `" target="_blank" rel="noopener noreferrer" class="filled">View Details</a></div>`;
                                                marker.bindPopup(DISPLAY_TEXT);
                                                marker.getElement().id = "marker-problem-id-" + obj.ID;
                                            });
                                        } else {
                                            let newRow = document.createElement("div");
                                            newRow.textContent = "No Data Has Been Found";
                                            newRow.style.alignSelf = "center";
                                            newRow.style.textAlign = "center";
                                            document.getElementById("online-worker-problems-list").appendChild(newRow);
                                        }
                                        //
                                        polylinesFeatureGroup.clearLayers();
                                        $.ajax({
                                            url: $("#for-ajax").attr("data-url-alerts"),
                                            type: "POST",
                                            data: {
                                                "ACTION": "GET_LOCATIONS",
                                                "INSPECTION": elem.getAttribute("data-worker-latest-inspection-id"),
                                                "csrfmiddlewaretoken": $("#for-ajax").attr("data-token")
                                            },
                                            dataType: "json",
                                            success: (resp) => {
                                                if (resp.message === "success") {
                                                    console.log(resp.results);
                                                    let latLngs = [];
                                                    resp.results.forEach((obj) => {
                                                        latLngs.push([obj.latitude, obj.longitude])
                                                    });
                                                    let polyline = L.polyline(latLngs, {
                                                        color: "red",
                                                        weight: 5,
                                                        dashArray: "20, 20"
                                                    }).addTo(polylinesFeatureGroup);

                                                    // const zoom = MAP.getZoom();
                                                    // const POLYLINE_CENTER = polylinesFeatureGroup.getBounds().getCenter();
                                                    // const TARGET_POINT = MAP.project(POLYLINE_CENTER, zoom).subtract([-(WORKER_COLUMN.offsetWidth / 2), 0]);
                                                    // const TARGET_LAT_LNG = MAP.unproject(TARGET_POINT, zoom);
                                                    // MAP.setView(TARGET_LAT_LNG, zoom);

                                                    // let newBounds = polyline.getBounds();
                                                    // console.log(WORKER_COLUMN.offsetWidth);
                                                    // MAP.fitBounds(polyline.getBounds());
                                                    // MAP.fitBounds(polylinesFeatureGroup.getBounds().pad(0.1));

                                                    MAP.fitBounds(polylinesFeatureGroup.getBounds().extend(problemsFeatureGroup.getBounds()).pad(0.1));
                                                    const CURRENT_ZOOM = MAP.getZoom();
                                                    const POLYLINE_CENTER = polylinesFeatureGroup.getBounds().extend(problemsFeatureGroup.getBounds()).pad(0.1).getCenter();
                                                    const TARGET_POINT = MAP.project(POLYLINE_CENTER, CURRENT_ZOOM).subtract(new L.Point(-(WORKER_COLUMN.offsetWidth / 2), 0, true));
                                                    const TARGET_LAT_LNG = MAP.unproject(TARGET_POINT, CURRENT_ZOOM);
                                                    MAP.setView(TARGET_LAT_LNG, CURRENT_ZOOM);
                                                    MAP.panBy(new L.Point(WORKER_COLUMN.offsetWidth / 2, 0, true), {animate: false});

                                                    // MAP.flyToBounds(polyline.getBounds()).panInside(polyline.getCenter(), {paddingBottomRight: [0, 350]});
                                                    // MAP.flyToBounds(polyline.getBounds()).setZoom(MAP.getBoundsZoom(polyline.getBounds(), true, {paddingBottomRight: [0, 350]}));
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    },
                    error: () => {
                        document.getElementById("online-worker-started").textContent = "Not Started";
                        document.getElementById("online-worker-walked").textContent = "0";
                        let newRow = document.createElement("div");
                        newRow.textContent = "No Data Has Been Found";
                        newRow.style.alignSelf = "center";
                        newRow.style.textAlign = "center";
                        document.getElementById("online-worker-problems-list").appendChild(newRow);
                        //
                        problemsFeatureGroup.clearLayers();
                        polylinesFeatureGroup.clearLayers();
                        MAP.fitBounds(alertsFeatureGroup.getBounds().extend(workersFeatureGroup.getBounds()).pad(0.1));
                    }
                });
                if (WORKER_COLUMN.getAttribute("data-active-worker-id") !== "0") {
                    document.querySelector(`div[data-worker-id="` + WORKER_COLUMN.getAttribute("data-active-worker-id") + `"]`).classList.remove("selected");
                    if (document.getElementById(`marker-worker-id-` + WORKER_COLUMN.getAttribute("data-active-worker-id"))) {
                        document.getElementById(`marker-worker-id-` + WORKER_COLUMN.getAttribute("data-active-worker-id")).classList.remove("selected");
                    }
                }
                MAP._container.setAttribute("data-active-worker-problem-id", "0");
                WORKER_COLUMN.setAttribute("data-active-worker-id", USER);
                WORKER_COLUMN.classList.add("when-online-worker-col-open");
                e.currentTarget.classList.add("selected");
                if (document.getElementById(`marker-worker-id-` + USER)) {
                    document.getElementById(`marker-worker-id-` + USER).classList.add("selected");
                }
                document.querySelector(".leaflet-control-attribution").style.display = "none";
                //
                alertsFeatureGroup.removeFrom(MAP);
            } else {
                if (document.getElementById(`marker-worker-id-` + WORKER_COLUMN.getAttribute("data-active-worker-id"))) {
                    document.getElementById(`marker-worker-id-` + WORKER_COLUMN.getAttribute("data-active-worker-id")).classList.remove("selected");
                }
                MAP._container.setAttribute("data-active-worker-problem-id", "0");
                WORKER_COLUMN.setAttribute("data-active-worker-id", "0");
                WORKER_COLUMN.classList.remove("when-online-worker-col-open");
                e.currentTarget.classList.remove("selected");
                document.querySelector(".leaflet-control-attribution").style.display = "initial";
                //
                alertsFeatureGroup.addTo(MAP);
                problemsFeatureGroup.clearLayers();
                polylinesFeatureGroup.clearLayers();
                MAP.fitBounds(alertsFeatureGroup.getBounds().extend(workersFeatureGroup.getBounds()).pad(0.1));
            }
        });
    }

    const ALERTS_ONLY_SWITCH_BUTTON = document.getElementById("alerts-only-switch-button");
    ALERTS_ONLY_SWITCH_BUTTON.addEventListener("click", () => {
        ALERTS_ONLY_SWITCH_BUTTON.classList.toggle("enabled");
        if (ALERTS_ONLY_SWITCH_BUTTON.classList.contains("enabled")) {
            if (WORKER_COLUMN.getAttribute("data-active-worker-id") !== "0") {
                if (document.getElementById(`marker-worker-id-` + WORKER_COLUMN.getAttribute("data-active-worker-id"))) {
                    document.getElementById(`marker-worker-id-` + WORKER_COLUMN.getAttribute("data-active-worker-id")).classList.remove("selected");
                }
                document.querySelector(`div[data-worker-id="` + WORKER_COLUMN.getAttribute("data-active-worker-id") + `"]`).classList.remove("selected");
                MAP._container.setAttribute("data-active-worker-problem-id", "0");
                WORKER_COLUMN.setAttribute("data-active-worker-id", "0");
                WORKER_COLUMN.classList.remove("when-online-worker-col-open");
                document.querySelector(".leaflet-control-attribution").style.display = "initial";
            }
            document.getElementById("online-workers-col").style.display = "none";
            MAP.invalidateSize();
            //
            alertsFeatureGroup.addTo(MAP);
            problemsFeatureGroup.clearLayers();
            polylinesFeatureGroup.clearLayers();
            workersFeatureGroup.clearLayers();
            MAP.fitBounds(alertsFeatureGroup.getBounds().pad(0.1));
        } else {
            document.getElementById("online-workers-col").style.display = "inherit";
            MAP.invalidateSize();
            //
            for (let elem of WORKERS) {
                if (elem.getAttribute("data-worker-latitude").length !== 0 && elem.getAttribute("data-worker-longitude").length !== 0) {
                    let marker = new L.marker([elem.getAttribute("data-worker-latitude"), elem.getAttribute("data-worker-longitude")], {icon: createCustomDivIconClass(elem.querySelector("img").getAttribute("src"), "user")}).addTo(workersFeatureGroup);
                    marker.getElement().id = "marker-worker-id-" + elem.getAttribute("data-worker-id");
                } else {
                    continue;
                }
            }
            MAP.fitBounds(alertsFeatureGroup.getBounds().extend(workersFeatureGroup.getBounds()).pad(0.1));
        }
    });

    MAP.invalidateSize();
    MAP.fitBounds(alertsFeatureGroup.getBounds().extend(workersFeatureGroup.getBounds()).pad(0.1));
}

/* the script to execute when "About" page is loaded */
function onLoadAbout() {

}