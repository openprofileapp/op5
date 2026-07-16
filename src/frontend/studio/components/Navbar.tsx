import { Link, To } from "react-router-dom";
import { useTranslation } from "react-i18next";

import i18n from "../../_common/i18n.js";

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

    const changeLang = (lng: string) => {
        localStorage.setItem("locale", lng);
        i18n.changeLanguage(lng);
    };

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">{config.metadata.name}</a>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to={dest}>{linkName}</Link></li>
                </ul>
            </div>

            <button className="btn" popoverTarget="popover-1" style={{ anchorName: "--anchor-1" }}>
                Language
            </button>

            <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
                popover="auto" id="popover-1" style={{ positionAnchor: "--anchor-1" }}>
                <li onClick={() => changeLang("en")}><a>English</a></li>
                <li onClick={() => changeLang("zh")}><a>Chinese</a></li>
                <li onClick={() => changeLang("es")}><a>Spanish</a></li>
                <li onClick={() => changeLang("hi")}><a>Hindi</a></li>
                <li onClick={() => changeLang("ar")}><a>Arabic</a></li>
                <li onClick={() => changeLang("ru")}><a>Russian</a></li>
                <li onClick={() => changeLang("id")}><a>Indonesian</a></li>
                <li onClick={() => changeLang("ja")}><a>Japanese</a></li>
            </ul>
        </div>
    );
}