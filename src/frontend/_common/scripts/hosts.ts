import isGateway from "../helpers/isGateway.js";

const protocal = "https://";

export const authHost = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.auth,
    isGateway() ? "/auth" : ""
].join("");

export const apiHost = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.api,
    isGateway() ? "/api" : ""
].join("");

export const cdnHost = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.cdn,
    isGateway() ? "/cdn" : ""
].join("");

export const studioHost = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.studio,
    isGateway() ? "/studio" : ""
].join("");
