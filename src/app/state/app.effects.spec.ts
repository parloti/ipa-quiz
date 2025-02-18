import { TestBed } from '@angular/core/testing';

import { AppEffects } from './app.effects';

describe('AppEffectsService', () => {
  let service: AppEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppEffectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
