export function buildCommonContext(globalContextManager, userContextManager) {
  return {
    context: globalContextManager.getContext(),
    user: userContextManager.getContext() // hasReplay: recorderApi.isRecording() ? true : undefined,

  };
}