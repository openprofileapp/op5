import isGateway from "../../_common/helpers/isGateway.js";

const protocal = "https://";

export const apiHost = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.api,
    isGateway() ? "/api" : ""
].join("");

export const studioHost = [
    protocal,
    isGateway() ? window.location.host : window.config.domains.studio,
    isGateway() ? "/studio" : ""
].join("");
