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
        fieldId: "honorific",
        rowId: "93861942229209090",
        type: "dropdown",
        label: "Honorific",
        placeholder: "What is {display_name.possessive} honorific?",
        options: {
            "Social": [
                { id: "mister", name: "Mister (Mr.)" },
                { id: "missis", name: "Missis (Mrs.)" },
                { id: "miss", name: "Miss" },
                { id: "ms", name: "Ms." },
                { id: "mx", name: "Mx." },
                { id: "master", name: "Master" }
            ],
            "Academic & Professional": [
                { id: "doctor", name: "Doctor (Dr.)" },
                { id: "professor", name: "Professor (Prof.)" }
            ],
            "Governmental": [
                { id: "honorable", name: "The Honorable (Hon.)" },
                { id: "his_excellency", name: "His Excellency (H.E.)" },
                { id: "her_excellency", name: "Her Excellency (H.E.)" }
            ],
            "Royalty & Nobility": [
                { id: "his_highness", name: "His Highness (H.H.)" },
                { id: "her_highness", name: "Her Highness (H.H.)" },
                { id: "his_majesty", name: "His Majesty (H.M.)" },
                { id: "her_majesty", name: "Her Majesty (H.M.)" },
                { id: "his_royal_highness", name: "His Royal Highness (H.R.H.)" },
                { id: "her_royal_highness", name: "Her Royal Highness (H.R.H.)" },
                { id: "sir", name: "Sir" },
                { id: "dame", name: "Dame" },
                { id: "lady", name: "Lady" },
                { id: "lord", name: "Lord" },
                { id: "baron", name: "Baron" },
                { id: "baroness", name: "Baroness" },
                { id: "viscount", name: "Viscount" },
                { id: "viscountess", name: "Viscountess" },
                { id: "count", name: "Count" },
                { id: "countess", name: "Countess" },
                { id: "marquess", name: "Marquess" },
                { id: "marchioness", name: "Marchioness" },
                { id: "duke", name: "Duke" },
                { id: "duchess", name: "Duchess" },
                { id: "prince", name: "Prince" },
                { id: "princess", name: "Princess" }
            ],
            "Religious": [
                { id: "reverend", name: "Reverend (Rev.)" },
                { id: "father", name: "Father (Fr.)" },
                { id: "sister", name: "Sister (Sr.)" },
                { id: "brother", name: "Brother (Br.)" },
                { id: "pastor", name: "Pastor (Pr.)" },
                { id: "rabbi", name: "Rabbi" },
                { id: "imam", name: "Imam" },
                { id: "cantor", name: "Cantor" },
                { id: "swami", name: "Swami" },
                { id: "venerable", name: "Venerable (Ven.)" },
                { id: "his_holiness", name: "His Holiness (H.H.)" }
            ]
        },
        guide: "Honorifics are formal and societial prefixes preceding {display_name.possessive} name.",
        position: 0,
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
                type,
                label,
                placeholder,
                options,
                guide,
                position,
                createdBy
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.blockId,
                d.fieldId,
                d.rowId,
                d.type,
                d.label,
                d.placeholder,
                JSON.stringify(d.options || []),
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
