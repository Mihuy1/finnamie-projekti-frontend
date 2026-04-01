import { useState, useEffect } from "react";
import L from "leaflet";
import { Marker, Popup, useMapEvents } from "react-leaflet";

const campsiteIcon = L.icon({
    iconUrl: "/icons/campsite.svg",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: "poi-icon-subtle"
});

const airportIcon = L.icon({
    iconUrl: "/icons/airport.svg",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
    className: "poi-icon-subtle"
});

const skiIcon = L.icon({
    iconUrl: "/icons/skiing.svg",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: "poi-icon-subtle"
});

const towerIcon = L.icon({
    iconUrl: "/icons/observation-tower.svg",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    className: "poi-icon-subtle"
});

const translateName = (tags, type) => {
    let name = tags["name:en"] || tags.name;

    if (!name) {
        if (type === "airport") return "Airport";
        if (type === "ski") return "Ski Resort / Slope";
        if (type === "tower") return "Observation Tower";
        return "Campfire / Shelter";
    }

    return name
        .replace(/laavu/gi, "Lean-to")
        .replace(/nuotiopaikka/gi, "Firepit")
        .replace(/lentokenttä/gi, "Airport")
        .replace(/lentoasema/gi, "Airport")
        .replace(/hiihtokeskus/gi, "Ski Center")
        .replace(/laskettelukeskus/gi, "Ski Center")
        .replace(/näkötorni/gi, "Observation Tower")
};

export const Markers = () => {
    const [marker, setMarker] = useState([]);

    const map = useMapEvents({
        moveend: () => {
            updatePois();
        }
    });

    const updatePois = async () => {
        const zoom = map.getZoom();
        const bounds = map.getBounds();

        if (zoom < 8) {
            setMarker([]);
            return;
        }

        const s = bounds.getSouth();
        const w = bounds.getWest();
        const n = bounds.getNorth();
        const e = bounds.getEast();

        const query = `[out:json][timeout:20];
        (
            node["amenity"="firepit"](${s},${w},${n},${e});
            node["shelter_type"="lean_to"](${s},${w},${n},${e});
            node["aeroway"="aerodrome"](${s},${w},${n},${e});

            node["leisure"="ski_resort"](${s},${w},${n},${e});
      way["leisure"="ski_resort"](${s},${w},${n},${e});
      node["landuse"="winter_sports"](${s},${w},${n},${e});
      way["landuse"="winter_sports"](${s},${w},${n},${e});
      node["piste:type"="downhill"](${s},${w},${n},${e});

            node["man_made"="tower"]["tower:type"="observation"](${s},${w},${n},${e});
        );
        out center qt 120;`;

        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            const points = data.elements.map(el => {
                let type = "campfire";
                const tags = el.tags || {};

                if (tags.aeroway === "aerodrome") {
                    type = "airport";
                } else if (tags.leisure === "ski_resort" || tags.landuse === "winter_sports" || tags["piste:type"]) {
                    type = "ski";
                } else if (tags.man_made === "tower" || tags.tourism === "viewpoint") {
                    type = "tower";
                }

                const lat = el.lat || (el.center && el.center.lat);
                const lon = el.lon || (el.center && el.center.lon);

                if (!lat || !lon) return null;

                return {
                    id: el.id,
                    lat: lat,
                    lng: lon,
                    type: type,
                    name: translateName(el.tags, type)
                };
            }).filter(p => p !== null);

            const uniquePoints = Array.from(new Map(points.map(p => [p.lat + p.lng, p])).values());

            setMarker(uniquePoints);
        } catch (err) {
            console.error("Overpass error:", err);
        }
    };

    useEffect(() => {
        updatePois();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case "airport": return airportIcon;
            case "ski": return skiIcon;
            case "tower": return towerIcon;
            default: return campsiteIcon;
        }
    };

    return (
        <>
            {marker.map(poi => (
                <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={getIcon(poi.type)} zIndexOffset={-500}>
                    <Popup><span style={{ fontSize: '13px' }}>{poi.name}</span></Popup>
                </Marker>
            ))}
        </>
    );
};