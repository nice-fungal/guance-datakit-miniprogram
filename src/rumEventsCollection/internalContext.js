/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
export function startInternalContext(applicationId, session, parentContexts) {
  return {
    get: function get(startTime) {
      var viewContext = parentContexts.findView(startTime);
      if (session.isTracked() && viewContext) {
        var actionContext = parentContexts.findAction(startTime);
        return {
          application: {
            id: applicationId
          },
          session: {
            id: session.getSessionId()
          },
          userAction: actionContext ? {
            id: actionContext.userAction.id
          } : undefined,
          page: viewContext.page
        };
      }
    }
  };
}