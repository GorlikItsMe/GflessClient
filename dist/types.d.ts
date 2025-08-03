export interface ProxyConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
}
export interface AuthResult {
    success: boolean;
    captcha?: boolean;
    challengeId?: string;
    wrongCredentials?: boolean;
    token?: string;
}
export interface GameAccount {
    id: string;
    displayName: string;
    name: string;
    serverLocation?: number;
    server?: number;
    channel?: number;
    slot?: number;
    autoLogin?: boolean;
}
export interface FingerprintData {
    v: number;
    tz: number;
    osType: string;
    app: string;
    vendor: string;
    mem: number;
    con: number;
    lang: string;
    plugins: string[];
    gpu: string;
    fonts: string[];
    audioC: number;
    width: number;
    height: number;
    video: string;
    audio: string;
    media: string;
    permissions: string;
    audioFP: string;
    webglFP: string;
    canvasFP: string;
    creation: string;
    uuid: string;
    d: number;
    osVersion: string;
    vector: string;
    userAgent: string;
    serverTimeInMS: string;
    request?: any;
}
export interface IdentityConfig {
    filePath: string;
    proxy?: ProxyConfig;
}
export interface GameforgeAccountConfig {
    email: string;
    password: string;
    identityPath: string;
    installationId: string;
    customGamePath?: string;
    proxy?: ProxyConfig;
}
//# sourceMappingURL=types.d.ts.map