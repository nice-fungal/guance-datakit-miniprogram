import { LifeCycleEventType } from '../core/lifeCycle';
export function startSetDataColloction(lifeCycle) {
  var originPage = Page;
  var originComponent = Component;
  Page = function Page(page) {
    var originPageOnLoad = page['onLoad'];
    page['onLoad'] = function () {
      this.setUpdatePerformanceListener && this.setUpdatePerformanceListener({
        withDataPaths: true
      }, res => {
        lifeCycle.notify(LifeCycleEventType.PAGE_SET_DATA_UPDATE, res);
      });
      return originPageOnLoad && originPageOnLoad.apply(this, arguments);
    };
    return originPage(page);
  };
  Component = function Component(component) {
    var originComponentAttached;
    function handlerOrigin() {
      this.setUpdatePerformanceListener && this.setUpdatePerformanceListener({
        withDataPaths: true
      }, res => {
        lifeCycle.notify(LifeCycleEventType.PAGE_SET_DATA_UPDATE, res);
      });
      return originComponentAttached && originComponentAttached.apply(this, arguments);
    }
    if (component.lifetimes && component.lifetimes['attached']) {
      originComponentAttached = component.lifetimes['attached'];
      component.lifetimes['attached'] = handlerOrigin;
    } else if (component['attached']) {
      // 兼容老版本
      originComponentAttached = component['attached'];
      component['attached'] = handlerOrigin;
    }
    if (component.onLoad) {
      originComponentAttached = component.onLoad;
      component.onLoad = handlerOrigin;
    }
    return originComponent(component);
  };
}