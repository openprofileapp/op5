export function isGateway(): boolean {
    const hostname = window.location.hostname;

    const isPrivateIP =
        /^10\./.test(hostname) ||
        /^192\.168\./.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

    return (
        hostname === window.config.domains.gateway ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        isPrivateIP
    );
}

export function isNightly(): boolean {
    return window.location.hostname === 
        window.config.domains.nightly;
}

const protocal = "https://";

export const authBaseUrl = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.auth,
    isGateway() ? "/auth" : ""
].join("");

export const apiBaseUrl = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.api,
    isGateway() ? "/api" : ""
].join("");

export const cdnBaseUrl = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.cdn,
    isGateway() ? "/cdn" : ""
].join("");

export const mainBaseUrl = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.main,
    isGateway() ? "/" : ""
].join("");

export const studioBaseUrl = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.studio,
    isGateway() ? "/studio" : ""
].join("");

export const nightlyBaseUrl = [
    protocal,
    window.config.domains.nightly
].join("");
