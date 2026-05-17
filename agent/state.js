let previousState = null;
let currentState = null;

export function updateState(newState) {
  // Use structuredClone for deep copy to ensure immutability
  previousState = currentState;
  currentState = structuredClone(newState);
}

export function getStateDelta() {
  return { previousState, currentState };
}

export function resetState() {
  previousState = null;
  currentState = null;
}

export { previousState, currentState };