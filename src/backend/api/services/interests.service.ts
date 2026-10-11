import { assertDbSuccess } from "../../../_common/asserts/dbSuccess.assert.js";
import { InterestItemType } from "../../../_common/types/interest.type.js";
import { db } from "../databases/db.js";

export class InterestsService {
    constructor(private readonly userId: string) {}

    public get(tag: string): number {
        const result = db.users.query<InterestItemType>(
            `
                SELECT algorithmScore
                FROM interests
                WHERE userId = ? AND tag = ?
            `,
            [this.userId, tag]
        );

        assertDbSuccess(result);

        return result.rows?.[0]?.algorithmScore ?? 0;
    }

    public update(tag: string, score: number): void {
        if (score === 0) return;

        const result = db.users.query(
            `
                INSERT INTO interests (userId, tag, algorithmScore)
                VALUES (?, ?, ?)
                ON CONFLICT(userId, tag)
                DO UPDATE SET
                    algorithmScore = interests.algorithmScore
                                   + excluded.algorithmScore
            `,
            [this.userId, tag, score]
        );

        assertDbSuccess(result);
    }
}
