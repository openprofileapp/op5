export default function isGateway(): boolean {
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