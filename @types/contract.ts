export interface ContractInput {
    email: string | null;
    phoneNumber: string | null;
}

export interface Contract {
    id: number;
    email: string;
    phoneNumber: string;
    linkedId: number | null;
    linkPrecedence: "primary" | "secondary";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface DBContract {
    id: number;
    email: string;
    phone_number: string;
    linked_id: number | null;
    link_precedence: "primary" | "secondary";
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export interface InitialQueryContract {
    contractId: number;
    contractEmail: string;
    contractPhoneNumber: string;
    contractLinkedId: number | null;
    contractLinkPrecedence: "primary" | "secondary";
    parentContractEmail: string | null;
    parentContractPhoneNumber: string | null;
    parentContractLinkPrecedence: "primary" | "secondary" | null;
}

export interface ContractOutput {
    contact: {
        primaryContractId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
    };
}
