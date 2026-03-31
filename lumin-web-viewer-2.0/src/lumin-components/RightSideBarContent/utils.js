export const executeCopyText = (text) =>
  new Promise((resolve, reject) => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.clipboard !== 'undefined' &&
      navigator.permissions &&
      window.ClipboardItem
    ) {
      const type = 'text/plain';
      const blob = new Blob([text], { type });
      const data = [new window.ClipboardItem({ [type]: blob })];
      navigator.permissions
        .query({ name: 'clipboard-write' })
        .then((permission) => {
          if (permission.state === 'granted' || permission.state === 'prompt') {
            navigator.clipboard.write(data).then(resolve, reject).catch(reject);
          } else {
            reject(new Error('Permission not granted!'));
          }
        })
        .catch(() => navigator.clipboard.write(data));
    } else {
      const dummyInput = document.createElement('textarea');
      dummyInput.value = text;

      dummyInput.style.top = '0';
      dummyInput.style.left = '0';
      dummyInput.style.position = 'fixed';

      document.body.appendChild(dummyInput);
      dummyInput.focus();
      dummyInput.select();
      // eslint-disable-next-line no-magic-numbers
      dummyInput.setSelectionRange(0, 99999);

      try {
        document.execCommand('copy');
        document.body.removeChild(dummyInput);
        resolve();
      } catch (e) {
        document.body.removeChild(dummyInput);
        reject(e);
      }
    }
  });
