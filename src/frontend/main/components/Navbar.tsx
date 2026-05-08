import { Link, To } from "react-router-dom";
import { useTranslation } from "react-i18next";

type NavbarProps = {
    dest: To;
};

export default function Navbar({ dest }: NavbarProps) {
    let linkName = "";
    const config = window.config;

    const { t, ready } = useTranslation();

    if (!ready) return null;

    if (dest === "/") {
        linkName = t("pages.about.goHome");
    } else {
        linkName = t("pages.home.goAbout");
    }

    return (
        <div className="navbar bg-base-100 shadow-sm border-b border-base-300 items-center gap-4 px-16">
            <div className="flex flex-1 items-center gap-5">
                <a className="btn-ghost text-xl">
                    {config.metadata.name}
                </a>

                <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent">
                    Beta
                    <div className="tooltip-content p-3">
                        <div className="font-bold">v5.0.237.2-beta</div>
                        <div className="text-xs">Released on 2/3/2026</div>
                    </div>
                </div>

                <Link className="link link-hover" to={dest}>Home</Link>
                <Link className="link link-hover" to={dest}>Characters</Link>
                <Link className="link link-hover" to={dest}>Universes</Link>
                <Link className="link link-hover" to={dest}>Users</Link>
                <span>|</span>
                <Link className="link link-hover" to={dest}>Dashboard</Link>
                <Link className="link link-hover" to={dest}>My library</Link>
                <span>|</span>
                <Link className="link link-hover" to={dest}>Partner Portal</Link>
            </div>

            <div className="flex items-center gap-5">
                <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent">
                    <span className="mr-2" style={{ fontFamily: "NerdFont" }}></span>
                    Lifetime Premium
                    <div className="tooltip-content p-3">
                        <div className="font-bold">You've got life-time premium!</div>
                        <div className="text-xs">Thanks for registering early</div>
                    </div>
                </div>
                
                <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent" 
                    data-tip="Report">
                    <span className="text-xl" style={{ fontFamily: "NerdFont" }}></span>
                </button>

                <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent">
                    <span className="text-xl" style={{ fontFamily: "NerdFont" }}>󰂚</span>
                    <div className="tooltip-content p-3">
                        <div className="font-bold">Notifications</div>
                        <div className="text-xs">No new notifications!</div>
                    </div>
                </button>

                <div className="tooltip tooltip-bottom tooltip-accent">
                    <button className="avatar cursor-pointer" popoverTarget="account-dropdown" 
                    style={{ anchorName: "--account-anchor" }}>
                        <div className="ring-primary ring-offset-base-100 h-8 w-8 rounded-full">
                            <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                        </div>
                    </button>
                    <div className="tooltip-content p-3 text-left">
                        <div className="font-bold">@username</div>
                        <div className="text-xs">102 Followers</div>
                    </div>
                </div>
            </div>

            <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" 
                popover="auto" id="account-dropdown" style={{ positionAnchor: "--account-anchor" }}>
                <li>
                    <Link to={dest}>My Profile</Link>
                </li>
                <li>
                    <a className="justify-between">
                        Settings
                        <span className="badge badge-accent">New</span>
                    </a>
                </li>
                <li><a>Logout</a></li>
            </ul>
        </div>
    );
}