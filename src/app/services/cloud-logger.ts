/**
 * Small colorful logger used to display cloud sync diffs in a readable way.
 */
const LOG_ICON = '☁️';
const LOG_TITLE = 'Cloud Sync';
const LOG_COLOR = '#0b63ff';

export function logCloudDiff(
  constructorName: string,
  changes: Record<string, unknown>,
  prevState?: Record<string, unknown>,
  nextState?: Record<string, unknown>,
) {
  try {
    const changeKeys = Object.keys(changes || {});
    console.groupCollapsed(
      `%c${LOG_ICON} ${LOG_TITLE} %c${changeKeys.length} Change(s) in ${constructorName}`,
      `color: ${LOG_COLOR}; font-weight: bold;`,
      'color: gray; font-weight: normal;',
    );

    for (const key of changeKeys) {
      const prevValue = prevState?.[key];
      const value = (changes as Record<string, unknown>)[key];
      console.log(
        `%c${key}%c`,
        `color: ${LOG_COLOR}; font-weight: bold; border-left: 3px solid ${LOG_COLOR}; padding-left: 5px;`,
        'color: inherit;',
        { from: prevValue, to: value },
      );
    }

    console.groupEnd();
  } catch (e) {
    // never throw from logger
    // eslint-disable-next-line no-console
    console.warn('Cloud logger error', e);
  }
}

export default logCloudDiff;
