export type PayoutStatusType =
    | "PENDING"
    | "COMPLETED"
;

export type PayoutType = {
    transactionId: string;
    refPaymentId: string;
    userId: string;
    email: string;
    subtotal: number;
    fee: number;
    total: number;
    currency: string;
    status: PayoutStatusType;
    senderBatchId: string;
    senderItemId: string;
    payoutBatchId: string;
    payoutItemId: string;
    dateCreated: string;
    dateProcessed: string;
}
