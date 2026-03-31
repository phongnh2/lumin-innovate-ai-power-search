import type { ICategory } from "@/interfaces/category.interface";

import styles from "./Card.module.scss";

export interface CardProps {
  category: ICategory;
}

const Card = ({ category }: CardProps) => (
  <div
    className={styles.categoryCard}
    style={{ "--bg-color": category.backgroundColor } as React.CSSProperties}
  >
    <div className={styles.categoryContent}>
      <h3 className={styles.categoryTitle}>{category.title}</h3>
      <p className={styles.categoryDescription}>{category.description}</p>
    </div>
  </div>
);

export default Card;
