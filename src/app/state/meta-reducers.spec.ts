import { TestBed } from '@angular/core/testing';
import { unknownAction } from '@app/testing';
import { provideDevLogger } from '@app/utilities';
import type { MetaReducer } from '@ngrx/store';
import { META_REDUCERS } from '@ngrx/store';
import { provideMetaReducer } from './meta-reducers';

describe(`MetaReducer`, () => {
  let metaReducer: MetaReducer<object>[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMetaReducer, provideDevLogger()],
    });
    metaReducer = TestBed.inject(META_REDUCERS);
  });

  it(`should create`, () => {
    expect(metaReducer).toHaveLength(1);
  });

  it(`should log action`, () => {
    const reducer = jest.fn();
    const state = {
      cross: { loading: { a: true, b: false } },
    };

    metaReducer[0]?.(reducer)(state, unknownAction);

    expect(reducer).toHaveBeenCalledOnce();
    expect(reducer).toHaveBeenCalledWith(state, unknownAction);
  });
});
