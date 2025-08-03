import { Identity } from './identity';
export declare class BlackBox {
    protected static readonly BLACKBOX_FIELDS: string[];
    protected identity: Identity;
    constructor(identity: Identity, request?: any);
    encoded(): string;
    static decode(blackbox: string): Buffer;
    static encode(fingerprintArrayBuffer: Buffer): string;
    protected fingerprintArrayToBuffer(): Buffer;
}
export declare class EncryptedBlackBox extends BlackBox {
    private accountId;
    private gsid;
    constructor(identity: Identity, accountId: string, gsid: string, installationId: string);
    encrypted(): string;
    private encrypt;
    private static createRequest;
}
//# sourceMappingURL=blackbox.d.ts.map