/**
 * Merge and mutate the state.
 * @template TState State type.
 * @param state - The current state object.
 * @param updates - The updates to be applied to the state.
 * @returns A new object with the state data replaced by the one contained in the updates.
 */
export const updateState = <TState>(
  state: TState,
  ...updates: (Partial<TState> | undefined)[]
): TState =>
  updates.reduce<TState>(
    (prev, curr) => ({
      ...prev,
      ...curr,
    }),
    { ...state },
  );
