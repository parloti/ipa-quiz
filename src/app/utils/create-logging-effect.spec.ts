import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { LogSignals } from './create-logging-effect';

describe('LogSignals decorator', () => {
  it('should log signal changes when enabled', () => {
    const consoleSpy = vi
      .spyOn(console, 'groupCollapsed')
      .mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {});

    @LogSignals({ enabled: true })
    @Component({ selector: 'app-test', template: '', standalone: true })
    class TestComponent {
      readonly count$ = signal(0);
    }

    TestBed.configureTestingModule({ imports: [TestComponent] });
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(consoleSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
    expect(groupEndSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    logSpy.mockRestore();
    groupEndSpy.mockRestore();
  });

  it('should not log when disabled', () => {
    const consoleSpy = vi
      .spyOn(console, 'groupCollapsed')
      .mockImplementation(() => {});

    @LogSignals({ enabled: false })
    @Component({
      selector: 'app-test-disabled',
      template: '',
      standalone: true,
    })
    class TestDisabledComponent {
      readonly count$ = signal(0);
    }

    TestBed.configureTestingModule({ imports: [TestDisabledComponent] });
    const fixture = TestBed.createComponent(TestDisabledComponent);
    fixture.detectChanges();

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should log multiple signal changes', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    @LogSignals({ enabled: true })
    @Component({ selector: 'app-test-multi', template: '', standalone: true })
    class TestMultiComponent {
      readonly count$ = signal(0);
      readonly name$ = signal('test');
    }

    TestBed.configureTestingModule({ imports: [TestMultiComponent] });
    const fixture = TestBed.createComponent(TestMultiComponent);
    fixture.detectChanges();

    // Both signals should be logged initially
    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('should not log when there are no signals', () => {
    const consoleSpy = vi
      .spyOn(console, 'groupCollapsed')
      .mockImplementation(() => {});

    @LogSignals({ enabled: true })
    @Component({
      selector: 'app-test-no-signals',
      template: '',
      standalone: true,
    })
    class TestNoSignalsComponent {
      readonly count = 0; // Not a signal
    }

    TestBed.configureTestingModule({ imports: [TestNoSignalsComponent] });
    const fixture = TestBed.createComponent(TestNoSignalsComponent);
    fixture.detectChanges();

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
