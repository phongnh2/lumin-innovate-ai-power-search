import type { ITemplate } from "@/interfaces/template.interface";
import { getHighResThumbnail } from "@/utils/template";

import styles from "./Card.module.scss";

export interface CardProps {
  template: ITemplate;
  onClick?: () => void;
}

const Card = ({ template, onClick }: CardProps) => (
  <div className={styles.card} onClick={onClick}>
    <div className={styles.thumbnailWrapper}>
      <img
        className={styles.thumbnail}
        src={getHighResThumbnail(template.thumbnail)}
        alt={template.title}
      />
    </div>
    <div className={styles.info}>
      <h3 className={styles.templateTitle}>{template.title}</h3>
      <p className={styles.usage}>{template.usage}</p>
    </div>
  </div>
);

export default Card;
