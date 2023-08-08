export interface ContractInput {
    email: string | null,
    phoneNumber: string | null,
};

export interface ContractOutput {
    contact:{
        primaryContractId: number,
        emails: string[],
        phoneNumbers: string[],
        secondaryContactIds: number[],
    }
}