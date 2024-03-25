self.addEventListener('message', event => {
  const { action, title } = event.data;

  if (action === 'updateTitle') {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          action: 'updateTitle',
          title: title
        });
      });
    });
  }
});
