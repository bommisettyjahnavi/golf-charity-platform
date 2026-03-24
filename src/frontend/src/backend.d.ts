import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Draw {
    id: bigint;
    status: DrawStatus;
    drawLogic: DrawLogic;
    jackpot: bigint;
    drawDate: bigint;
    winningNumbers: Array<bigint>;
    prizePool: bigint;
}
export interface User {
    golfScores: Array<GolfScore>;
    name: string;
    role: Variant_admin_subscriber;
    selectedCharityId?: bigint;
    email: string;
    subscriptionActive: boolean;
    charityContributionPercent: bigint;
}
export interface Charity {
    id: bigint;
    featured: boolean;
    name: string;
    eventsList: Array<string>;
    description: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface GolfScore {
    score: bigint;
    dateText: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Winner {
    paymentStatus: Variant_pending_paid;
    prizeAmount: bigint;
    matchCount: bigint;
    userId: Principal;
    proofBlobId?: string;
    drawId: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export enum DrawLogic {
    algorithmic = "algorithmic",
    random = "random"
}
export enum DrawStatus {
    simulated = "simulated",
    pending = "pending",
    published = "published"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_admin_subscriber {
    admin = "admin",
    subscriber = "subscriber"
}
export enum Variant_pending_paid {
    pending = "pending",
    paid = "paid"
}
export interface backendInterface {
    addCharity(charity: Charity): Promise<void>;
    addGolfScore(score: bigint, dateText: string): Promise<void>;
    addWinner(winner: Winner): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createDraw(draw: Draw): Promise<void>;
    deleteCharity(charityId: bigint): Promise<void>;
    getAllUsers(): Promise<Array<User>>;
    getCallerUserProfile(): Promise<User>;
    getCallerUserRole(): Promise<UserRole>;
    getCharities(): Promise<Array<Charity>>;
    getFeaturedCharities(): Promise<Array<Charity>>;
    getGolfScores(user: Principal): Promise<Array<GolfScore>>;
    getPublishedDraws(): Promise<Array<Draw>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTotalCharityContributions(): Promise<bigint>;
    getTotalUsers(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<User>;
    getWinnersByDraw(drawId: bigint): Promise<Array<Winner>>;
    getWinnersByUser(user: Principal): Promise<Array<Winner>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isUserRegistered(): Promise<boolean>;
    markWinnerAsPaid(winnerId: bigint): Promise<void>;
    publishDraw(drawId: bigint): Promise<void>;
    registerUser(name: string, email: string): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCallerProfile(name: string, email: string, selectedCharityId: bigint | null, charityContributionPercent: bigint): Promise<void>;
    updateCharity(charity: Charity): Promise<void>;
    updateDraw(draw: Draw): Promise<void>;
}
