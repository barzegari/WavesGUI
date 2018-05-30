import * as apiMethods from './api/API';
import { BalanceManager } from './classes/BalanceManager';
import * as configApi from './config';
import * as sign from './sign';
import * as utilsModule from './utils/utils';
import { request } from './utils/request';
import { IFetchOptions } from './utils/request';
import * as wavesDataEntitiesModule from '@waves/data-entities';
import { BigNumber, Asset, Money, AssetPair, OrderPrice } from '@waves/data-entities';
import { toAsset, toBigNumber } from './utils/utils';
import { IAssetInfo } from '@waves/data-entities/dist/entities/Asset';
import { get } from './config';
import { TAssetData, TBigNumberData } from './interface';
import { getAssetPair } from './api/assets/assets';
import { broadcast as broadcastF } from './broadcast/broadcast';

export { Seed } from './classes/Seed';

export const wavesDataEntities = {
    ...wavesDataEntitiesModule
};
export const api = { ...apiMethods };
export const balanceManager = new BalanceManager();
export const config = { ...configApi };
export const utils = { ...utilsModule };
export const signature = {
    ...sign
};

export const broadcast = broadcastF;

wavesDataEntitiesModule.config.set('remapAsset', (data: IAssetInfo) => {
    const name = get('remappedAssetNames')[data.id] || data.name;
    return { ...data, name };
});

export function fetch<T>(url: string, fetchOptions: IFetchOptions): Promise<T> {
    return request<T>({ url, fetchOptions });
}

export function moneyFromTokens(tokens: TBigNumberData, assetData: TAssetData): Promise<Money> {
    return toAsset(assetData).then((asset) => {
        return wavesDataEntities.Money.fromTokens(tokens, asset);
    });
}

export function moneyFromCoins(coins: TBigNumberData, assetData: TAssetData): Promise<Money> {
    return toAsset(assetData).then((asset) => new Money(coins, asset));
}

export function orderPriceFromCoins(coins: TBigNumberData, pair: AssetPair): Promise<OrderPrice>;
export function orderPriceFromCoins(coins: TBigNumberData, asset1: TAssetData, asset2: TAssetData): Promise<OrderPrice>;
export function orderPriceFromCoins(coins: TBigNumberData, pair: AssetPair | TAssetData, asset2?: TAssetData): Promise<OrderPrice> {
    if (pair instanceof AssetPair) {
        return Promise.resolve(OrderPrice.fromMatcherCoins(coins, pair));
    } else {
        return getAssetPair(pair, asset2).then((pair) => OrderPrice.fromMatcherCoins(coins, pair));
    }
}

export function orderPriceFromTokens(tokens: TBigNumberData, pair: AssetPair): Promise<OrderPrice>;
export function orderPriceFromTokens(tokens: TBigNumberData, asset1: TAssetData, asset2: TAssetData): Promise<OrderPrice>;
export function orderPriceFromTokens(tokens: TBigNumberData, pair: AssetPair | TAssetData, asset2?: TAssetData): Promise<OrderPrice> {
    if (pair instanceof AssetPair) {
        return Promise.resolve(OrderPrice.fromTokens(tokens, pair));
    } else {
        return getAssetPair(pair, asset2).then((pair) => OrderPrice.fromTokens(tokens, pair));
    }
}

class App {

    public address: string;

    public login(address: string, api: sign.ISignatureApi): Promise<void> {
        this.address = address;
        sign.setSignatureApi(api);
        return this._addMatcherSign()
            .then(() => this._initializeBalanceManager(address));
    }

    public logOut() {
        sign.dropSignatureApi();
        balanceManager.dropAddress();
    }

    private _addMatcherSign() {
        const timestamp = utilsModule.addTime(new Date(), 2, 'hour').valueOf();
        return sign.getPublicKey()
            .then((senderPublicKey) => {
                return sign.sign({
                    type: sign.SIGN_TYPE.MATCHER_ORDERS,
                    data: {
                        senderPublicKey,
                        timestamp
                    }
                })
                    .then((signature) => {
                        api.matcher.addSignature(signature, senderPublicKey, timestamp);
                    });
            });
    }

    private _initializeBalanceManager(address: string): void {
        balanceManager.applyAddress(address);
    }

}

export const app = new App();
