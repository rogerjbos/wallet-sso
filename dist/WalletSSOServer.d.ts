import express from 'express';
import { WalletSSO } from './WalletSSO';
import { SSOConfig } from './types';
export declare class WalletSSOServer {
    private app;
    private sso;
    private config;
    constructor(config: SSOConfig);
    private setupMiddleware;
    private setupRoutes;
    start(port?: number): void;
    getApp(): express.Application;
    getSSO(): WalletSSO;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=WalletSSOServer.d.ts.map