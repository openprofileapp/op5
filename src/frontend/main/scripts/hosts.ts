import isGateway from "../../_common/helpers/isGateway.js";

export const apiHost = [
    "https://",
    isGateway() ? window.location.host : window.config.domains.api,
    isGateway() ? "/api" : ""
].join("");
