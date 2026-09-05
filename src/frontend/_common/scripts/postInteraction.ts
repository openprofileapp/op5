import { InteractionNameType } from "../../../_common/types/interaction.type.js";
import { apiBaseUrl } from "./domains.js";

export async function postInteraction(
    targetId: string, 
    type: InteractionNameType
) {
    try {
        const response = await fetch(
            `${apiBaseUrl}/v3/interactions`, 
            { 
                credentials: "include", 
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                body: JSON.stringify({ targetId, type })
            }
        );

        return await response.json();
    } catch (error) {
        console.error('Failed to post interaction:', error);
    }
}
