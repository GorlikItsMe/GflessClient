import { GameforgeAccount } from './gameforge-account';

export class GameAccount {
  private gfAcc: GameforgeAccount;
  private name: string;
  private id: string;
  private displayName: string;
  private serverLocation: number = 0;
  private server: number = 0;
  private channel: number = 0;
  private slot: number = 0;
  private autoLogin: boolean = false;

  constructor(
    gameforgeAcc: GameforgeAccount,
    gameAccName: string,
    gameAccId: string,
    fakeName?: string,
    serverLoc?: number,
    serverIndex?: number,
    channelIndex?: number,
    slotIndex?: number,
    login?: boolean
  ) {
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

  public getId(): string {
    return this.id;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getName(): string {
    return this.name;
  }

  public getGfAcc(): GameforgeAccount {
    return this.gfAcc;
  }

  public getServerLocation(): number {
    return this.serverLocation;
  }

  public getServer(): number {
    return this.server;
  }

  public getChannel(): number {
    return this.channel;
  }

  public getSlot(): number {
    return this.slot;
  }

  public getAutoLogin(): boolean {
    return this.autoLogin;
  }

  public setServerLocation(newServerLocation: number): void {
    this.serverLocation = newServerLocation;
  }

  public setServer(newServer: number): void {
    this.server = newServer;
  }

  public setChannel(newChannel: number): void {
    this.channel = newChannel;
  }

  public setSlot(newSlot: number): void {
    this.slot = newSlot;
  }

  public setAutoLogin(newAutoLogin: boolean): void {
    this.autoLogin = newAutoLogin;
  }

  public toString(): string {
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

  public async getGameToken(): Promise<string> {
    return await this.gfAcc.getToken(this.id);
  }
}