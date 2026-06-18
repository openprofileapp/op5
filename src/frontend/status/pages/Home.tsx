import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

/* GENERATED MOCK STATUS; REPLACE WITH API CALL */
const mockStatus = {
    overall: "operational",
    updatedAt: new Date().toISOString(),
    servers: [
        { name: "Web App", status: "operational" },
        { name: "Authentication", status: "operational" },
        { name: "API", status: "degraded" },
        { name: "CDN", status: "operational" },
        { name: "Support", status: "outage" },
        { name: "Nightly Build", status: "outage" },
        { name: "Gateway", status: "outage" }
    ],

    incidents: [
        {
            title: "Elevated latency in Auth Service",
            status: "monitoring",
            time: "2 hours ago",
            updates: [
                "Investigating increased response times",
                "Mitigation applied, monitoring stability"
            ]
        },
        {
            title: "Database connection issue",
            status: "resolved",
            time: "2 days ago",
            updates: [
                "Identified connection pool exhaustion",
                "Fixed and redeployed",
                "All systems stable"
            ]
        }
    ]
};

function statusColor(status: string) {
    switch (status) {
        case "operational":
            return "text-green-500";
        case "degraded":
            return "text-yellow-500";
        case "outage":
            return "text-red-500";
        case "resolved":
            return "text-green-500";
        case "monitoring":
            return "text-yellow-500";
        default:
            return "text-gray-400";
    }
}

function StatusBadge({ status }: {status: string}) {
    return (
        <span className={`text-sm font-bold ${statusColor(status)}`}>
            {status.toUpperCase()}
        </span>
    );
}

function generateUptime(days = 90) {
    const today = new Date();

    return Array.from({ length: days }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (days - i));

        const r = Math.random();

        let status = "operational";
        let cause = null;
        let note = "All systems normal";
        let downtime = null;
        let impact = null;
        let affected: string[] = [];
        let incidentId = null;

        if (r > 0.975) {
            status = "outage";

            const outages = [
                {
                    cause: "Database cluster failure",
                    note: "Full downtime affecting API and Authentication",
                    downtime: "43 minutes",
                    impact: "Users unable to sign in",
                    affected: ["API", "Authentication"]
                },
                {
                    cause: "Gateway outage",
                    note: "Requests could not be routed to backend services",
                    downtime: "17 minutes",
                    impact: "Platform unavailable",
                    affected: ["Gateway", "Web App", "API"]
                },
                {
                    cause: "CDN provider disruption",
                    note: "Static assets failed to load",
                    downtime: "28 minutes",
                    impact: "Pages loaded incorrectly",
                    affected: ["CDN", "Web App"]
                }
            ];

            const incident =
                outages[Math.floor(Math.random() * outages.length)];

            cause = incident.cause;
            note = incident.note;
            downtime = incident.downtime;
            impact = incident.impact;
            affected = incident.affected;
            incidentId = `INC-${date.getFullYear()}-${String(i).padStart(4, "0")}`;
        } else if (r > 0.94) {
            status = "degraded";

            const degradations = [
                {
                    cause: "Auth service latency spike",
                    note: "Login requests slower than normal",
                    impact: "Delayed sign-ins",
                    affected: ["Authentication"]
                },
                {
                    cause: "High database load",
                    note: "Increased query response times",
                    impact: "Slower dashboard loading",
                    affected: ["API", "Web App"]
                },
                {
                    cause: "Third-party API slowdown",
                    note: "External dependency causing delays",
                    impact: "Profile sync delays",
                    affected: ["API"]
                }
            ];

            const incident = degradations[Math.floor(Math.random() * degradations.length)];

            cause = incident.cause;
            note = incident.note;
            impact = incident.impact;
            affected = incident.affected;
            incidentId = `INC-${date.getFullYear()}-${String(i).padStart(4, "0")}`;
        }

        return {
            date: date.toISOString().split("T")[0],
            status,
            cause,
            note,
            downtime,
            impact,
            affected,
            incidentId
        };
    });
}

function UptimeBar({ name }: { name: string}) {
    const data = useMemo(() => generateUptime(90), []);

    const colorMap = {
        operational: "bg-green-500",
        degraded: "bg-yellow-500",
        outage: "bg-red-500"
    };

    return (
        <div className="border-b border-base-300 p-4 bg-base-100">
            <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{name}</div>
                <div className="text-xs text-sub">Last 90 days</div>
            </div>

            <div
                className="grid gap-0 md:gap-1 w-full"
                style={{
                    gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`
                }}
            >
                {data.map((d, i) => (
                    <div key={i} className="tooltip">
                        <div className="tooltip-content text-left flex flex-col gap-1">
                            <div>
                                Status:{" "}
                                <span className="font-bold">
                                    {d.status.toUpperCase()}
                                </span>
                            </div>

                            {d.downtime && (
                                <div>
                                    Downtime:{" "}
                                    <span className="font-medium">
                                        {d.downtime}
                                    </span>
                                </div>
                            )}

                            {d.cause && (
                                <div>
                                    Cause:{" "}
                                    <span className="opacity-80">
                                        {d.cause}
                                    </span>
                                </div>
                            )}

                            {d.impact && (
                                <div>
                                    Impact:{" "}
                                    <span className="opacity-80">
                                        {d.impact}
                                    </span>
                                </div>
                            )}

                            {d.affected?.length > 0 && (
                                <div>
                                    Affected:{" "}
                                    <span className="opacity-80">
                                        {d.affected.join(", ")}
                                    </span>
                                </div>
                            )}

                            {d.incidentId && (
                                <div className="opacity-60 text-xs">
                                    Incident: {d.incidentId}
                                </div>
                            )}

                            <div className="opacity-70 border-t border-base-300 pt-1 mt-1">
                                {d.note}
                            </div>
                        </div>

                        <div
                            className={`h-8 w-full flex-1 ${colorMap[d.status]}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StatusPage() {
    const [data] = useState(mockStatus);

    const operationalCount = data.servers.filter(
        c => c.status === "operational"
    ).length;

    const degradedCount = data.servers.filter(
        c => c.status === "degraded"
    ).length;

    const outageCount = data.servers.filter(
        c => c.status === "outage"
    ).length;

    return (
        <div className="min-h-screen bg-base-200 text-base-content">
            <div className="flex flex-col gap-4 max-w-5xl mx-auto p-6">

                <div className="flex justify-between items-center mb-4">
                    <Link className="cursor-pointer w-48" to="/">
                        <img alt="OpenProfile wordmark"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.wordmark}`} 
                        />
                    </Link>

                    <div className="text-sm text-right">
                        {/* API CALL HERE */}
                        LAST UPDATED<br />
                        <span className="text-xs text-sub">{new Date(data.updatedAt).toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 bg-base-100 border border-base-300 rounded p-6">
                    <div className="text-xs text-sub">
                        Overall Status
                    </div>

                    <div className="text-2xl font-bold text-green-500">
                        {data.overall.toUpperCase()}
                    </div>
                </div>

                <div className="flex flex-rows gap-4">
                    <div className="flex-1 bg-base-100 border border-base-300 rounded p-4">
                        <div className="text-xs text-sub">
                            Operational
                        </div>

                        <div className="text-2xl font-bold text-green-500 mt-1">
                            {operationalCount}
                        </div>
                    </div>

                    <div className="flex-1 bg-base-100 border border-base-300 rounded p-4">
                        <div className="text-xs text-sub">
                            Degraded
                        </div>

                        <div className="text-2xl font-bold text-yellow-500 mt-1">
                            {degradedCount}
                        </div>
                    </div>

                    <div className="flex-1 bg-base-100 border border-base-300 rounded p-4">
                        <div className="text-xs text-sub">
                            Outages
                        </div>

                        <div className="text-2xl font-bold text-red-500 mt-1">
                            {outageCount}
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded bg-base-100 border border-base-300">
                    <h2 className="text-xl font-bold mb-4">
                        Servers
                    </h2>

                    <div className="space-y-4">
                        {data.servers.map((s) => (
                            <div
                                key={s.name}
                                className="flex justify-between items-center p-4 bg-base-200 rounded border border-base-300"
                            >
                                <span>{s.name}</span>
                                <StatusBadge status={s.status} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded bg-base-100 border border-base-300">
                    <h2 className="text-xl font-bold mb-4">
                        Uptime (Last 90 Days)
                    </h2>

                    <div className="space-y-4">
                        {data.servers.map((s) => (
                            <UptimeBar key={s.name} name={s.name} />
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded bg-base-100 border border-base-300 shadow">
                    <h2 className="text-xl font-bold mb-4">
                        Recent Incidents
                    </h2>

                    <div className="space-y-6">
                        {data.incidents.map((d, i) => (
                            <div
                                key={i}
                                className="border-l-4 border-base-300 pl-4"
                            >
                                <div className="flex justify-between">
                                    <h3 className="font-bold">
                                        {d.title}
                                    </h3>
                                    <StatusBadge status={d.status} />
                                </div>

                                <p className="text-sm text-sub mb-2">
                                    {d.time}
                                </p>

                                <ul className="list-disc ml-5 text-sm opacity-80 space-y-1">
                                    {d.updates.map((u, idx) => (
                                        <li key={idx}>{u}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="text-center text-xs text-sub mt-2">
                    {window.config.metadata.legal.license.text}
                </div>

            </div>
        </div>
    );
}