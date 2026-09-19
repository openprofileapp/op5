import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";

export default function Dashboard() {
    const { t, ready: isTranslationReady } = useTranslation();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, []);

    if (!isTranslationReady) return null;
    
    return (
        <>
            <Metadata
                title="Dashboard"
                allowIndex="false"
            />

            <div className="flex gap-4 w-full h-full overflow-hidden m-4">
                <div className="flex-2 flex flex-col gap-4 overflow-hidden">
                    <div className="bg-base-100 border border-base-300 p-6 rounded-lg shrink-0">
                        <div className="w-full text-lg font-bold mb-2 text-center">
                            Welcome back, {window.session.user?.displayName}
                        </div>
                        <div className="w-full text-sub text-sm text-center">
                            “Characters may be fictional, but their influence is real” - AvatarKage
                        </div>
                    </div>

                    <div className="relative flex flex-col gap-4 overflow-hidden">
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
                            <span className="bg-accent text-lg font-medium px-4 py-2 rounded-lg">
                                Coming Soon
                            </span>
                        </div>

                        <div className="bg-base-100 border border-base-300 p-6 rounded-lg blur pointer-events-none select-none overflow-hidden">
                            <div className="w-full text-lg font-bold mb-6">
                                Pending Invites (1)
                            </div>

                            <div className="flex flex-col gap-4">
                                <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                    J9 Studios invited you as a publisher for Lance McDaniels
                                    <div className="text-sub text-sm">Permissions: MANAGE_PUBLICATIONS, REVIEW_CHANGES</div>
                                    <div className="flex flex-row gap-2 mt-3">
                                        <button className="btn btn-secondary">Reject</button>
                                        <button className="btn btn-accent">Accept</button>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-base-100 border border-base-300 p-6 rounded-lg blur pointer-events-none select-none overflow-hidden">
                            <div className="w-full text-lg font-bold mb-6">
                                Assigned to You (2)
                            </div>

                            <div className="flex flex-col gap-4">
                                <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                    J9 Studios assigned you to edit Mable Jackson
                                    <div className="text-sub text-sm">Field: job-description</div>
                                    <div className="flex flex-row gap-2 mt-3">
                                        <button className="btn btn-secondary">Reject with Reason</button>
                                        <button className="btn btn-accent">Mark as Completed</button>
                                    </div>
                                </button>

                                <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                    J9 Studios assigned you to edit Julia Anderson
                                    <div className="text-sub text-sm">Field: supernatural-ability</div>
                                    <div className="flex flex-row gap-2 mt-3">
                                        <button className="btn btn-secondary">Reject with Reason</button>
                                        <button className="btn btn-accent">Mark as Completed</button>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex-1 overflow-hidden">
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
                        <span className="bg-accent text-lg font-medium px-4 py-2 rounded-lg">
                            Coming Soon
                        </span>
                    </div>

                    <div className="h-full bg-base-100 border border-base-300 p-6 rounded-lg overflow-hidden blur pointer-events-none select-none">
                        <div className="w-full text-lg font-bold mb-6">
                            Edits to Review (12)
                        </div>

                        <div className="flex flex-col gap-4">
                            <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                J9 Studios made an edit to Shade
                                <div className="text-sub text-sm">Field: physical-description at 6:21 PM</div>
                                <div className="flex flex-row gap-2 mt-3">
                                    <button className="btn btn-secondary">Reject</button>
                                    <button className="btn btn-accent">Approve</button>
                                </div>
                            </button>

                            <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                AlphaFarlander made an edit to Alice
                                <div className="text-sub text-sm">Field: hair-color at 4:41 PM</div>
                                <div className="flex flex-row gap-2 mt-3">
                                    <button className="btn btn-secondary">Reject</button>
                                    <button className="btn btn-accent">Approve</button>
                                </div>
                            </button>

                            <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                Usagicros made an edit to Persus
                                <div className="text-sub text-sm">Field: birth-event at 9:34 AM</div>
                                <div className="flex flex-row gap-2 mt-3">
                                    <button className="btn btn-secondary">Reject</button>
                                    <button className="btn btn-accent">Approve</button>
                                </div>
                            </button>

                            <button className="flex flex-col bg-base-200 border border-base-300 rounded p-4 w-full gap-1 text-left">
                                Nytokio made an edit to Alice
                                <div className="text-sub text-sm">Field: job-title at 12:01 AM</div>
                                <div className="flex flex-row gap-2 mt-3">
                                    <button className="btn btn-secondary">Reject</button>
                                    <button className="btn btn-accent">Approve</button>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
