import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup} from "react-simple-maps";
import { scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { useTranslation } from "react-i18next";

type Props = {
    data: Record<string, Record<string, number>>;
};

type Tooltip = {
    x: number;
    y: number;
    name: string;
    data: Record<string, number>;
} | null;

countries.registerLocale(en);

const iso2ToName: Record<string, string> = Object.fromEntries(
  Object.entries(countries.getNames("en", { select: "official" }))
);

// Manual override
iso2ToName["RU"] = "Russia";
iso2ToName["CN"] = "China";
iso2ToName["IR"] = "Iran";

const nameToIso2: Record<string, string> = Object.fromEntries(
  Object.entries(iso2ToName).map(([iso, name]) => [name, iso])
);

export default function WorldMap({data = {}}: Props) {
    const { t, ready } = useTranslation();

    const [tooltip, setTooltip] = useState<Tooltip>(null);

    const [position, setPosition] = useState({
        coordinates: [0,-83] as [number, number],
        zoom: 1,
    });

    const countryTotals = useMemo(() => {
        const result: Record<string, number> = {};

        Object.values(data).forEach((dataset) => {
            Object.entries(dataset).forEach(([country, value]) => {
                result[country] = (result[country] ?? 0) + value;
            });
        });

        return result;
    }, [data]);


    const colorScale = useMemo(() => {

        const maxData = Math.max(
            ...Object.values(countryTotals),
            1
        );

        return scaleSequential()
            .domain([0, maxData])
            .interpolator(
                interpolateRgbBasis([
                    "#111111",
                    "#2b1010",
                    "#5a1a1a",
                    "#8a3030",
                    "#b94a4a",
                    "#d95f5f",
                ])
            );
    }, [countryTotals]);

    if (!ready) return null;

    return (
        <div>

            <div className="text-lg font-bold mb-6">
                World Map
            </div>

            <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center">

                {tooltip && (
                    <div
                        className="absolute z-50 bg-base-100 border border-base-300 rounded-lg shadow-xl px-4 py-3 pointer-events-none text-sm w-max min-w-fit whitespace-nowrap"
                        style={{ left: tooltip.x, top: tooltip.y }}
                    >
                        {nameToIso2[tooltip.name] && (
                            <div className="flex justify-center mb-2">
                                <img
                                    src={`https://${window.config.domains.cdn}/icons/flags/${nameToIso2[tooltip.name].toLocaleLowerCase()}.svg`}
                                    className="h-12 w-fit rounded object-contain"
                                />
                            </div>
                        )}

                        <div className={`font-bold text-center ${Object.keys(tooltip.data).length ? "mb-2" : ""}`}>
                            {tooltip.name}
                        </div>

                        {Object.entries(tooltip.data).map(([key, value]) => (
                            <div key={key}>
                                {value.toLocaleString()} {key.charAt(0).toUpperCase() + key.slice(1)} 
                                <span className="ml-1 text-sub text-xs">(10% increase)</span>
                            </div>
                        ))}
                    </div>
                )}

                <ComposableMap
                    projection="geoEquirectangular"
                    projectionConfig={{ scale: 100 }}
                    width={600}
                    height={600}
                >
                    <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        minZoom={1}
                        maxZoom={8}
                        onMoveEnd={({ coordinates, zoom }) => {
                            setPosition({
                                coordinates,
                                zoom,
                            });
                        }}
                    >
                        <Geographies geography={`https://${window.config.domains.cdn}/json/world-atlas/countries-110m.json`}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const name = geo.properties.name as string;
                                    const iso = nameToIso2[name];
                                    const value = countryTotals[iso] ?? 0;
                                    const countryData: Record<string, number> = {};

                                    Object.entries(data).forEach(([key, dataset]) => {
                                        if (dataset[iso] !== undefined) {
                                            countryData[key] = dataset[iso];
                                        }
                                    });

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}

                                            onMouseMove={(event) => {
                                                const svg = event.currentTarget.ownerSVGElement;

                                                if (!svg) return;

                                                const rect = svg.getBoundingClientRect();

                                                setTooltip({
                                                    x: event.clientX - rect.left + 15,
                                                    y: event.clientY - rect.top + 15,
                                                    name,
                                                    data: countryData,
                                                });
                                            }}

                                            onMouseLeave={() => {
                                                setTooltip(null);
                                            }}

                                            style={{
                                                default: {
                                                    fill: colorScale(value),
                                                    stroke: "#222222",
                                                    strokeWidth: 0.5,
                                                },

                                                hover: {
                                                    fill:"#222222",
                                                    stroke: "#222222",
                                                    strokeWidth: 1,
                                                },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>
        </div>
    );
}