import { IconButton, PlainTooltip, ButtonProps } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import styles from '../ShareModal.module.scss';

interface BackButtonProps extends ButtonProps {
  tooltip?: string;
}

const BackButton = (props: BackButtonProps) => {
	const { t } = useTranslation();
  return (
		<PlainTooltip content={props.tooltip || t('modalShare.backToShareModal')}>
			<IconButton
				size="lg"
				icon="ph-arrow-left"
				className={styles.backButton}
				{...props}
			/>
		</PlainTooltip>
		);
};

export default BackButton;
