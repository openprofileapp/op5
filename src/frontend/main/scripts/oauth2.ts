export function loginWithGoogle() {
    const client_id = window.config.integrations.oauth2.google;
    const redirect_uri = `https://${window.config.domains.auth}/login/google`;
    const scope = "openid email profile";

    const url =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        "?client_id=" + client_id +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&response_type=code" +
        "&scope=" + encodeURIComponent(scope);

    window.location.href = url;
}

export function loginWithMicrosoft() {
    const client_id = window.config.integrations.oauth2.microsoft;
    const redirect_uri = `https://${window.config.domains.auth}/login/microsoft`;
    const scope = "openid profile email User.Read";

    const url =
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize" +
        "?client_id=" + client_id +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&response_type=code" +
        "&scope=" + encodeURIComponent(scope);

    window.location.href = url;
}

export function loginWithApple() {
    const client_id = window.config.integrations.oauth2.apple;
    const redirect_uri = `https://${window.config.domains.auth}/login/apple`;
    const scope = "name email";

    const url =
        "https://appleid.apple.com/auth/authorize" +
        "?client_id=" + client_id +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&response_type=code" +
        "&response_mode=form_post" +
        "&scope=" + encodeURIComponent(scope);

    window.location.href = url;
}

export async function loginWithX() {
    const client_id = window.config.integrations.oauth2.x;
    const redirect_uri = `https://${window.config.domains.auth}/login/x`;
    const scope = "users.read";
    const state = crypto.randomUUID();
    const verifier = crypto.randomUUID() + crypto.randomUUID();

    sessionStorage.setItem("x_oauth_state", state);
    sessionStorage.setItem("x_oauth_verifier", verifier);

    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);

    const challenge = btoa(
        String.fromCharCode(...new Uint8Array(digest))
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const url =
        "https://x.com/i/oauth2/authorize" +
        "?response_type=code" +
        "&client_id=" + encodeURIComponent(client_id) +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&scope=" + encodeURIComponent(scope) +
        "&state=" + encodeURIComponent(state) +
        "&code_challenge=" + encodeURIComponent(challenge) +
        "&code_challenge_method=S256";

    window.location.href = url;
}

export function loginWithFacebook() {
    const client_id = window.config.integrations.oauth2.facebook;
    const redirect_uri = `https://${window.config.domains.auth}/login/facebook`;
    const scope = "email,public_profile";

    const url =
        "https://www.facebook.com/v23.0/dialog/oauth" +
        "?client_id=" + client_id +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&response_type=code" +
        `&scope=${scope}`;

    window.location.href = url;
}

export function loginWithReddit() {
    const client_id = window.config.integrations.oauth2.reddit;
    const redirect_uri = `https://${window.config.domains.auth}/login/reddit`;
    const scope = "identity";
    const state = crypto.randomUUID();

    const url =
        "https://www.reddit.com/api/v1/authorize" +
        "?client_id=" + client_id +
        "&response_type=code" +
        "&state=" + encodeURIComponent(state) +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&duration=permanent" +
        `&scope=${scope}`;

    window.location.href = url;
}

export function loginWithDiscord() {
    const client_id = window.config.integrations.oauth2.discord;
    const redirect_uri = `https://${window.config.domains.auth}/login/discord`;
    const scope = "identify email";

    const url =
        "https://discord.com/api/oauth2/authorize" +
        "?client_id=" + client_id +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&response_type=code" +
        "&scope=" + encodeURIComponent(scope);

    window.location.href = url;
}

export function loginWithGitHub() {
    const client_id = window.config.integrations.oauth2.github;
    const redirect_uri = `https://${window.config.domains.auth}/login/github`;
    const scope = "read:user user:email";

    const url =
        "https://github.com/login/oauth/authorize" +
        "?client_id=" + client_id +
        "&redirect_uri=" + encodeURIComponent(redirect_uri) +
        "&scope=" + encodeURIComponent(scope) +
        "&allow_signup=true";

    window.location.href = url;
}