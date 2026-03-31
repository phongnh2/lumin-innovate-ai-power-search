import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import Loading from 'lumin-components/Loading';

import { cookieManager } from 'helpers/cookieManager';
import logger from 'helpers/logger';

import languageEvent from 'utils/Factory/EventCollection/LanguageEventCollection';

import { CookieStorageKey } from 'constants/cookieName';
import { LANGUAGES, LANGUAGE_TEXT, LANGUAGE_NAMES } from 'constants/language';
import { Colors } from 'constants/styles';

import * as Styled from './ChangeLanguageButton.styled';

const LANGUAGE_LIST = [
  {
    key: LANGUAGES.EN,
    text: LANGUAGE_NAMES.EN,
    languageText: LANGUAGE_TEXT.EN,
  },
  {
    key: LANGUAGES.ES,
    text: LANGUAGE_NAMES.ES,
    languageText: LANGUAGE_TEXT.ES,
  },
  {
    key: LANGUAGES.PT,
    text: LANGUAGE_NAMES.PT,
    languageText: LANGUAGE_TEXT.PT,
  },
  {
    key: LANGUAGES.FR,
    text: LANGUAGE_NAMES.FR,
    languageText: LANGUAGE_TEXT.FR,
  },
  {
    key: LANGUAGES.VI,
    text: LANGUAGE_NAMES.VI,
    languageText: LANGUAGE_TEXT.VI,
  },
];

type Item = {
  key: LANGUAGES;
  text: LANGUAGE_NAMES;
  languageText: LANGUAGE_TEXT;
};

type Params = {
  children: ({ selectedItem }: { selectedItem: Item }) => JSX.Element;
};

const isDevelopment = process.env.NODE_ENV === 'development';

const ChangeLanguageButton = ({ children }: Params): JSX.Element => {
  const language = useSelector(selectors.getLanguage);
  const defaultItem = LANGUAGE_LIST.find((item) => item.key === language);
  const [selectedItem, setSelectedItem] = useState(defaultItem || LANGUAGE_LIST[0]);
  const [loading, setLoading] = useState(false);
  const closePopperRef = useRef<() => void>();

  const onClickItem = async (item: Item): Promise<void> => {
    setSelectedItem(item);
    cookieManager.set({
      name: CookieStorageKey.LUMIN_LANGUAGE,
      value: item.key,
      maxAge: 365 * 24 * 60 * 60,
      options: { domain: isDevelopment ? 'localhost' : '.luminpdf.com' },
    });
    try {
      setLoading(true);
      await languageEvent.switchLanguage({
        preferredLanguage: item.languageText,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logger.logError({ error });
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const renderDropdown = ({ closePopper }: { closePopper: () => void }): JSX.Element => {
    closePopperRef.current = closePopper;

    return (
      <Styled.Menu>
        {LANGUAGE_LIST.map((item) => {
          const isActive = item.key === selectedItem.key;

          return (
            <Styled.MenuItem key={item.key} onClick={() => onClickItem(item)} $disabled={isActive}>
              <Styled.Item>
                <Styled.TextWrapper>
                  <Styled.DropdownText>{item.text}</Styled.DropdownText>
                </Styled.TextWrapper>
                {isActive &&
                  (loading ? (
                    <Styled.LoadingContainer>
                      <Loading normal size={16} />
                    </Styled.LoadingContainer>
                  ) : (
                    <Icomoon className="check" color={Colors.SECONDARY_50} size={16} />
                  ))}
              </Styled.Item>
            </Styled.MenuItem>
          );
        })}
      </Styled.Menu>
    );
  };

  return (
    <Styled.PopperButton
      aria-label="dropdown"
      popperProps={{
        classes: 'menu',
        disablePortal: false,
        parentOverflow: 'window',
      }}
      renderPopperContent={renderDropdown}
      autoHeightMax="none"
    >
      {children({ selectedItem })}
    </Styled.PopperButton>
  );
};

export default ChangeLanguageButton;
