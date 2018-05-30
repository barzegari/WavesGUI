import {
    generate,
    StringWithLength,
    ISignatureGenerator,
    AUTH_ORDER_SIGNATURE,
    TX_NUMBER_MAP,
    TRANSACTION_TYPE_NUMBER
} from '@waves/waves-signature-generator';
import { IKeyPair } from './interface';

let API: ISignatureApi;

export function setSignatureApi(api: ISignatureApi) {
    API = api;
}

export function dropSignatureApi() {
    API = null;
}

export function getPublicKey(): Promise<string> {
    if (!API) {
        throw new Error('Api is not available!');
    }
    return API.getPublicKey();
}

export function getAddress(): Promise<string> {
    if (!API) {
        throw new Error('Api is not available!');
    }
    return API.getAddress();
}

export function sign(data: TSignData): Promise<string> {
    if (!API) {
        throw new Error('Api is not available!');
    }
    return API.sign(data);
}

export function getDefaultSignatureApi(keyPair: IKeyPair, address: string): ISignatureApi {
    return {
        getPublicKey: () => Promise.resolve(keyPair.publicKey),
        sign: (data: TSignData) => addSignForData(data, keyPair.privateKey),
        getAddress: () => Promise.resolve(address)
    };
}

export function addSignForData(forSign: TSignData, privateKey: string): Promise<string> {
    let instance: ISignatureGenerator;
    switch (forSign.type) {
        case SIGN_TYPE.AUTH:
            instance = new AUTH_SIGNATURE(forSign.data);
            break;
        case SIGN_TYPE.MATCHER_ORDERS:
            instance = new AUTH_ORDER_SIGNATURE(forSign.data);
            break;
        case SIGN_TYPE.TRANSFER:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.TRANSFER](forSign.data);
            break;
        case SIGN_TYPE.ISSUE:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.ISSUE](forSign.data);
            break;
        case SIGN_TYPE.REISSUE:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.REISSUE](forSign.data);
            break;
        case SIGN_TYPE.BURN:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.BURN](forSign.data);
            break;
        case SIGN_TYPE.LEASE:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.LEASE](forSign.data);
            break;
        case SIGN_TYPE.CANCEL_LEASING:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.CANCEL_LEASING](forSign.data);
            break;
        case SIGN_TYPE.CREATE_ALIAS:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.CREATE_ALIAS](forSign.data);
            break;
        case SIGN_TYPE.MASS_TRANSFER:
            instance = new TX_NUMBER_MAP[TRANSACTION_TYPE_NUMBER.MASS_TRANSFER](forSign.data);
            break;
        default:
            return Promise.reject(new Error('Wrong sign type!'));
    }

    return instance.getSignature(privateKey);
}

export const AUTH_SIGNATURE = generate<IAuthData>([
    new StringWithLength('prefix'),
    new StringWithLength('host'),
    new StringWithLength('data')
]);

export interface ISignatureApi {
    sign: (data: TSignData) => Promise<string>;
    getPublicKey: () => Promise<string>;
    getAddress: () => Promise<string>;
}

export const enum SIGN_TYPE {
    AUTH = 0,
    MATCHER_ORDERS = 1,
    TRANSFER = 4,
    ISSUE = 3,
    REISSUE = 5,
    BURN = 6,
    LEASE = 8,
    CANCEL_LEASING = 9,
    CREATE_ALIAS = 10,
    MASS_TRANSFER = 11
}

export type TSignData =
    ISignAuthData |
    ISignGetOrders |
    ISignTransferData |
    ISignIssue |
    ISignReissue |
    ISignBurn |
    ISignLease |
    ISignCancelLeasing |
    ISignCreateAlias |
    ISignMassTransfer;

export interface ISignAuthData {
    data: IAuthData;
    type: SIGN_TYPE.AUTH;
}

export interface ISignGetOrders {
    data: IGetOrders;
    type: SIGN_TYPE.MATCHER_ORDERS;
}

export interface ISignTransferData {
    data: ITransferData;
    type: SIGN_TYPE.TRANSFER;
}

export interface ISignIssue {
    data: IIssue;
    type: SIGN_TYPE.ISSUE;
}

export interface ISignReissue {
    data: IReissue;
    type: SIGN_TYPE.REISSUE;
}

export interface ISignBurn {
    data: IBurn;
    type: SIGN_TYPE.BURN;
}

export interface ISignLease {
    data: ILease;
    type: SIGN_TYPE.LEASE;
}

export interface ISignCancelLeasing {
    data: ICancelLeasing;
    type: SIGN_TYPE.CANCEL_LEASING;
}

export interface ISignCreateAlias {
    data: ICreateAlias;
    type: SIGN_TYPE.CREATE_ALIAS;
}

export interface ISignMassTransfer {
    data: IMassTransfer;
    type: SIGN_TYPE.MASS_TRANSFER;
}

export interface IAuthData {
    prefix: string;
    host: string;
    data: string;
}

export interface IGetOrders {
    timestamp: number;
    senderPublicKey: string;
}

export interface ICreateTxData {
    fee: string;
    sender: string;
    timestamp: number;
    senderPublicKey: string;
}

export interface ITransferData extends ICreateTxData {
    assetId: string;
    feeAssetId: string;
    amount: string;
    attachment: string;
    recipient: string;
}

export interface IIssue extends ICreateTxData {
    name: string;
    description: string;
    precision: number;
    quantity: string;
    decimals: number;
    reissuable: boolean;
}

export interface IReissue extends ICreateTxData {
    assetId: string;
    quantity: string;
    decimals: number;
    reissuable: boolean;
}

export interface IBurn extends ICreateTxData {
    assetId: string;
    quantity: string;
}

export interface ILease extends ICreateTxData {
    amount: string;
    recipient: string;
}

export interface ICancelLeasing extends ICreateTxData {
    transactionId: string;
}

export interface ICreateAlias extends ICreateTxData {
    alias: string;
}

export interface IMassTransfer extends ICreateTxData {
    version: string;
    assetId: string;
    transfers: Array<{ recipient: string; amount: string; }>;
    attachment: string;
}
