export async function verifyCaptcha(token: string) {
    if (!window.config.isProduction) return true;

    const response = await fetch(
        `https://${window.config.domains.auth}/captcha/verify`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                token,
            }),
        }
    );

    return response.ok;
}