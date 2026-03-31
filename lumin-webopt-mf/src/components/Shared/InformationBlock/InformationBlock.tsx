import clsx from "clsx";

import type { ITemplate } from "@/interfaces/template.interface";
import { transformTemplateNavigate } from "@/utils/filter-transformer";

import ActionButtonGroup from "../ActionButtonGroup";
import LegalWriter from "../LegalWriter";
import Owner from "../Owner";
import PrimaryCategories from "../PrimaryCategories";
import RevisionIndicator from "../RevisionIndicator";
import UsedTime from "../UsedTime";
import UseTemplateButton from "../UseTemplateButton";

import Description from "./Description";

import styles from "./InformationBlock.module.scss";

interface InformationBlockProps {
  info: Omit<ITemplate, "thumbnails">;
  isShowRevisionIndicator?: boolean;
}

const InformationBlock = (props: InformationBlockProps) => {
  const { info, isShowRevisionIndicator = true } = props;
  const {
    title,
    description,
    categories,
    totalUsed,
    subTitle,
    primaryIndustryCategory,
    primaryTaskCategory,
  } = info;

  const renderCtaButton = () => (
    <div
      className={clsx([
        styles.ctaButtonContainer,
        styles.ctaButtonContainerDesktop,
      ])}
    >
      <UsedTime usedTime={totalUsed} />
      <UseTemplateButton {...transformTemplateNavigate(info)} />
    </div>
  );

  return (
    <div>
      <PrimaryCategories
        noMarginTop
        categories={categories}
        primaryIndustryCategory={primaryIndustryCategory}
        primaryTaskCategory={primaryTaskCategory}
      />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subTitle}>{subTitle}</p>
      <Description description={description} />
      {isShowRevisionIndicator && <RevisionIndicator />}
      <LegalWriter info={info} />
      <Owner info={info} />
      {renderCtaButton()}
      <ActionButtonGroup />
    </div>
  );
};
export default InformationBlock;
