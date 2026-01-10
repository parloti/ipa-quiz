/* eslint-disable max-lines-per-function */
import { effect, isDevMode, isSignal, Signal } from '@angular/core';

const LOG_ICON = '⚡️';
const LOG_TITLE = 'SIGNAL';
const LOG_COLOR = '#3b82f6';

/**
 * Class Decorator to automatically log changes to all Signal properties in dev mode.
 */
export function LogSignals() {
  return function decorator<T extends { new (...args: any[]): object }>(
    constructor: T,
  ) {
    if (!isDevMode()) {
      return void 0;
    }

    (constructor as any)['\u0275fac'] = function ɵfac(...args: unknown[]) {
      const component = new constructor(...args) as Record<
        string,
        Signal<unknown>
      >;

      const signals: Record<string, Signal<any>> = {};
      const previousValues = new Map<string, unknown>();

      for (const key in component) {
        const prop = component[key];
        if (isSignal(prop)) {
          signals[key] = prop;
        }
      }

      if (Object.keys(signals).length > 0) {
        effect(() => {
          const currentEntries = Object.entries(signals).map(
            ([key, signal]) => ({
              key,
              value: signal(),
            }),
          );

          const changes = currentEntries.filter(({ key, value }) => {
            const prev = previousValues.get(key);
            return value !== prev;
          });

          if (changes.length > 0) {
            console.groupCollapsed(
              `%c${LOG_ICON}${LOG_TITLE} %c${changes.length} Change(s) in ${constructor.name}`,
              `color: ${LOG_COLOR}; font-weight: bold;`,
              'color: gray; font-weight: normal;',
            );

            changes.forEach(({ key, value }) => {
              const prevValue = previousValues.get(key);
              console.log(
                `%c${key}%c`,
                `color: ${LOG_COLOR}; font-weight: bold; border-left: 3px solid ${LOG_COLOR}; padding-left: 5px;`,
                'color: inherit;',
                { from: prevValue, to: value },
              );
              previousValues.set(key, value);
            });
            console.groupEnd();
          }
        });
      }

      return component;
    };
  };
}
