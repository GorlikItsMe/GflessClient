import { FingerprintData, ProxyConfig } from './types';
export declare class Fingerprint {
    private static readonly VERSION;
    private static readonly UUID_LENGTH;
    private static readonly VECTOR_LENGTH;
    private static readonly SERVER_FILE_GAME1_FILE;
    private fingerprint;
    private proxy?;
    private httpClient;
    constructor(fingerprint?: Partial<FingerprintData>, proxy?: ProxyConfig);
    private createHttpClient;
    private initializeFingerprint;
    json(): FingerprintData;
    toString(): string;
    updateVector(): void;
    updateCreation(): void;
    updateServerTime(): Promise<void>;
    updateTimings(): void;
    setRequest(request: any): void;
    private generateUuid;
    private generateVector;
    private randomAsciiCharacter;
    private generateRandomString;
    private getServerDate;
}
//# sourceMappingURL=fingerprint.d.ts.map