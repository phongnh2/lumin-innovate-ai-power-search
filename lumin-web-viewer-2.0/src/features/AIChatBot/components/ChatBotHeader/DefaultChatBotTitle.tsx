import { Badge, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import styles from './ChatBotHeader.module.scss';

const DefaultChatBotTitle = () => (
  <>
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0001 3.49615C8.69148 6.38029 6.38038 8.69139 3.49624 9.99999C6.38038 11.3086 8.69148 13.6197 10.0001 16.5038C11.3087 13.6197 13.6198 11.3086 16.5039 9.99999C13.6198 8.69139 11.3087 6.38029 10.0001 3.49615ZM10.7698 2.16359C10.4705 1.50101 9.52962 1.50101 9.23037 2.16359L8.87019 2.96108C7.68541 5.58433 5.58442 7.68532 2.96117 8.8701L2.16368 9.23028C1.5011 9.52953 1.5011 10.4704 2.16369 10.7697L2.96117 11.1299C5.58442 12.3147 7.68541 14.4157 8.87019 17.0389L9.23037 17.8364C9.52963 18.499 10.4705 18.499 10.7698 17.8364L11.13 17.0389C12.3148 14.4157 14.4157 12.3147 17.039 11.1299L17.8365 10.7697C18.4991 10.4704 18.4991 9.52953 17.8365 9.23028L17.039 8.8701C14.4157 7.68532 12.3148 5.58433 11.13 2.96107L10.7698 2.16359Z"
        fill="var(--kiwi-colors-surface-on-surface)"
      />
    </svg>
    <p className={styles.title}>Lumin AI</p>
    <PlainTooltip content={<Trans i18nKey="viewer.chatbot.betaTooltipContent" components={{ br: <br /> }} />}>
      <span>
        <Badge variant="blue" size="sm">
          BETA
        </Badge>
      </span>
    </PlainTooltip>
  </>
);

export default DefaultChatBotTitle;
