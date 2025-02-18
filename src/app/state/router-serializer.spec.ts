import type { RouterStateSnapshot } from '@angular/router';
import { namesOf } from '@app/utilities';
import type {
  MinimalActivatedRouteSnapshot,
  MinimalRouterStateSnapshot,
} from '@ngrx/router-store';
import { MinimalRouterStateSerializer } from '@ngrx/router-store';
import type { IFormalizationReturnParams } from '../../formalization-return-params';
import * as FormalizationReturnParamsModule from '../../formalization-return-params';
import { RouterSerializer } from './router-serializer';

const names = namesOf(FormalizationReturnParamsModule);

describe(RouterSerializer.name, () => {
  it(`should serialize 'path'`, () => {
    const path = 'path';
    const route = {
      routeConfig: { path },
    } as MinimalActivatedRouteSnapshot;
    const minimalSnapshot = {
      root: {
        firstChild: route,
        queryParams: { nmaer: void 0 },
      },
    } as unknown as MinimalRouterStateSnapshot;

    jest
      .spyOn(MinimalRouterStateSerializer.prototype, 'serialize')
      .mockReturnValue(minimalSnapshot);

    const serializer = new RouterSerializer();
    const state = serializer.serialize({
      root: { firstChild: route },
    } as RouterStateSnapshot);

    expect(state.path).toBe(path);
  });

  it(`should serialize 'nmaer'`, () => {
    const nmaer = 'nmaer';
    const path = 'path';

    const route = {
      routeConfig: { path },
    } as unknown as MinimalActivatedRouteSnapshot;
    const minimalSnapshot = {
      root: {
        firstChild: route,

        queryParams: { nmaer },
      },
    } as unknown as MinimalRouterStateSnapshot;

    jest
      .spyOn(MinimalRouterStateSerializer.prototype, 'serialize')
      .mockReturnValue(minimalSnapshot);

    const serializer = new RouterSerializer();
    const state = serializer.serialize({
      root: { firstChild: route },
    } as RouterStateSnapshot);

    expect(state.nmaer).toBe(nmaer);
  });

  it(`should serialize 'return-params'`, () => {
    const returnParams = { p1: 'v1', p2: 'v2' } as IFormalizationReturnParams;

    const parseSpy = jest
      .spyOn(
        FormalizationReturnParamsModule,
        names.parseFormalizationReturnParams,
      )
      .mockReturnValue(returnParams);

    const minimalSnapshot = {
      root: {
        queryParams: { k1: 'v1', k2: 'v2' },
      } as unknown as MinimalActivatedRouteSnapshot,
      url: 'url',
    } as MinimalRouterStateSnapshot;

    jest
      .spyOn(MinimalRouterStateSerializer.prototype, 'serialize')
      .mockReturnValue(minimalSnapshot);

    const serializer = new RouterSerializer();
    const state = serializer.serialize({} as RouterStateSnapshot);

    expect(state).toStrictEqual({
      ...minimalSnapshot,
      nmaer: void 0,
      path: void 0,
      returnParams,
    });
    expect(parseSpy).toHaveBeenCalledExactlyOnceWith(
      minimalSnapshot.root.queryParams,
    );
  });
});
