import { getPublishedCharacterType } from "../../../_common/types/getPublishedCharacter.type.js"

export type characterApiType = {
    characters: getPublishedCharacterType[];
    pageCount: number;
}
