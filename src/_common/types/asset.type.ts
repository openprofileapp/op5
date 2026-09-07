import { GetPublishedCharacterItemType } from "./character.type.js";
import { GetCollectionItemType } from "./collection.type.js";
import { GetUserItemType } from "./user.type.js";

export type AssetNameType = 
    "USER" | 
    "CHARACTER" | 
    "COLLECTION"
;

export type GetAssetType = 
    | GetUserItemType
    | GetPublishedCharacterItemType
    | GetCollectionItemType
;
