"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameAccount = void 0;
class GameAccount {
    constructor(gameforgeAcc, gameAccName, gameAccId, fakeName, serverLoc, serverIndex, channelIndex, slotIndex, login) {
        this.serverLocation = 0;
        this.server = 0;
        this.channel = 0;
        this.slot = 0;
        this.autoLogin = false;
        this.gfAcc = gameforgeAcc;
        this.name = gameAccName;
        this.id = gameAccId;
        this.displayName = fakeName || gameAccName;
        this.serverLocation = serverLoc || 0;
        this.server = serverIndex || 0;
        this.channel = channelIndex || 0;
        this.slot = slotIndex || 0;
        this.autoLogin = login || false;
    }
    getId() {
        return this.id;
    }
    getDisplayName() {
        return this.displayName;
    }
    getName() {
        return this.name;
    }
    getGfAcc() {
        return this.gfAcc;
    }
    getServerLocation() {
        return this.serverLocation;
    }
    getServer() {
        return this.server;
    }
    getChannel() {
        return this.channel;
    }
    getSlot() {
        return this.slot;
    }
    getAutoLogin() {
        return this.autoLogin;
    }
    setServerLocation(newServerLocation) {
        this.serverLocation = newServerLocation;
    }
    setServer(newServer) {
        this.server = newServer;
    }
    setChannel(newChannel) {
        this.channel = newChannel;
    }
    setSlot(newSlot) {
        this.slot = newSlot;
    }
    setAutoLogin(newAutoLogin) {
        this.autoLogin = newAutoLogin;
    }
    toString() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            displayName: this.displayName,
            serverLocation: this.serverLocation,
            server: this.server,
            channel: this.channel,
            slot: this.slot,
            autoLogin: this.autoLogin
        });
    }
    async getGameToken() {
        return await this.gfAcc.getToken(this.id);
    }
}
exports.GameAccount = GameAccount;
//# sourceMappingURL=game-account.js.map