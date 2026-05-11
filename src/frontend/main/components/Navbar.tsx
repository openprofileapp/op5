import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navbar() {
    const config = window.config;

    const { t, ready } = useTranslation();

    if (!ready) return null;

    return (
        <>
            <div className="sticky top-0 z-9999 hidden md:flex navbar bg-base-100 shadow-sm border-b border-base-300 items-center gap-4 px-16">
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
                        <Link className="link-hover" to="/profiles">Characters</Link>
                        <Link className="link-hover" to="/universes">Universes</Link>
                        <Link className="link-hover" to="/users">Users</Link>
                        <span>|</span>
                        <Link className="link-hover" to="/dashboard">Dashboard</Link>
                        <Link className="link-hover" to="/library">My library</Link>
                        <span>|</span>
                        <Link className="link-hover" to="/partner">Partner Portal</Link>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="badge text-black border-0 tooltip tooltip-bottom tooltip-info p-3.5 flex justify-center rounded-m bg-premium">
                        <span className="font-nerdfont text-base mr-1"></span>
                        Lifetime Premium
                        <div className="tooltip-content">
                            <div className="font-bold">You've got life-time premium!</div>
                            <div className="text-xs">Thanks for registering early</div>
                        </div>
                    </div>

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
                                <img src="https://img.daisyui.com/images/profile/demo/spiderperson@192.webp" />
                            </div>
                        </button>
                        <div className="tooltip-content text-left">
                            <div className="font-bold">@username</div>
                            <div className="text-xs">102 Followers</div>
                        </div>
                    </div>
                </div>

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

            <div className="md:hidden sticky top-0 z-9999 navbar bg-base-100 border-b border-base-300 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="cursor-pointer ml-2">
                            <span className="font-nerdfont text-2xl">󰍜</span>
                        </div>
                        <ul tabIndex={-1} className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            <Link className="link-hover" to="/">Home</Link>
                            <Link className="link-hover" to="/profiles">Characters</Link>
                            <Link className="link-hover" to="/universes">Universes</Link>
                            <Link className="link-hover" to="/">Users</Link>
                            <br></br>
                            <Link className="link-hover" to="/">Dashboard</Link>
                            <Link className="link-hover" to="/">My library</Link>
                            <br></br>
                            <Link className="link-hover" to="/">Partner Portal</Link>
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

            <div className="dock md:hidden border-t border-base-300">
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
                                <div className="text-lg font-bold">Almanac (coming soon)</div>
                                <div className="text-sm">Collection of various universes and profiles</div>
                            </div>
                        </div>

                        <div className="btn btn-disabled py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Multiverse (coming soon)</div>
                                <div className="text-sm">Collection and identity of your universes</div>
                            </div>
                        </div>

                        <div className="btn btn-disabled py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Universe (coming soon)</div>
                                <div className="text-sm">Collection and identity of your profiles</div>
                            </div>
                        </div>

                        <div className="btn py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                󰈙
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Profile</div>
                                <div className="text-sm">Individual character profile identity</div>
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