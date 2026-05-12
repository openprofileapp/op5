import { useTranslation } from "react-i18next";

import { Metadata } from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";

export default function Partners() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>
            <Metadata
                title="Partner Stats"
                allowIndex="false"
            />

            <Navbar />

            <div className="mt-14 md:mt-0 flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-164 h-128 grid grid-cols-3 grid-rows-3 place-items-center text-center text-sm">
                        <div className="col-start-2 row-start-1 text-2xl">
                            <span className="font-bold mr-3">inviteCode</span>
                            <span className="tooltip tooltip-top tooltip-accent" 
                                data-tip="Copy to Clipboard">
                                <span className="cursor-pointer font-nerdfont">󰅇</span>
                            </span>
                        </div>

                        <div className="col-start-1 row-start-2 font-bold flex flex-col gap-4 ">
                            <span className="text-base">Registrations</span>
                            <span className="text-2xl">4</span>
                        </div>

                        <div className="col-start-2 row-start-2 text-lg font-bold">
                            <div className="absolute radial-progress text-[#272727] bg-alt" style={{"--value":100}} 
                                aria-valuenow={100} role="progressbar">
                            </div>
                            <div className="radial-progress text-premium text-base" style={{"--value":75}} 
                                aria-valuenow={75} role="progressbar">75%
                            </div>
                        </div>

                        <div className="col-start-3 row-start-2 font-bold flex flex-col gap-4 ">
                            <span className="text-base">Premium Users</span>
                            <span className="text-2xl">3</span>
                        </div>

                        <div className="col-start-2 row-start-3 font-bold flex flex-col gap-4">
                            <span className="text-base">Earnings</span>
                            <span className="font-bold text-2xl">$3.74</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5 items-end justify-center h-full m-4 md:m-16">
                    <div className="font-bold text-lg w-full text-center mt-8 md:mt-0">Registrations</div>
                    <div className="bg-alt overflow-x-auto w-full h-132 md:w-148 rounded-lg border border-alt">
                        <table className="table rounded-none">
                            <thead className="guide sticky top-0 z-1">
                                <tr>
                                    <th className="w-1 px-6">
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                            />
                                        </label>
                                    </th>

                                    <th className="text-left px-2">
                                        User
                                    </th>

                                    <th className="text-right px-2">
                                        Premium
                                    </th>

                                    <th className="text-right px-6">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td className="w-1 px-6">
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                            />
                                        </label>
                                    </td>

                                    <td className="px-2">
                                        <div className="flex items-center gap-3">

                                            <div className="avatar">
                                                <div className="mask mask-circle h-12 w-12">
                                                    <img
                                                        src={`https://${window.config.domains.cdn}/graphics/alice-happy.svg`}
                                                        alt="Avatar"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-base font-bold">
                                                    Alice
                                                </div>

                                                <span className="text-sm">
                                                    @alice
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-right px-2 whitespace-nowrap">
                                        <div>
                                            <span className="badge text-black bg-premium badge-sm">
                                                Trial
                                            </span>
                                        </div>
                                    </td>

                                    <td className="text-right px-6 whitespace-nowrap">
                                        5 minutes ago
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-1 px-6">
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                            />
                                        </label>
                                    </td>

                                    <td className="px-2">
                                        <div className="flex items-center gap-3">

                                            <div className="avatar">
                                                <div className="mask mask-circle h-12 w-12">
                                                    <img
                                                        src={`https://${window.config.domains.cdn}/graphics/alice-happy.svg`}
                                                        alt="Avatar"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-base font-bold">
                                                    Alice
                                                </div>

                                                <span className="text-sm">
                                                    @alice
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-right px-2 whitespace-nowrap">
                                        <div>
                                            <span className="badge text-black bg-premium badge-sm">
                                                Subscribed
                                            </span>
                                        </div>
                                    </td>

                                    <td className="text-right px-6 whitespace-nowrap">
                                        03/01/2026
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-1 px-6">
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                            />
                                        </label>
                                    </td>

                                    <td className="px-2">
                                        <div className="flex items-center gap-3">

                                            <div className="avatar">
                                                <div className="mask mask-circle h-12 w-12">
                                                    <img
                                                        src={`https://${window.config.domains.cdn}/graphics/alice-happy.svg`}
                                                        alt="Avatar"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-base font-bold">
                                                    Alice
                                                </div>

                                                <span className="text-sm">
                                                    @alice
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-right px-2 whitespace-nowrap">
                                        <div>
                                            Canceled
                                        </div>
                                    </td>

                                    <td className="text-right px-6 whitespace-nowrap">
                                        02/01/2026
                                    </td>
                                </tr>
                                <tr>
                                    <td className="w-1 px-6">
                                        <label>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                            />
                                        </label>
                                    </td>

                                    <td className="px-2">
                                        <div className="flex items-center gap-3">

                                            <div className="avatar">
                                                <div className="mask mask-circle h-12 w-12">
                                                    <img
                                                        src={`https://${window.config.domains.cdn}/graphics/alice-happy.svg`}
                                                        alt="Avatar"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-base font-bold">
                                                    Alice
                                                </div>

                                                <span className="text-sm">
                                                    @alice
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-right px-2 whitespace-nowrap">
                                        <div>
                                            <span className="badge text-black bg-premium badge-sm">
                                                Lifetime
                                            </span>
                                        </div>
                                    </td>

                                    <td className="text-right px-6 whitespace-nowrap">
                                        01/01/2026
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}