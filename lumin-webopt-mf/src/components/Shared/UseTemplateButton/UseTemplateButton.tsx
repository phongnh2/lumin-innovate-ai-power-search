import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { useGetUseTemplateRedirectLink } from "@/hooks/useGetUseTemplateRedirectLink";

import type { IUseTemplateButtonProps } from "./UseTemplateButton.interface";

import styles from "./UseTemplateButton.module.scss";

const UseTemplateButton = (props: IUseTemplateButtonProps) => {
  const {
    id,
    slug,
    categoryAttr,
    isFullWidth = false,
    size = "lg",
  } = props;
  const templateRedirectLinkUrl = useGetUseTemplateRedirectLink({ id, slug });

  const openTemplateWithEditor = () => {
    window.open(templateRedirectLinkUrl, "_blank");
  };
  return (
    <Button
      type="button"
      variant="filled"
      className={clsx(
        styles.overrideStyle,
        !isFullWidth && styles.isFullWidth,
        size === "xl" && styles.overrideHeightXL,
        size === "lg" && styles.overrideHeightLG,
      )}
      size={size}
      onClick={openTemplateWithEditor}
      data-btn-attr-template-id={id}
      {...(categoryAttr && {
        "data-btn-attr-template-categories": categoryAttr,
      })}
    >
      Use this template
    </Button>
  );
};

export default UseTemplateButton;
