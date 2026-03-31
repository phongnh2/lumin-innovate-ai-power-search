import { LottieRefCurrentProps } from 'lottie-react';
import { IconButton, Slider } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import Select from '@new-ui/general-components/Select';

import LoadingComponent from 'lumin-components/AppCircularLoading';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { SPEAKING_PITCH, SPEAKING_RATE } from '../../constants';
import { useReadAloudContext } from '../../hooks/useReadAloudContext';
import { ICommonVoice, ILanguageOption } from '../../interfaces';
import animationData from '../../lotties/sound-effect.json';
import { readAloudActions, readAloudSelectors } from '../../slices';
import { transformVoiceOptions } from '../../utils/transformVoiceOptions';

import styles from './ReadAloudSetting.module.scss';

const Lottie = lazyWithRetry(() => import('lottie-react'), {
  fallback: <LoadingComponent />,
});

const ReadAloudSettingContent = () => {
  const themes = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const lottieRef = useRef<LottieRefCurrentProps>();

  const {
    languages = [],
    filteredVoices = [],
    onReadingSample,
  }: {
    languages: ILanguageOption[];
    filteredVoices: ICommonVoice[];
    onReadingSample: () => void;
  } = useReadAloudContext();

  const isReadingSample = useSelector(readAloudSelectors.isReadingSample);
  const voiceOptions = useMemo(() => transformVoiceOptions(filteredVoices), [filteredVoices]);
  const { activeLanguage, activeVoice, pitch, rate } = useShallowSelector(readAloudSelectors.speakingSettings);

  const handleSelectLanguage = (speakingLanguage: string) => {
    dispatch(readAloudActions.setSpeakingLanguage(speakingLanguage));
  };

  const handleSelectVoice = (voiceValue: string) => {
    const selectedVoice = filteredVoices.filter((item: ICommonVoice) => item.value === voiceValue)[0];
    dispatch(readAloudActions.setSpeakingVoice(selectedVoice));
  };

  const handleOnChangeSpeakingRate = (speakingRate: number) => {
    dispatch(readAloudActions.setSpeakingRate(speakingRate));
  };

  const handleOnChangeSpeakingPitch = (speakingPitch: number) => {
    dispatch(readAloudActions.setSpeakingPitch(speakingPitch));
  };

  const handleClickPlayBtn = () => {
    onReadingSample();
  };

  useEffect(() => {
    if (isReadingSample) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.pause();
    }
  }, [isReadingSample]);

  return (
    <div className={styles.container} style={{ width: 304 }}>
      {languages?.length > 0 && (
        <div className={styles.selectWrapper}>
          <h3 className={styles.title}>{t('common.language')}</h3>
          <Select
            options={languages}
            value={activeLanguage}
            onChange={(_, { value: _lang }) => handleSelectLanguage(_lang)}
            ListboxProps={{
              className: 'custom-scrollbar-reskin',
            }}
          />
        </div>
      )}
      {voiceOptions?.length > 0 && (
        <div className={styles.selectWrapper}>
          <h3 className={styles.title}>{t('viewer.readAloud.voiceName')}</h3>
          <Select
            options={voiceOptions}
            value={activeVoice?.value}
            onChange={(_, { value: _voiceValue }) => handleSelectVoice(_voiceValue)}
            ListboxProps={{
              className: 'custom-scrollbar-reskin',
            }}
          />
        </div>
      )}
      <div className={styles.selectWrapper}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('viewer.readAloud.speed')}</h3>
          <h3 className={styles.value}>{rate.toFixed(1)}</h3>
        </div>
        <Slider
          min={SPEAKING_RATE.MIN}
          max={SPEAKING_RATE.MAX}
          value={rate}
          defaultValue={SPEAKING_RATE.DEFAULT}
          step={SPEAKING_RATE.STEP}
          onChange={handleOnChangeSpeakingRate}
          label={null}
        />
      </div>
      <div className={styles.selectWrapper}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{t('viewer.readAloud.pitch')}</h3>
          <h3 className={styles.value}>{pitch}</h3>
        </div>
        <Slider
          min={SPEAKING_PITCH.MIN}
          max={SPEAKING_PITCH.MAX}
          value={pitch}
          defaultValue={SPEAKING_PITCH.DEFAULT}
          step={SPEAKING_PITCH.STEP}
          onChange={handleOnChangeSpeakingPitch}
          label={null}
        />
      </div>
      <div className={styles.playControlContainer}>
        <Lottie
          lottieRef={lottieRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          animationData={animationData as unknown}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
          autoplay={false}
        />
        <div className={styles.playControlWrapper}>
          <h3 className={styles.title}>{t('viewer.readAloud.samplePreview')}</h3>
          <IconButton
            className={styles.playButton}
            variant="filled"
            size="lg"
            iconColor={themes.kiwi_colors_core_on_secondary}
            icon={isReadingSample ? 'play-pause' : 'play-continue'}
            onClick={handleClickPlayBtn}
          />
        </div>
      </div>
    </div>
  );
};

export default ReadAloudSettingContent;
