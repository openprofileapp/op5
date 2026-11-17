
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../../_common/components/Metadata.js";
import { CheckboxInput } from "../../../_common/components/CheckboxInput.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiBaseUrl, authBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { SessionType } from "../../../../_common/types/session.type.js";
import { formatShortRelative } from "../../../_common/scripts/time.js";
import { UserAgentType } from "../../../../_common/types/userAgent.type.js";
import { GeoIpType } from "../../../../_common/types/geoIp.type.js";
import { ModerationReasonNameType, ModerationType } from "../../../../_common/types/moderation.type.js";
import getModerationReason from "../../../../_common/helpers/getModerationReason.js";
import MarkdownRenderer from "../../../_common/components/markdown/Renderer.js";

const sections = [
    {
        id: "experiments",
        label: "Experiments",
        group: "developer",
        icon: ""
    },
    {
        id: "bots",
        label: "Bots",
        group: "developer",
        icon: ""
    },
    {
        id: "standing",
        label: "Account Standing",
        group: "account",
        icon: ""
    },
    {
        id: "billing",
        label: "Billing",
        group: "account",
        icon: ""
    },
    {
        id: "sessions",
        label: "Sessions",
        group: "account",
        icon: ""
    },
    {
        id: "interests",
        label: "Interests",
        group: "account",
        icon: ""
    },
    {
        id: "privacy",
        label: "Data & Privacy",
        group: "account",
        icon: ""
    },
    {
        id: "connections",
        label: "Connections",
        group: "account",
        icon: ""
    },
    {
        id: "manage",
        label: "Manage Account",
        group: "account",
        icon: ""
    }
];

export default function Settings() {
    const { section } = useParams();
    const navigate = useNavigate();
    const { t, ready: isTranslationReady } = useTranslation();

    const [activeSection, setActiveSection] = useState(section || sections[0].id);

    const [sessions, setSessions] = useState<SessionType[]>([]);
    const [moderationHistory, setModerationHistory] = useState<ModerationType[]>([]);

    const groupedSections = sections.reduce<
        Record<string, typeof sections>
    >((groups, section) => {
        if (!groups[section.group]) {
            groups[section.group] = [];
        }

        groups[section.group].push(section);

        return groups;
    }, {});

    const revokedPermissions = useMemo(() => {
        const permissions = new Map<string, number>();

        moderationHistory.forEach(item => {
            if (item.status !== "ACTIVE") return;

            const expiresAt =
                new Date(item.createdDate).getTime() + item.revokedPermissionsDuration;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            item.revokedPermissionsArray.forEach(permission => {
                permissions.set(
                    permission,
                    Math.max(permissions.get(permission) ?? 0, expiresAt)
                );
            });
        });

        return permissions;
    }, [moderationHistory]);

    useEffect(() => {
        if (activeSection !== section) {
            navigate(`/account/settings/${activeSection}`, { replace: true });
        }
    }, [activeSection, section, navigate]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch(
                    `${authBaseUrl}/session/all`,
                    { credentials: "include" }
                );

                const data: SessionType[] = await response.json();

                if (!response.ok) {
                    toast.show("Failed to get sessions", {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        subtext: `${data.id || ""}${data.id ? ": " : ""}${data?.message}`,
                        type: "error"
                    });

                    return;
                }

                data.sort(
                    (a, b) =>
                        new Date(b.lastConnectedDate).getTime() -
                        new Date(a.lastConnectedDate).getTime()
                );

               data.sort(
                    (a, b) =>
                        Number(b.sessionId === window.session.sessionId) -
                        Number(a.sessionId === window.session.sessionId)
                );

                setSessions(data);
            } catch (error) {
                toast.show("Failed to get sessions", {
                    subtext: String(error),
                    type: "error"
                });
            }
        };

        fetchSessions();
    }, []);

    useEffect(() => {
        const fetchModerationHistory = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/moderate/history`,
                    { credentials: "include" }
                );

                const data: ModerationType[] = await response.json();

                if (!response.ok) {
                    toast.show("Failed to get moderation history", {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        subtext: `${data.id || ""}${data.id ? ": " : ""}${data?.message}`,
                        type: "error"
                    });

                    return;
                }

                data.sort(
                    (a, b) =>
                        (new Date(b.createdDate).getTime() + b.duration) -
                        (new Date(a.createdDate).getTime() + a.duration)
                );

                data.sort(
                    (a, b) =>
                        Number(b.status === "ACTIVE") -
                        Number(b.status === "ACTIVE")
                );

                setModerationHistory(data);
            } catch (error) {
                toast.show("Failed to get moderation history", {
                    subtext: String(error),
                    type: "error"
                });
            }
        };

        fetchModerationHistory();
    }, []);


    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata
                title="Settings"
                allowIndex={false}
            />

            <div className="min-h-[calc(100vh-152px)] w-full max-w-6xl mx-auto px-4 my-16 border-x border-base-300">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold">
                        Settings
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <aside className="md:col-span-1 border-r border-base-300 pr-4">
                        <div className="flex flex-col gap-6">
                            {Object.entries(groupedSections).map(
                                ([group, groupSections]) => (
                                    <div
                                        key={group}
                                        className="flex flex-col"
                                    >
                                        <span className="text-xs font-bold uppercase text-sub mb-2">
                                            {group}
                                        </span>

                                        {groupSections.map((section, index) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setActiveSection(section.id)}
                                                className={`btn justify-start gap-4 h-12 border border-base-300 ${
                                                    index === 0 ? "rounded-t-lg" : "rounded-t-none"
                                                } ${
                                                    index === groupSections.length - 1
                                                        ? "rounded-b-lg"
                                                        : "rounded-b-none"
                                                } ${
                                                    index !== 0 ? "border-t-0" : ""
                                                } ${
                                                    activeSection === section.id
                                                        ? "bg-base-300"
                                                        : "bg-base-200"
                                                }`}
                                            >
                                                <span className="font-nerdfont leading-none text-lg">
                                                    {section.icon}
                                                </span>
                                                {section.label}
                                            </button>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    </aside>

                    <main className="md:col-span-3 min-w-0">
                        {activeSection === "experiments" && (
                            <div className="flex flex-col gap-2">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Experiments
                                    </h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                       Test new features early before they are released or canceled
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 mt-6">
                                    <span className="text-sub text-sm">
                                        Pins common options to the top of the context menu.
                                    </span>
                                    
                                    <CheckboxInput
                                        label="QUICK_ACTIONS_BAR"
                                        // checked={data.fanflair as unknown as boolean}
                                        // onChange={(checked) => handleFieldChange("fanflair", checked ? "true" : "false")}
                                    />
                                </div>

                                <hr />

                                <div className="flex flex-col gap-2">
                                    <span className="text-sub text-sm">
                                        Replaces low resolution URL icons from OpenProfile's API with high-definition ones from Brandfetch's API
                                    </span>
                                    
                                    <CheckboxInput
                                        label="USE_BRANDFETCH_ICONS"
                                        // checked={data.fanflair as unknown as boolean}
                                        // onChange={(checked) => handleFieldChange("fanflair", checked ? "true" : "false")}
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === "bots" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Coming Soon
                                    </h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                       Check back later.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeSection === "billing" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Coming Soon
                                    </h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                       Check back later.
                                    </p>
                                </div>

                                <div>
                                    In the meantime, manage your premium subscription <Link className="link" to="/premium">here</Link>.
                                </div>
                            </div>
                        )}

                        {activeSection === "sessions" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Sessions
                                    </h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                       View and manage sessions that are logged-in to this account.
                                    </p>
                                </div>

                                <div>
                                    {sessions.map((session, index) => {
                                        const isFirst = index === 0;
                                        const isLast = index === sessions.length - 1;
                                        const isCurrent = session.sessionId === window.session.sessionId

                                        const userAgent: UserAgentType = JSON.parse(session.userAgent as unknown as string)
                                        const geoIp: GeoIpType = JSON.parse(session.geoIpLatestFetch as unknown as string)

                                        return (
                                            <div
                                                key={session.sessionId}
                                                className={`
                                                    w-full border-x border-b border-base-300 p-3 transition-colors flex items-center gap-3
                                                    ${isFirst ? "border-t rounded-t" : ""}
                                                    ${isLast ? "rounded-b" : ""}
                                                    ${index % 2 === 0 ? "bg-base-200" : "bg-[#151515]"}
                                                `}
                                            >
                                                <button
                                                    type="button"
                                                    className="opacity-100 flex items-center justify-center p-1"
                                                >
                                                    <span className="font-nerdfont text-xl leading-none text-center w-6">
                                                        {userAgent.device.type === "desktop" ? "" : ""}
                                                    </span>
                                                </button>

                                                <div className="flex-1 flex flex-col gap-1.5 w-full">
                                                    <div className="font-semibold text-sm">
                                                        {userAgent.client.name} on {userAgent.os.name} {isCurrent && (
                                                            <span className="text-success uppercase text-xs ml-2">Current Session</span>                                                                
                                                        )}
                                                    </div>
                                                    <div className="text-sub text-xs inline-flex items-center">
                                                        {session.isConnected ? (
                                                                <span className="relative flex size-2 mr-2">
                                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                                                                    <span className="relative inline-flex size-2 rounded-full bg-success"></span>
                                                                </span>
                                                            ) : (<></>)
                                                        }

                                                        {session.isConnected 
                                                            ? "Active now " : `Last active ${formatShortRelative(session.lastConnectedDate)} `}from{" "}
                                                        {geoIp?.city}
                                                        {geoIp?.city ? ", " : ""}
                                                        {geoIp?.state}
                                                        {geoIp?.state ? ", " : ""}
                                                        {geoIp?.country}
                                                    </div>
                                                </div>

                                                {!isCurrent && (
                                                    <button
                                                        type="button"
                                                        className="text-error w-8 cursor-pointer"
                                                        // onClick={() => onDelete(session.id)}
                                                    >
                                                        <span className="font-nerdfont text-lg leading-none">
                                                            
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeSection === "standing" && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Account Standing</h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                        Check your account status and review any issues affecting your account.
                                    </p>
                                </div>

                                <div className={`
                                    flex gap-4 mt-2 text-sm  border p-4 rounded-xl items-center
                                    ${revokedPermissions.size === 0 ? "bg-success/20 border-success" : "bg-warning/20 border-warning"}
                                `}>
                                    <div className={`
                                        flex items-center justify-center size-12 rounded-full p-2
                                        ${revokedPermissions.size === 0 ? "bg-success/20" : "bg-warning/20"}
                                    `}>
                                        <span className={`
                                            font-nerdfont text-3xl
                                            ${revokedPermissions.size === 0 ? "text-success" : "text-warning"}
                                        `}>
                                            {revokedPermissions.size === 0 ? "" : ""}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <div className={`
                                            text-2xl font-bold
                                            ${revokedPermissions.size === 0 ? "text-success" : "text-warning"}
                                        `}>
                                            {revokedPermissions.size === 0 ? "All Good" : "Limited"}
                                        </div>

                                        {revokedPermissions.size > 0 && (
                                            <MarkdownRenderer
                                                className="text-sm text-warning my-4"
                                                content={`You lost some permissions.\n${Array.from(revokedPermissions.entries())
                                                    .map(([permission, expiresAt]) =>
                                                        `- \`${permission}\` Returns ${formatShortRelative(new Date(expiresAt))}`
                                                    )
                                                    .join("\n")}`}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3 mb-2 text-sub items-center">
                                        <span className="font-nerdfont text-lg"></span>
                                        <p className="text-xs">
                                            Account standing reflects your compliance with our <Link to={`/terms`} className="link">Terms of Service</Link>. 
                                            Any restrictions or moderation actions will appear here.
                                            These actions are currently unable to be appealed as our moderation tools are still under construction.
                                        </p>
                                    </div>

                                    <div className="overflow-y-scroll rounded-xl border border-base-300 flex flex-col items-center justify-center">
                                        {moderationHistory.map((moderation, index) => {
                                            const isLast = index === moderationHistory.length - 1;

                                            const expiresAt = new Date(
                                                new Date(moderation.createdDate).getTime() + moderation.duration
                                            );

                                            return (
                                                <div
                                                    key={moderation.id}
                                                    className={`
                                                        w-full border-base-300 p-3
                                                        transition-colors flex items-center gap-3
                                                        ${isLast ? "" : "border-b"}
                                                        ${index % 2 === 0 ? "bg-base-200" : "bg-[#151515]"}
                                                    `}
                                                >
                                                    <span className={`
                                                        font-nerdfont text-xl leading-none text-center w-6 shrink-0
                                                        ${moderation.status === "ACTIVE" ? "text-warning" : "text-success"}
                                                    `}>
                                                        {moderation.status === "ACTIVE" ? "" : ""}
                                                    </span>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                                                        <div className="font-semibold text-sm wrap-break-word">
                                                            {getModerationReason(
                                                                moderation.type as ModerationReasonNameType
                                                            ).name}
                                                        </div>

                                                        <div className="text-sub text-xs wrap-break-word">
                                                            {getModerationReason(
                                                                moderation.type as ModerationReasonNameType
                                                            ).description}
                                                        </div>

                                                        <div className={`
                                                            text-xs wrap-break-word
                                                            ${moderation.status === "ACTIVE" ? "text-warning" : "text-success"}
                                                        `}>
                                                            {moderation.status === "ACTIVE"
                                                                ? `Active until ${formatShortRelative(expiresAt)}`
                                                                : `Expired ${formatShortRelative(expiresAt)}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === "interests" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Coming Soon
                                    </h2>
                                    <p className="text-sm text-base-content/60 mt-1">
                                       Check back later.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeSection === "privacy" && (
                            <div className="flex flex-col gap-2">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Data & Privacy
                                    </h2>
                                    <p className="text-sm text-sub mt-1">                                    
                                        Choose how your data is collected and used.
                                        Google AdSense is active. Google may independently collect, personalize, and use data in accordance with its own privacy policies. We do not control Google's data practices, and we do not send your data to Google services.
                                        Read our privacy policy <Link className="link" to="/privacy">here</Link>.
                                    </p>
                                </div>

                                <hr />

                                <div className="flex flex-col gap-2">
                                    <span className="text-sub text-sm">
                                        Your interests are inferred from the content you interact with on OpenProfile. You can review and edit them at any time in the interests section of account settings.
                                    </span>
                                    <CheckboxInput checked
                                        label="Allow OpenProfile to personalize my feed based on my interests and activity."
                                        // onChange={(checked) => handleFieldChange("fanflair", checked ? "true" : "false")}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <CheckboxInput checked
                                        label="Allow OpenProfile to personalize the ads and promotions I see based on my interests and activity."
                                        // checked={data.fanflair as unknown as boolean}
                                        // onChange={(checked) => handleFieldChange("fanflair", checked ? "true" : "false")}
                                    />
                                </div>

                                <hr />

                                <div className="flex flex-col gap-2">
                                    <span className="text-sub text-sm">
                                        Optional Opt-in
                                    </span>
                                    <CheckboxInput
                                        label="Allow OpenProfile to collect and analyze anonymous usage data, such as navigation patterns and time spent interacting with pages. This helps us understand how people use our services, identify areas for improvement, and create a better user experience."
                                        // checked={data.fanflair as unknown as boolean}
                                        // onChange={(checked) => handleFieldChange("fanflair", checked ? "true" : "false")}
                                    />
                                </div>

                                <hr />

                                <span className="text-sub text-sm">
                                    You can request your data every 30 days. (coming soon)
                                </span>

                                <button 
                                    className="btn btn-accent"
                                    disabled={true}
                                >
                                    Request Your Data
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
