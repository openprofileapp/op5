import { db } from "../db.js";
import { log } from "../../instances.js";
import { DatasetItemType } from "../../../../_common/types/template/dataset.type.js";

// @openprofile
const ownerId = "9534968913312158";

const index: Partial<DatasetItemType>[] = [
    {
        id: "94721604830892032",
        ownerId,
        label: "Honorifics",
        description: "Formal and societal prefixes preceding names.",
        data: {
            "Social": [
                { id: "mister", name: "Mister (Mr.)" },
                { id: "missis", name: "Missis (Mrs.)" },
                { id: "miss", name: "Miss" },
                { id: "ms", name: "Ms." },
                { id: "mx", name: "Mx." },
                { id: "master", name: "Master" }
            ],
            "Academic": [
                { id: "doctor", name: "Doctor (Dr.)" },
                { id: "professor", name: "Professor (Prof.)" }
            ],
            "Governmental": [
                { id: "honorable", name: "The Honorable (Hon.)" },
                { id: "his_excellency", name: "His Excellency (H.E.)" },
                { id: "her_excellency", name: "Her Excellency (H.E.)" }
            ],
            "Royalty": [
                { id: "his_majesty", name: "His Majesty (H.M.)" },
                { id: "her_majesty", name: "Her Majesty (H.M.)" },
                { id: "his_royal_highness", name: "His Royal Highness (H.R.H.)" },
                { id: "her_royal_highness", name: "Her Royal Highness (H.R.H.)" },
                { id: "his_highness", name: "His Highness (H.H.)" },
                { id: "her_highness", name: "Her Highness (H.H.)" },
                { id: "sir", name: "Sir" },
                { id: "dame", name: "Dame" },
                { id: "lord", name: "Lord" },
                { id: "lady", name: "Lady" }
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
        source: "official"
    },
    {
        id: "94721604830892033",
        ownerId,
        label: "Titles",
        description: "Official titles or ranks designated by legal commission, active service, or state protocol.",
        data: {
            "Monarchy": [
                { id: "king", name: "King" },
                { id: "queen", name: "Queen" },
                { id: "prince", name: "Prince" },
                { id: "princess", name: "Princess" },
                { id: "duke", name: "Duke" },
                { id: "duchess", name: "Duchess" },
                { id: "marquess", name: "Marquess" },
                { id: "marchioness", name: "Marchioness" },
                { id: "count", name: "Count" },
                { id: "countess", name: "Countess" },
                { id: "viscount", name: "Viscount" },
                { id: "viscountess", name: "Viscountess" },
                { id: "baron", name: "Baron" },
                { id: "baroness", name: "Baroness" }
            ],
            "Government": [
                { id: "president", name: "President" },
                { id: "prime_minister", name: "Prime Minister" },
                { id: "chancellor", name: "Chancellor" },
                { id: "vice_president", name: "Vice President" },
                { id: "governor", name: "Governor" },
                { id: "minister", name: "Minister" },
                { id: "senator", name: "Senator" },
                { id: "mayor", name: "Mayor" },
                { id: "ambassador", name: "Ambassador" },
                { id: "judge", name: "Judge" }
            ],
            "Military": [
                { id: "general", name: "General" },
                { id: "admiral", name: "Admiral" },
                { id: "colonel", name: "Colonel" },
                { id: "commander", name: "Commander" },
                { id: "major", name: "Major" },
                { id: "captain_ground", name: "Captain" },
                { id: "lieutenant", name: "Lieutenant" },
                { id: "sergeant", name: "Sergeant" }
            ],
            "Civil": [
                { id: "commissioner", name: "Commissioner" },
                { id: "chief", name: "Chief" },
                { id: "sheriff", name: "Sheriff" },
                { id: "inspector", name: "Inspector" },
                { id: "detective", name: "Detective" },
                { id: "officer", name: "Officer" },
                { id: "deputy", name: "Deputy" }
            ]
        },
        source: "official"
    },
    {
        id: "94721604830892034",
        ownerId,
        label: "Suffixes",
        description: "Post-nominal designations indicating lineage, academic degrees, professional credentials, or state honors.",
        data: {
            "Generational": [
                { id: "jr", name: "Junior (Jr.)" },
                { id: "sr", name: "Senior (Sr.)" },
                { id: "ii", name: "The Second (II)" },
                { id: "iii", name: "The Third (III)" },
                { id: "iv", name: "The Fourth (IV)" },
                { id: "v", name: "The Fifth (V)" }
            ],
            "Academic": [
                { id: "phd", name: "Doctor of Philosophy (Ph.D.)" },
                { id: "md", name: "Doctor of Medicine (M.D.)" }
            ],
            "Professional": [
                { id: "esq", name: "Esquire (Esq.)" },
                { id: "pe", name: "Professional Engineer (P.E.)" },
                { id: "rn", name: "Registered Nurse (R.N.)" }
            ]
        },
        source: "official"
    }
];

db.templates.transaction(q => {
    for (const d of index) {
        const result = q(
            `INSERT INTO datasets (
                id,
                ownerId,
                label,
                description,
                data,
                source
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                d.id,
                d.ownerId,
                d.label,
                d.description,
                JSON.stringify(d.data) || [],
                d.source
            ]
        );

        if (!result.success) {
            log.db.error(result.error).save();
            continue;
        }
    }
});
