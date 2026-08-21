import { CharacterWithOwnerType } from "../../../_common/types/characterWithOwner.type.js"

export type characterApiType = {
    characters: CharacterWithOwnerType[];
    pageCount: number;
}
