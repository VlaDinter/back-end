export type EmailConfirmationModel = {
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean
};
