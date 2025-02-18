import { cold } from 'jasmine-marbles';
import { pluckPath } from './pluck-path';

describe(pluckPath.name, () => {
  it(`should pluck 'path'`, () => {
    const source$ = cold('-a', {
      a: {
        payload: { routerState: { path: 'some-path' } },
      },
    });

    expect(source$.pipe(pluckPath())).toBeObservable(
      cold('-a', { a: 'some-path' }),
    );
  });
});
