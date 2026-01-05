import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppEffects } from './app.effects';

describe('AppEffectsService', () => {
  let service: AppEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppEffects);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
