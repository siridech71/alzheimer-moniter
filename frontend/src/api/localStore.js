export const localStore = {
  cameras: {
    list: () => JSON.parse(localStorage.getItem("local_cameras") || "[]"),
    get: (id) => localStore.cameras.list().find(c => String(c.id) === String(id)),
    save: (data) => {
      const list = localStore.cameras.list();
      const id = data.id || Date.now().toString();
      const newData = { ...data, id };
      const idx = list.findIndex(c => String(c.id) === String(id));
      if (idx > -1) list[idx] = newData; else list.push(newData);
      localStorage.setItem("local_cameras", JSON.stringify(list));
      return newData;
    },
    remove: (id) => {
      const list = localStore.cameras.list().filter(c => String(c.id) !== String(id));
      localStorage.setItem("local_cameras", JSON.stringify(list));
    }
  },
  alerts: {
    list: () => JSON.parse(localStorage.getItem("local_alerts") || "[]"),
    add: (alert) => {
      const list = localStore.alerts.list();
      list.unshift({ ...alert, id: Date.now().toString(), time: new Date().toLocaleTimeString('th-TH') });
      localStorage.setItem("local_alerts", JSON.stringify(list.slice(0, 20)));
    },
    remove: (id) => {
      const list = localStore.alerts.list().filter(a => String(a.id) !== String(id));
      localStorage.setItem("local_alerts", JSON.stringify(list));
    }
  }
};