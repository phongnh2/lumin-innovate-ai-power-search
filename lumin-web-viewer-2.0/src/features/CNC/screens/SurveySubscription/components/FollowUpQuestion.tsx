import { LightbulbIcon } from '@luminpdf/icons/dist/csr/Lightbulb';
import {
  Text,
  Select,
  Icomoon as IcomoonKiwi,
  Divider,
  Textarea,
  MultiSelect,
  Checkbox,
  Slider,
} from 'lumin-ui/kiwi-ui';
import React from 'react';
import { TFunction } from 'react-i18next';

import { FollowUpQuestionItem, PDF_USAGE_FREQUENCY, USING_TOOLS } from '../constant';
import styles from '../SurveySubscription.module.scss';

interface FollowUpQuestionProps {
  getQuestionData: () => FollowUpQuestionItem[];
  followUpQuestion: FollowUpQuestionItem;
  setFollowUpQuestion: (option: FollowUpQuestionItem) => void;
  setPdfUsageFrequency: (value: string) => void;
  setUsingTools: (value: USING_TOOLS[]) => void;
  setSliderValue: (value: number) => void;
  t: TFunction;
  shouldRenderFollowUpSubQuestion: boolean;
  shouldRenderFollowUpDescription: boolean;
  shouldRenderSlider: boolean;
  feedback: string;
  setFeedback: (value: string) => void;
  usingTools: USING_TOOLS[];
  pdfUsageFrequency: string;
}
const FollowUpQuestion = ({
  getQuestionData,
  followUpQuestion,
  setFollowUpQuestion,
  setPdfUsageFrequency,
  setUsingTools,
  setSliderValue,
  t,
  shouldRenderFollowUpSubQuestion,
  shouldRenderFollowUpDescription,
  shouldRenderSlider,
  feedback,
  setFeedback,
  usingTools,
  pdfUsageFrequency,
}: FollowUpQuestionProps): React.ReactNode => (
  <div className={styles.followUpQuestionWrapper}>
    <div className={styles.followUpQuestionItem}>
      <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('surveySubscription.followUpQuestion1')}
      </Text>
      <Select
        size="lg"
        withScrollArea={false}
        value={pdfUsageFrequency}
        data={Object.entries(PDF_USAGE_FREQUENCY).map(([key, value]) => ({
          value: key,
          label: t(value),
        }))}
        renderOption={(item: { option: { value: string; label: string } }) => (
          <div className={styles.selectOptionWrapper}>
            <IcomoonKiwi
              type="ph-check"
              size="md"
              color="var(--kiwi-colors-surface-on-surface)"
              style={{ visibility: pdfUsageFrequency === item.option.value ? 'visible' : 'hidden' }}
            />
            <Text type="label" size="md" color="var(--kiwi-colors-surface-on-surface)">
              {item.option.label}
            </Text>
          </div>
        )}
        classNames={{
          input: styles.selectInput,
          option: styles.selectOption,
          dropdown: styles.selectDropdown,
        }}
        // eslint-disable-next-line sonarjs/no-duplicate-string
        placeholder={t('surveySubscription.followUpQuestionPlaceholder')}
        rightSection={<IcomoonKiwi type="ph-caret-down" size="sm" color="var(--kiwi-colors-surface-on-surface)" />}
        onChange={(_, option) => setPdfUsageFrequency(option.value)}
      />
    </div>
    <div className={styles.followUpQuestionItem}>
      <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('surveySubscription.followUpQuestion2')}
      </Text>
      <Select
        size="lg"
        withScrollArea={false}
        value={followUpQuestion ? followUpQuestion.value : null}
        data={getQuestionData()}
        renderOption={(item: { option: FollowUpQuestionItem }) => (
          <div className={styles.selectOptionWrapper}>
            <IcomoonKiwi
              type="ph-check"
              size="md"
              color="var(--kiwi-colors-surface-on-surface)"
              style={{ visibility: followUpQuestion?.value === item.option.value ? 'visible' : 'hidden' }}
            />
            <Text type="label" size="md" color="var(--kiwi-colors-surface-on-surface)">
              {item.option.label}
            </Text>
          </div>
        )}
        classNames={{
          input: styles.selectInput,
          option: styles.selectOption,
          dropdown: styles.selectDropdown,
        }}
        placeholder={t('surveySubscription.followUpQuestionPlaceholder')}
        rightSection={<IcomoonKiwi type="ph-caret-down" size="sm" color="var(--kiwi-colors-surface-on-surface)" />}
        onChange={(_, option: FollowUpQuestionItem) => setFollowUpQuestion(option)}
      />
    </div>
    {shouldRenderFollowUpSubQuestion && (
      <div className={styles.followUpQuestionItem}>
        <Text type="title" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {followUpQuestion.subQuestion}
        </Text>
        <MultiSelect
          placeholder={usingTools.length > 0 ? '' : t('surveySubscription.followUpQuestionPlaceholder')}
          maxDropdownHeight={304}
          value={usingTools}
          data={Object.entries(USING_TOOLS).map(([key, value]) => ({
            value: key as USING_TOOLS,
            label: t(value),
          }))}
          renderOption={(item: { option: { value: USING_TOOLS; label: string } }) => (
            <div className={styles.multiSelectOption}>
              <Checkbox checked={usingTools.includes(item.option.value)} readOnly tabIndex={-1} />
              <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
                {item.option.label}
              </Text>
            </div>
          )}
          onChange={(value: USING_TOOLS[]) => setUsingTools(value)}
          classNames={{
            wrapper: styles.multiSelectWrapper,
            input: styles.multiSelectInput,
            dropdown: styles.multiSelectDropdown,
            inputField: styles.multiSelectInputField,
            pill: styles.multiSelectPill,
          }}
        />
      </div>
    )}
    <Divider />
    {shouldRenderFollowUpDescription && (
      <>
        <div className={styles.followUpQuestionListWrapper}>
          <div className={styles.lightbulbIcon}>
            <LightbulbIcon weight="regular" size={24} />
          </div>
          <Text type="title" size="md" color="var(--kiwi-colors-surface-on-surface)">
            {followUpQuestion.followUpDescription}
          </Text>
        </div>
        {shouldRenderSlider && (
          <div className={styles.sliderWrapper}>
            <Slider
              color="var(--kiwi-colors-surface-inverse-surface)"
              min={0.5}
              max={19}
              step={0.5}
              defaultValue={0.5}
              label={(value) => `$${value}/month`}
              onChangeEnd={(value) => setSliderValue(value)}
            />
            <div className={styles.sliderValueWrapper}>
              <div className={styles.sliderValue}>{`$${0.5}/month`}</div>
              <div className={styles.sliderValue}>{`$${19}/month`}</div>
            </div>
          </div>
        )}
        <div className={styles.followUpFeedback}>
          <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
            {t('surveySubscription.followUpFeedbackTitle')}
          </Text>
          <Textarea
            size="lg"
            placeholder={t('surveySubscription.textareaPlaceholder')}
            classNames={{
              wrapper: styles.textareaWrapper,
              input: styles.textareaInput,
            }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>
      </>
    )}
  </div>
);

export default FollowUpQuestion;
