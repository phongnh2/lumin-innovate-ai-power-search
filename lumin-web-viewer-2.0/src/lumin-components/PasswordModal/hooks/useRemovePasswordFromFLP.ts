import core from 'core';

import { usePasswordHandler } from 'features/PasswordProtection';

export const useRemovePasswordFromFLP = () => {
  const { removePassword } = usePasswordHandler();
  const submitRemovePassword = async (password: string) =>
    new Promise<void>((resolve, reject) => {
      core.docViewer.addEventListener(
        'documentLoaded',
        async () => {
          try {
            await removePassword(password);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        { once: true }
      );
    });
  return {
    submitRemovePassword,
  };
};
