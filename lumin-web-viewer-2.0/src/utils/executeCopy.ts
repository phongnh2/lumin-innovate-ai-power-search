interface IExecuteCopy {
  textHtml: string;
  textPlain: string;
}

export const executeCopy = ({ textHtml, textPlain }: IExecuteCopy): Promise<void> => {
  const clipboardAPI = async () => {
    const permissionName = 'clipboard-write' as PermissionName;
    const data = [
      new window.ClipboardItem({
        'text/html': new Blob([textHtml], { type: 'text/html' }),
        'text/plain': new Blob([textPlain], { type: 'text/plain' }),
      }),
    ];

    return navigator.permissions
      .query({ name: permissionName })
      .then((permission) => {
        if (permission.state === 'granted' || permission.state === 'prompt') {
          return navigator.clipboard.write(data);
        }
        throw new Error('Permission not granted!');
      })
      .catch(() => navigator.clipboard.write(data));
  };

  const execCommand = () =>
    new Promise<void>((resolve, reject) => {
      const dummyInput = document.createElement('textarea');
      dummyInput.value = textPlain || textHtml;
      dummyInput.style.top = '0';
      dummyInput.style.left = '0';
      dummyInput.style.position = 'fixed';

      document.body.appendChild(dummyInput);
      dummyInput.focus();
      dummyInput.select();
      dummyInput.setSelectionRange(0, 99999);

      try {
        document.execCommand('copy');
        document.body.removeChild(dummyInput);
        resolve();
      } catch (e) {
        document.body.removeChild(dummyInput);
        reject(e);
      }
    });

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined' &&
    navigator.permissions &&
    window.ClipboardItem
  ) {
    return clipboardAPI();
  }
  return execCommand();
};
