import styles from "./InformationBlock.module.scss";

const Description = ({ description }: { description: string }) => (
  <div className={styles.descriptionContainer}>
    <p className={styles.description}>{description}</p>
  </div>
);

export default Description;
