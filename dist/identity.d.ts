import { Fingerprint } from './fingerprint';
import { ProxyConfig } from './types';
export declare class Identity {
    private filename;
    private fingerprint;
    constructor(filePath?: string, proxy?: ProxyConfig);
    private initFingerprint;
    update(): void;
    updateServerTime(): Promise<void>;
    getFingerprint(): Fingerprint;
    setRequest(request: any): void;
    private save;
    static generateIdentityFile(blackboxString: string, outputPath: string): boolean;
    private static parseBlackbox;
}
//# sourceMappingURL=identity.d.ts.map