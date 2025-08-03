import { GameforgeAccount } from './gameforge-account';
export declare class GameAccount {
    private gfAcc;
    private name;
    private id;
    private displayName;
    private serverLocation;
    private server;
    private channel;
    private slot;
    private autoLogin;
    constructor(gameforgeAcc: GameforgeAccount, gameAccName: string, gameAccId: string, fakeName?: string, serverLoc?: number, serverIndex?: number, channelIndex?: number, slotIndex?: number, login?: boolean);
    getId(): string;
    getDisplayName(): string;
    getName(): string;
    getGfAcc(): GameforgeAccount;
    getServerLocation(): number;
    getServer(): number;
    getChannel(): number;
    getSlot(): number;
    getAutoLogin(): boolean;
    setServerLocation(newServerLocation: number): void;
    setServer(newServer: number): void;
    setChannel(newChannel: number): void;
    setSlot(newSlot: number): void;
    setAutoLogin(newAutoLogin: boolean): void;
    toString(): string;
    getGameToken(): Promise<string>;
}
//# sourceMappingURL=game-account.d.ts.map