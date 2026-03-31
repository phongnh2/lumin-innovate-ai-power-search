import { useEffect, useState } from 'react';

const checkExtensionImageExists = (extensionIds: string[]) => {
  const checks = extensionIds.map(
    (id) =>
      new Promise((resolve: (value?: unknown) => void, reject) => {
        const image = new Image();
        // Cache busting
        const url = `chrome-extension://${id}/assets/icons/i-32.png?ts=${Date.now()}`;
        image.onload = () => resolve();
        image.onerror = () => reject();
        image.src = url;
      })
  );
  return Promise.any(checks);
};

export const useCheckHasInstalledExtension = ({
  onSuccess,
  onFailure,
  onCompleted,
}: {
  onSuccess?: () => void;
  onFailure?: () => void;
  onCompleted?: () => void;
}) => {
  const [hasInstalledExtension, setHasInstalledExtension] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  useEffect(() => {
    let isMounted = true;
    // This will check if any an extension has been installed, whether it's a store extension or an extension built by
    // apps-integration repo on local env. The reason for this check is extension's id will change every time we remove
    // and reload the extension on local env.
    // See more: https://stackoverflow.com/questions/37317779/making-a-unique-extension-id-and-key-for-chrome-extension
    // TODO: add extension's id to .env file
    setIsChecking(true);
    checkExtensionImageExists(['dbkidnlfklnjanneifjjojofckpcogcl', 'keffhanpdajpfpflllklodipekodadad'])
      .then(() => {
        if (isMounted) {
          setHasInstalledExtension(true);
          if (onSuccess) onSuccess();
        }
      })
      .catch(() => onFailure && onFailure())
      .finally(() => {
        if (isMounted) {
          setIsChecking(false);
          if (onCompleted) onCompleted();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onSuccess, onFailure, onCompleted]);

  return { hasInstalledExtension: hasInstalledExtension && !isChecking };
};
