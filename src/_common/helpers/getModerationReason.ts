import { ModerationReasonNameType, ModerationReasonType } from "../types/moderation.type.js"

export default function getModerationReason(
    reason: ModerationReasonNameType
): ModerationReasonType {
    switch (reason) {
        case "ABUSIVE_BEHAVIOR": {
            return {
                name: "Abusive Behavior",
                description: "Harassment, bullying, threats, intimidation, hate speech, targeted attacks, or degrading behavior directed toward others.",
                severity: "MODERATE"
            }
        }
        case "SPAM_CONTENT": {
            return {
                name: "Spam Content",
                description: "Misleading, repetitive, unsolicited, or disruptive content intended to spam, deceive, or manipulate others.",
                severity: "MODERATE"
            }
        }
        case "MALICIOUS_CONTENT": {
            return {
                name: "Malicious Content",
                description: "Malware, malicious links, phishing pages, harmful scripts, or other content designed to compromise devices, accounts, or personal information.",
                severity: "SEVERE"
            }
        }
        case "EXPLICIT_CONTENT": {
            return {
                name: "Explicit Content",
                description: "Pornographic material, sexually explicit imagery, exposed nudity, or other sexually graphic content.",
                severity: "SEVERE"
            }
        }
        case "MISSING_MATURE_WARNING": {
            return {
                name: "Missing Mature Warning",
                description: "Adult-oriented content, including graphic violence, extreme gore, sexually suggestive material, severe profanity, explicit substance abuse, simulated gambling, or sexually suggestive imagery, shared without the required mature content warning.",
                severity: "MINOR"
            }
        }
        case "MISSING_SENSITIVE_WARNING": {
            return {
                name: "Missing Sensitive Warning",
                description: "Content involving potentially distressing themes, including trauma, grief, mental health struggles, self-harm references, hate speech, abuse, minor gore, or revealing non-sexual imagery, shared without the required sensitive content warning.",
                severity: "MINOR"
            }
        }
        case "DMCA_TAKEDOWN": {
            return {
                name: "DMCA Takedown",
                description: "Content reported for allegedly infringing upon third-party copyrights or other intellectual property rights.",
                severity: "MINOR"
            }
        }
        case "PLATFORM_MISUSE": {
            return {
                name: "Platform Misuse",
                description: "Unauthorized, deceptive, disruptive, or abusive use of platform features, services, or functionality.",
                severity: "SEVERE"
            }
        }
        case "PLATFORM_MANIPULATION": {
            return {
                name: "Platform Manipulation",
                description: "Artificially manipulating engagement, ratings, visibility, interactions, or platform metrics through deceptive or coordinated activity.",
                severity: "SEVERE"
            }
        }
        case "BAN_EVASION": {
            return {
                name: "Ban Evasion",
                description: "Creating or using alternate accounts, identities, or other methods to circumvent existing suspensions, restrictions, or enforcement actions.",
                severity: "SEVERE"
            }
        }
        case "PRIVACY_VIOLATION": {
            return {
                name: "Privacy Violation",
                description: "Doxxing, unauthorized disclosure of personal information, or exposure of private, confidential, or sensitive information.",
                severity: "SEVERE"
            }
        }
        case "IMPERSONATION": {
            return {
                name: "Impersonation",
                description: "Misrepresenting one's identity or impersonating real individuals, public figures, organizations, or creators in a deceptive or misleading manner.",
                severity: "SEVERE"
            }
        }
        case "AI_GENERATED_CONTENT": {
            return {
                name: "AI-Generated Content",
                description: "Content created, generated, or substantially modified using artificial intelligence, including images, videos, audio, text, and synthetic media.",
                severity: "MODERATE"
            }
        }
        case "FILTER_BYPASS": {
            return {
                name: "Filter Bypass",
                description: "Content that attempts to circumvent language filters, profanity restrictions, keyword detection, or inappropriate-language moderation through altered spelling, symbols, spacing, or alternative wording.",
                severity: "MINOR"
            }
        }
        case "CHARGEBACK": {
            return {
                name: "Chargeback",
                description: "Filing a chargeback against the platform is strictly prohibited, regardless of the reason.",
                severity: "SEVERE"
            }
        }
        case "ILLEGAL_CONTENT": {
            return {
                name: "Illegal Content",
                description: "Content that promotes, facilitates, depicts, or requests assistance with illegal activities, including criminal conduct, prohibited transactions, or other unlawful behavior.",
                severity: "SEVERE"
            }
        }
        default: {
            return {
                name: "Unknown",
                description: "This reason is unknown, please message support.",
                severity: "MINOR"
            }
        }
    }
}
