import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Navbar() {
    const config = window.config;

    const { t, ready } = useTranslation();

    if (!ready) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [scrolled, setScrolled] = useState(false);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const location = useLocation();
    const isHome = location.pathname === "/";

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (!isHome) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setScrolled(true);
            return;
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 16);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHome]);

    return (
        <>
            <div className={`
                    sticky top-0 z-9999 hidden md:flex navbar items-center gap-4 px-16
                    ${
                        scrolled
                            ? "bg-base-100 shadow-sm border-b border-base-300"
                            : "bg-gradient-to-b from-base-100 via-base-100 to-base-100 border-b border-base-100"
                    }
                `}>
                <div className="flex flex-1 items-center">
                    <Link className="cursor-pointer w-42" to="/">
                        <img alt="OpenProfile wordmark"
                            src={`https://${config.domains.cdn}${config.metadata.assets.wordmark}`} 
                        />
                    </Link>

                    <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent ml-3 p-3.5 flex justify-center rounded-sm">
                        Beta
                        <div className="tooltip-content">
                            <div className="font-bold">{`v${config.metadata.version.full}`}</div>
                            <div className="text-xs">Released on ??/??/2026</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 ml-10 text-sm">
                        <Link className="link-hover" to="/">Home</Link>
                        <Link className="link-hover" to="/popular">Popular</Link>
                        <Link className="link-hover" to="/trending">Trending</Link>
                        <Link className="link-hover" to="/recent">New & Updated</Link>

                        <div className="flex-none">
                            <ul className="menu menu-horizontal p-0">
                                <li
                                    className="hover:bg-transparent"
                                    onMouseEnter={(e) =>
                                        e.currentTarget.querySelector("details").setAttribute("open", "")
                                    }
                                    onMouseLeave={(e) =>
                                        e.currentTarget.querySelector("details").removeAttribute("open")
                                    }
                                >
                                <details>
                                    <summary className="hover:bg-transparent active:bg-transparent focus:bg-transparent pl-0">
                                        Browse
                                    </summary>

                                    <ul className="bg-base-100 rounded-lg bg-alt border border-alt p-4 flex flex-col gap-3 w-50">
                                        <Link className="link-hover" to="/browse/action">Action</Link>
                                        <Link className="link-hover" to="/browse/adventure">Adventure</Link>
                                        <Link className="link-hover" to="/browse/comedy">Comedy</Link>
                                        <Link className="link-hover" to="/browse/crime">Crime</Link>
                                        <Link className="link-hover" to="/browse/fantasy">Fantasy</Link>
                                        <Link className="link-hover" to="/browse/historical">Historical</Link>
                                        <Link className="link-hover" to="/browse/horror">Horror</Link>
                                        <Link className="link-hover" to="/browse/mystery">Mystery</Link>
                                        <Link className="link-hover" to="/browse/romance">Romance</Link>
                                        <Link className="link-hover" to="/browse/sci-fi">Sci-Fi</Link>
                                        <Link className="link-hover" to="/browse/sport">Sport</Link>
                                        <Link className="link-hover" to="/browse/war">War</Link>
                                    </ul>
                                </details>
                                </li>
                            </ul>
                        </div>

                        {/*<span>|</span>
                        <Link className="link-hover" to="/account/dashboard">Dashboard</Link>
                        <Link className="link-hover" to="/account/library">My library</Link>
                        <Link className="link-hover" to="/account/partners">Partner Stats</Link>*/}
                    </div>
                </div>

                <div className="flex items-center gap-5">

                    <div className="flex flex-1 flex-col w-72">
                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1"></span>
                            <input type="search" required placeholder="Characters, franchises, topics..." />
                        </label>
                    </div>
                    {/* While typing, auto forward to search and display results, on clear, return home */}
                    
                    {/*<Link to="/premium">
                        <div className="badge text-black border-0 tooltip tooltip-bottom tooltip-info p-3.5 flex justify-center rounded-m bg-premium">
                            <span className="font-nerdfont text-base mr-1"></span>
                            Lifetime Premium
                            <div className="tooltip-content">
                                <div className="font-bold">You've got life-time premium!</div>
                                <div className="text-xs">Thanks for registering early</div>
                            </div>
                        </div>
                    </Link>*/}

                    <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent" 
                        data-tip="Create" onClick={()=>document.getElementById("create-asset").showModal()}>
                        <span className="font-nerdfont text-xl"></span>
                    </button>

                    <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent" 
                        data-tip="Report">
                        <span className="font-nerdfont text-xl"></span>
                    </button>

                    <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent">
                        <span className="font-nerdfont text-xl">󰂚</span>
                        <div className="tooltip-content">
                            <div className="font-bold">Notifications</div>
                            <div className="text-xs">No new notifications!</div>
                        </div>
                    </button>

                    <div className="tooltip tooltip-bottom tooltip-accent">
                        <button className="avatar cursor-pointer" popoverTarget="account-dropdown" 
                        style={{ anchorName: "--account-anchor" }}>
                            <div className="ring-primary ring-offset-base-100 h-8 w-8 rounded-full">
                                <img src="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/mp4vq9qxv51.png" />
                            </div>
                        </button>
                        <div className="tooltip-content text-left">
                            <div className="font-bold">@username</div>
                            <div className="text-xs">102 Followers</div>
                        </div>
                    </div>
                </div>

                { /* Maybe this can be a menu-hoz like for links */}
                <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" 
                    popover="auto" id="account-dropdown" style={{ positionAnchor: "--account-anchor" }}>
                    <li>
                        <Link to="/">My Profile</Link>
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

            <div className={`md:hidden sticky top-0 z-9999 navbar

                ${
                    scrolled
                        ? "bg-base-100 shadow-sm border-b border-base-300"
                        : "bg-gradient-to-b from-base-100 via-base-100 to-base-100 border-b border-base-100"
                }`}
            >
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="cursor-pointer ml-2">
                            <span className="font-nerdfont text-2xl">󰍜</span>
                        </div>
                        <ul tabIndex={-1} className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow p-4 flex flex-col gap-3 w-50">
                            <Link className="link-hover" to="/">Home</Link>
                            <Link className="link-hover" to="/search">Search</Link>
                            <hr></hr>
                            <Link className="link-hover" to="/account/dashboard">Dashboard</Link>
                            <Link className="link-hover" to="/account/library">My library</Link>
                            <Link className="link-hover" to="/account/partners">Partner Stats</Link>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <Link className="cursor-pointer w-42" to="/">
                        <img alt="OpenProfile wordmark"
                            src={`https://${config.domains.cdn}${config.metadata.assets.wordmark}`} 
                        />
                    </Link>
                    <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent ml-3 p-3.5 flex justify-center rounded-sm">
                        Beta
                        <div className="tooltip-content">
                            <div className="font-bold">{`v${config.metadata.version.full}`}</div>
                            <div className="text-xs">Released on ??/??/2026</div>
                        </div>
                    </div>
                </div>
                <div className="navbar-end">
                    <button className="cursor-pointer mr-2">
                            <span className="font-nerdfont text-xl"></span>
                    </button>
                </div>
            </div>

            <div className="dock md:hidden border-t border-base-300 z-999">
                <button className="dock-active">
                    <div className="text-xl font-nerdfont text-white"></div>
                    <span className="dock-label text-white">Home</span>
                </button>

                <button>
                    <div className="text-xl font-nerdfont">󰕮</div>
                    <span className="dock-label">Dashboard</span>
                </button>

                <button className="bg-accent rounded-4xl" onClick={()=>document.getElementById("create-asset").showModal()}>
                    <div className="text-xl font-nerdfont"></div>
                    <span className="dock-label">Create</span>
                </button>
                
                <button>
                    <div className="text-xl font-nerdfont">󰂚</div>
                    <span className="dock-label">Notifications</span>
                </button>
                
                <button>
                    <div className="text-xl font-nerdfont"></div>
                    <span className="dock-label">My Profile</span>
                </button>
            </div>

            {/* Move this out of this file as component */}
            <dialog id="create-asset" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                    </form>
                    <h3 className="font-bold text-2xl text-center">Create New Asset</h3>
                    <p className="py-4 text-sm text-center">What would you like to create?</p>

                    <div className="pt-4 flex gap-4 flex-col relative">
                        <div className="btn btn-disabled py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Collection (coming soon)</div>
                                <div className="text-sm">Personal list of various characters</div>
                            </div>
                        </div>

                        <div className="btn btn-disabled py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Project (coming soon)</div>
                                <div className="text-sm">Official list and identity of characters</div>
                            </div>
                        </div>


                        <div className="btn py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                󰈙
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Character</div>
                                <div className="text-sm">Individual character identity</div>
                            </div>
                        </div>
                    </div>     
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}