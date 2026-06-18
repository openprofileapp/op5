import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../../scripts/toast.js";
import { generateQrCode } from "../../scripts/generateQrCode.js";

type MfaMethod =
    | "menu"
    | "totp"
    | "biometric"
    | "connection"
    | "qr"
    | "backup";

type AvailableMethod =
    | "totp"
    | "biometric"
    | "connection"
    | "qr"
    | "backup";

const METHODS = {
    totp: {
        icon: "󱎫",
        title: "Authenticator App Code",
        description: "Use a code from Google Authenticator, 2FAS, Authy, etc."
    },
    biometric: {
        icon: "󰈷",
        title: "Biometric Authentication",
        description: "Use Face ID, Touch ID, Windows Hello, or similar."
    },
    connection: {
        icon: "",
        title: "Connected Account",
        description: "Sign-in to a connected account."
    },
    qr: {
        icon: "󰐲",
        title: "Scan QR Code",
        description: "Scan a QR code using another signed-in device."
    },
    backup: {
        icon: "󰟵",
        title: "Backup Code",
        description: "Use one of your recovery codes."
    }
} as const;

export default function MfaModal() {
    const { ready } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [loadingConnection, setLoadingConnection] = useState<string | null>(null);
    const [screen, setScreen] = useState<MfaMethod>("menu");
    const [methods, setMethods] = useState<AvailableMethod[]>([]);
    const [isSingleMethod, setIsSingleMethod] = useState(false);
    const [totp, setTotp] = useState<string[]>(Array(6).fill(""));
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const [totpCode, setTotpCode] = useState("");
    const [backupCode, setBackupCode] = useState("");

    const inputs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        async function loadMethods() {
            try {
                setLoading(true);

                const response = await fetch(
                    `https://${window.config.domains.auth}/mfa/methods`,
                    { credentials: "include" }
                );

                const json = await response.json();
                const availableMethods = json.methods ?? [];

                setMethods(availableMethods);

                if (availableMethods.length === 1) {
                    setIsSingleMethod(true);
                    setScreen(availableMethods[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadMethods();
    }, []);

    useEffect(() => {
        if (!loading && screen === "qr") {
            generateQrCode("https://auth.openprofile.app/mfa/verify/HnE55Kepsy66DZka1h4CHzsoSvGlfb3ZwotqUMq4wNceuiuLhxSjeypKRZQZpLPf").then((url) => {
                if (url) setQrCodeUrl(url);
            });
        }
    }, [loading, screen]);

    /*useEffect(() => {
        socket.on("mfa_loading", () => {
            setLoading(true);
        });

        return () => {
            socket.off("mfa_loading");
        };
    }, []);*/

    function go(method: AvailableMethod) {
        if (method === "totp") setScreen("totp");
        else if (method === "biometric") setScreen("biometric");
        else if (method === "connection") setScreen("connection");
        else if (method === "qr") setScreen("qr");
        else if (method === "backup") setScreen("backup");
    }

    function handleChange(value: string, index: number) {
        if (!/^\d?$/.test(value)) return; // only digits

        const newTotp = [...totp];
        newTotp[index] = value;
        setTotp(newTotp);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent, index: number) {
        if (e.key === "Backspace" && !totp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    }

    function resetTotp() {
        setTotp(Array(6).fill(""));
        setTotpCode("");
    }

    async function verifyTotp() {
        try {
            setLoading(true);

            const res = await fetch(
                `https://${window.config.domains.auth}/mfa/verify`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        method: "totp",
                        code: totpCode
                    })
                }
            );

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            window.location.href = "/";
        } finally {
            setLoading(false);
        }
    }

    async function authenticateBiometric() {
        try {
            setLoading(true);

            // Get challenge/options from backend
            const res = await fetch(
                `https://${window.config.domains.auth}/mfa/webauthn/options`,
                {
                    credentials: "include"
                }
            );

            const options = await res.json();

            // Browser shows Windows Hello / Face ID / Touch ID
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: Uint8Array.from(
                        atob(options.challenge),
                        c => c.charCodeAt(0)
                    ),

                    rpId: options.rpId,

                    userVerification: "required",

                    timeout: 60000
                }
            });

            // Send assertion back to backend
            await fetch(
                `https://${window.config.domains.auth}/mfa/webauthn/verify`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(credential)
                }
            );

            window.location.href = "/";
        } finally {
            setLoading(false);
        }
    }

    async function verifyBackupCode() {
        try {
            setLoading(true);

            const res = await fetch(
                `https://${window.config.domains.auth}/mfa/verify`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        method: "backup",
                        code: backupCode
                    })
                }
            );

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            window.location.href = "/";
        } finally {
            setLoading(false);
        }
    }

    if (!ready) return null;

    return (
        <dialog id="mfa" className="modal">
            <div className="modal-box flex flex-col">

                <form method="dialog">
                    <button 
                        className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer"
                        onClick={() => resetTotp()}
                    >
                        
                    </button>
                </form>

                {!isSingleMethod && screen !== "menu" && (
                    <button
                        className="absolute left-0 top-1 m-5 flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            resetTotp();
                            setScreen("menu");
                        }}
                    >
                        <span className="text-xl font-nerdfont leading-none"></span>
                        <span>Back</span>
                    </button>
                )}

                <div className="absolute top-12 left-6 right-6 md:relative md:top-0 md:right-0 md:left-0 pointer-events-none mb-8">
                    <h3 className="font-nerdfont text-6xl text-center mb-4">
                        
                    </h3>

                    <h3 className="text-center text-2xl font-bold">
                        Multi-factor Authentication
                    </h3>

                    <p className="text-center text-sm text-sub py-4">
                        {screen === "menu" ? 
                            "How would you like to proceed?" : 
                            "Complete the challenge to proceed."
                        }
                    </p>
                </div>

                <div>
                    {loading && screen !== "biometric" && screen !== "qr" && (
                        <div className="flex justify-center py-10">
                            <span className="loading loading-spinner" />
                        </div>
                    )}

                    {!loading && screen === "menu" && (
                        <div className="flex flex-col gap-2">
                            {methods.map((m) => {
                                const cfg = METHODS[m];

                                if (!cfg) return null;

                                return (
                                    <button
                                        key={m}
                                        className="btn bg-base-100 border border-base-300 gap-4 h-16"
                                        onClick={() => go(m)}
                                    >
                                        <div className="text-xl w-6 font-nerdfont">
                                            {cfg.icon}
                                        </div>

                                        <div className="flex flex-col text-left flex-1">
                                            <div>{cfg.title}</div>
                                            <div className="text-xs text-sub">
                                                {cfg.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!loading && screen === "totp" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex gap-3 justify-center">
                                {totp.map((digit, i) => (
                                    <input
                                        className="w-14 h-16 text-center text-3xl font-bold input input-bordered"
                                        key={i}
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        ref={(el) => (inputs.current[i] = el)}
                                        value={digit}
                                        onChange={(e) =>
                                            handleChange(e.target.value, i)
                                        }
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        maxLength={1}
                                        inputMode="numeric"
                                    />
                                ))}
                            </div>

                            <div className="text-sub text-sm text-center">
                                Enter your 6-digit authentication code
                            </div>
                        </div>
                    )}

                    {!loading && screen === "backup" && (
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex gap-3 justify-center w-full">
                                <input
                                    className="input input-bordered"
                                    placeholder="Backup code"
                                    value={backupCode}
                                    onChange={(e) =>
                                        setBackupCode(e.target.value)
                                    }
                                />
                            </div>

                            <div className="text-sub text-sm text-center">
                                Enter your recovery code
                            </div>
                        </div>
                    )}

                    {screen === "biometric" && (
                        <>
                            <div className="flex items-center justify-center">
                                <button
                                    className="btn bg-base-100 border border-base-300 gap-4 w-64 h-64 font-nerdfont leading-none text-9xl"
                                    onClick={authenticateBiometric}
                                >
                                    {!loading ? "󰈷" : ""}

                                    {loading && (
                                        <span className="loading w-16 h-16"></span>
                                    )}
                                </button>
                            </div>

                            <div className="text-sub text-sm text-center mt-8">
                                Click to authenticate
                            </div>
                        </>
                    )}

                    {!loading && screen === "connection" && (
                        <div className="flex flex-col gap-2 relative">
                            {methods
                                .filter((m) => m === "connection")
                                .map(() => (
                                    <>
                                        {/* Google */}
                                        <button 
                                            className="btn bg-white font-normal text-black border-white tooltip tooltip-top" 
                                            data-tip="Google"
                                            onClick={async () => {
                                                try {
                                                    setLoadingConnection("google");
                                                    const response = await loginWithGoogleMfa(); // https://auth.openprofile.app/mfa/login/google
                                                    if (!response?.ok) throw new Error();
                                                } catch {
                                                    setLoadingConnection(null);
                                                    toast.show("Login failed! Please try again.", { icon: "", type: "error" });
                                                }
                                            }}
                                        >
                                            <div className={`${loadingConnection === "google" ? "loading" : ""}`}>
                                                <svg className={`${loadingConnection === "google" ? "hidden" : ""}`} height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                                            </div>
                                        </button>

                                        {/* X */}
                                        <button 
                                            className="btn bg-black font-normal text-white border-[var(--color-base-300)] tooltip tooltip-top" 
                                            data-tip="X"
                                            onClick={async () => {
                                                try {
                                                    setLoadingConnection("x");                    
                                                    const response = await loginWithXMfa();
                                                    if (!response?.ok) throw new Error();
                                                } catch {
                                                    setLoadingConnection(null);
                                                    toast.show("Login failed! Please try again.", { icon: "", type: "error" });
                                                }
                                            }}
                                        >
                                            <div className={`text-2xl font-nerdfont ${loading === "x" ? "loading" : ""}`}>
                                                
                                            </div>
                                        </button>

                                        {/* Discord */}
                                        <button
                                            className="btn font-normal bg-[#5865F2] text-white border-[#5865F2] tooltip tooltip-top"
                                            data-tip="Discord"
                                            onClick={async () => {
                                                try {
                                                    setLoadingConnection("discord");                    
                                                    const response = await loginWithDiscordMfa();
                                                    if (!response?.ok) throw new Error();
                                                } catch {
                                                    setLoadingConnection(null);
                                                    toast.show("Login failed! Please try again.", { icon: "", type: "error" });
                                                }
                                            }}
                                        >
                                            <div className={`text-2xl font-nerdfont ${loading === "discord" ? "loading" : ""}`}>
                                                
                                            </div>
                                        </button>
              
                                        {/* GitHub */}
                                        <button 
                                            className="btn font-normal bg-[#6e5494] text-white border-[#6e5494] tooltip tooltip-top" 
                                            data-tip="GitHub"
                                            onClick={async () => {
                                                try {
                                                    setLoadingConnection("github");
                                                    const response = await loginWithGitHubMfa();
                                                    if (!response?.ok) throw new Error();
                                                } catch {
                                                    setLoadingConnection(null);
                                                    toast.show("Login failed! Please try again.", { icon: "", type: "error" });
                                                }
                                            }}
                                        >
                                            <div className={`text-2xl font-nerdfont ${loading === "github" ? "loading" : ""}`}>
                                                󰊤
                                            </div>
                                        </button>
                                    </>
                                ))}
                        </div>
                    )}

                    {screen === "qr" && (
                        <>
                            <div className="flex items-center justify-center">
                                <div className="flex items-center justify-center rounded border bg-base-100 border-base-300 w-92 h-92 mt-28 md:mt-0">
                                    {!loading && qrCodeUrl && (
                                        <img
                                            src={qrCodeUrl}
                                            alt="QR Code"
                                            onClick={() => {setLoading(true)}}
                                        />
                                    )}

                                    {/* 
                                        DEV: AS SOON AS THE SCAN HAPPENS; 
                                        MARK AS LOADING FROM THE BACKEND 
                                    */}

                                    {loading && (
                                        <span className="loading w-16 h-16"></span>
                                    )}
                                </div>
                            </div>

                            <div className="text-sub text-sm text-center mt-8">
                                Scan from another device
                            </div>
                        </>
                    )}
                </div>

                {screen === "totp" && (
                    <button
                        className="absolute bottom-6 left-6 right-6 md:relative md:bottom-0 md:right-0 md:left-0 md:mt-4 btn btn-accent"
                        onClick={verifyTotp}
                    >
                        Continue
                    </button>
                )}

                {screen === "backup" && (
                    <button
                        className="absolute bottom-6 left-6 right-6 md:relative md:bottom-0 md:right-0 md:left-0 md:mt-4 btn btn-accent"
                        onClick={verifyBackupCode}
                    >
                        Continue
                    </button>
                )}
            </div>

            <form method="dialog" className="modal-backdrop">
                <button />
            </form>
        </dialog>
    );
}