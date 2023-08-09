export interface ContractInput {
    email: string | null,
    phoneNumber: string | null,
};

export interface Contract {
    id: number;
    email: string;
    phoneNumber: string;
    linkedId: number | null;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface ContractOutput {
    contact:{
        primaryContractId: number,
        emails: string[],
        phoneNumbers: string[],
        secondaryContactIds: number[],
    }
}