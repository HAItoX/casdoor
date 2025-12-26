// 微前端事件总线

class EventBus {
  constructor() {
    this.events = {};
  }

  // 注册事件监听器
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 触发事件
  emit(eventName, data = {}) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error emitting event ${eventName}:`, error);
        }
      });
    }
  }

  // 移除事件监听器
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    }
  }

  // 注册一次性事件监听器
  once(eventName, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(eventName, onceCallback);
    };
    this.on(eventName, onceCallback);
  }

  // 清除所有事件监听器
  clear() {
    this.events = {};
  }

  // 获取所有事件名称
  getEventNames() {
    return Object.keys(this.events);
  }

  // 获取事件监听器数量
  getListenerCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }
}

// 创建全局事件总线实例
const eventBus = new EventBus();

// 将事件总线挂载到window对象，供子应用使用
window.__QIANKUN_MASTER_EVENT_BUS__ = eventBus;

export default eventBus;
