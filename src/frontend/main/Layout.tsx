import { useLocation } from "react-router-dom"

import ScrollToTop from "../_common/components/ScrollToTop.js"
import ToastContainer from "../_common/components/ToastContainer.js"
import CaptchaPortal from "../_common/components/modals/CaptchaPortal.js"
import Messages from "../_common/components/Messages.js"
import Navbar from "./components/Navbar.js"
import Footer from "./components/Footer.js"
import BannerContainer from "../_common/components/BannerContainer.js"

const execludedPaths = [
    "/404",
    "/503",
    "/account/library"
];

function HeaderWrapper() {
    return (
        <header className="sticky top-0 z-9999 w-full">
            <BannerContainer />
            <Navbar />
        </header>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    const hideLayout = execludedPaths.some((path) => 
        location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    return (
        <>
            <ScrollToTop />
            <ToastContainer />
            {!hideLayout && <CaptchaPortal siteKey={window.config.integrations.hcaptcha} />}
            {!hideLayout && <Messages />}
            {!hideLayout && <HeaderWrapper />}
            {children}
            {!hideLayout && <Footer />}
        </>
    );
}
