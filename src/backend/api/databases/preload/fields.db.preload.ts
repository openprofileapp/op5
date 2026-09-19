import { db } from "../db.js";
import { log } from "../../instances.js";
import { TemplateFieldItemType } from "../../../../_common/types/template/field.type.js";

// @openprofile
const createdBy = "9534968913312158";

const index: Partial<TemplateFieldItemType>[] = [
    {
        blockId: "93861942229209088",
        fieldId: "first_name",
        rowId: "93861942229209089",
        type: "text",
        label: "First Name",
        placeholder: "What is {display_name.possessive} first name?",
        guide: "First names are generally given by parents or legal guardians. It could reflect something from their personalities or how they view {display_name}.\n\nIt is recommended to choose a name that fits {display_name.possessive} ethnic background, social class, and birth era.",
        position: 0,
        createdBy,
    },
    {
        blockId: "93861942229209088",
        fieldId: "middle_name",
        rowId: "93861942229209089",
        type: "text",
        label: "Middle Name",
        placeholder: "What is {display_name.possessive} middle name?",
        guide: "Middle names are not always required, but are recommended if {display_name} was born in a modern or post-modern world.",
        position: 1,
        createdBy
    },
    {
        blockId: "93861942229209088",
        fieldId: "last_name",
        rowId: "93861942229209089",
        type: "text",
        label: "Last Name",
        placeholder: "What is {display_name.possessive} last name?",
        guide: "Last names are typically inherited from the father, especially in worlds that follow male-prioritized lineage rules. They reflect heritage, family history, and paternal lineage. A last name could even reflect something related to {display_name.possessive} line of work. It is recommended to choose a surname that fits {display_name.possessive} ethnic background, social class, and birth era.",
        position: 2,
        createdBy
    },
    {
        blockId: "93861942229209088",
        fieldId: "nickname",
        rowId: "93861942229209090",
        type: "text",
        label: "Nickname",
        placeholder: "What is {display_name.possessive} nickname?",
        guide: "Nicknames are fun lighthearted alternative callings for {display_name} often created by friends and family. Sometimes enemies or other acquaintances may come up with nicknames for negative intent.",
        position: 0,
        createdBy
    },
    {
        blockId: "93861942229209088",
        fieldId: "honorific",
        rowId: "93861942229209091",
        flex: 1,
        type: "dropdown",
        label: "Honorific",
        placeholder: "What is {display_name.possessive} honorific?",
        dataset: "94721604830892032",
        guide: "Honorifics are formal and societal prefixes preceding {display_name.possessive} name.",
        position: 0,
        createdBy
    },
    {
        blockId: "93861942229209088",
        fieldId: "title",
        rowId: "93861942229209091",
        flex: 1,
        type: "dropdown",
        label: "Title",
        placeholder: "What is {display_name.possessive} official title or rank?",
        dataset: "94721604830892033",
        guide: "Official titles or ranks are designated by legal commission, active service, or state protocol. They differ from common honorifics and hold real power.",
        position: 1,
        createdBy
    },
    {
        blockId: "93861942229209088",
        fieldId: "suffix",
        flex: 1,
        rowId: "93861942229209091",
        type: "dropdown",
        label: "Suffix",
        placeholder: "What is {display_name.possessive} suffix?",
        dataset: "94721604830892034",
        guide: "Suffixes are post-nominal designations following {display_name.possessive} name indicating lineage, academic degrees, professional credentials, or state honors.",
        position: 2,
        createdBy
    }
];

db.templates.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO fields (
                blockId,
                fieldId,
                rowId,
                flex,
                type,
                label,
                placeholder,
                dataset,
                guide,
                position,
                createdBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.blockId,
                d.fieldId,
                d.rowId,
                d.flex || 1,
                d.type,
                d.label,
                d.placeholder,
                d.dataset,
                d.guide,
                d.position,
                d.createdBy
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
            continue;
        }
    }
});
