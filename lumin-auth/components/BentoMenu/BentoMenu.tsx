import { Popover, PopoverTarget, PopoverDropdown, IconButton, MenuItemBase, Text } from '@kiwi-ui';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { environment } from '@/configs/environment';
import { isDesktopApp, openDesktopApp } from '@/features/desktop-app/utils';
import useTranslation from '@/hooks/useTranslation';
import LogoAgreementGen from '@/public/assets/logo-agreementGen-gradient.svg';
import LogoLumin from '@/public/assets/logo-lumin-no-text.svg';
import LogoSign from '@/public/assets/logo-sign-no-text.svg';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';

import styles from './BentoMenu.module.scss';
import LogoLabel from './LogoLabel';

interface IList {
  logo: JSX.Element;
  title: string;
  desc: string;
  url: string;
  badge: ReactNode | null;
  borderColor?: string;
}

function BentoMenu() {
  const { t } = useTranslation();
  const [list, setList] = useState<IList[]>([]);
  const firstItemRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    setList([
      {
        logo: <LogoAgreementGen width={24} height={24} />,
        title: 'AgreementGen',
        desc: 'profileSettings.agreementGenSlogan',
        url: environment.public.host.agreementGenUrl,
        borderColor: 'linear-gradient( #FFE5E7, #CDCCFF)',
        badge: (
          <div className={styles.badgeContainer}>
            <div className={styles.badge}>AI beta</div>
          </div>
        )
      },
      {
        logo: <LogoLumin width={24} height={24} />,
        title: 'Lumin PDF',
        desc: 'profileSettings.luminSlogan',
        url: environment.public.host.appUrl + getFullPathWithLanguageFromUrl(),
        borderColor: 'var(--kiwi-colors-custom-brand-lumin-lumin)',
        badge: null
      },
      {
        logo: <LogoSign width={24} height={24} />,
        title: 'Lumin Sign',
        desc: 'profileSettings.signSlogan',
        url: environment.public.host.contractUrl,
        borderColor: 'var(--kiwi-colors-custom-brand-sign-sign)',
        badge: null
      }
    ]);
  }, []);

  useEffect(() => {
    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [list]);

  const handleItemClick = (url: string) => (e: React.MouseEvent) => {
    if (isDesktopApp()) {
      e.preventDefault();
      openDesktopApp(url);
    }
  };

  return (
    <Popover position='bottom-end' classNames={{ dropdown: styles.dropdown }} width='22.86rem' offset={4}>
      <PopoverTarget>
        <IconButton icon='grid-dots-xl' iconSize='xl' className={styles.iconButton} />
      </PopoverTarget>
      <PopoverDropdown>
        <Text type='label' size='md' color='var(--kiwi-colors-surface-on-surface-low)' className={styles.title}>
          {t('profileSettings.accessApps')}
        </Text>
        <div>
          {list.map(item => (
            <MenuItemBase
              component='a'
              href={item.url}
              target={isDesktopApp() ? '_self' : '_blank'}
              rel='noopener noreferrer'
              className={styles.menuItem}
              key={item.title}
              leftSection={<LogoLabel logo={item.logo} borderColor={item.borderColor} />}
              onClick={handleItemClick(item.url)}
            >
              <div className={styles.menuItemRightSection}>
                <div className={styles.itemTitleContainer}>
                  <Text type='label' size='lg' color='var(--kiwi-colors-surface-on-surface)'>
                    {item.title}
                  </Text>
                  {item.badge}
                </div>
                <Text type='label' size='xs' color='var(--kiwi-colors-surface-on-surface-variant)'>
                  {t(item.desc)}
                </Text>
              </div>
            </MenuItemBase>
          ))}
        </div>
      </PopoverDropdown>
    </Popover>
  );
}

export default BentoMenu;
