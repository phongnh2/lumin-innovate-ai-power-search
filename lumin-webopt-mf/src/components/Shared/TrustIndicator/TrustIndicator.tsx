import styles from "./TrustIndicator.module.scss";

const DEFAULT_INDICATOR_DATA = {
  title: "Effortlessly edit PDFs anywhere",
  items: [
    <>Save time and tackle any paperwork task with ease</>,
    <>Handle confidential information and signatures securely</>,
    <>Send work, negotiate terms and sign everything off with Lumin Sign</>,
  ],
};

const TrustIndicator = () => (
  <div className={styles.container}>
    <h2 className={styles.title}>{DEFAULT_INDICATOR_DATA.title}</h2>
    <ul>
      {DEFAULT_INDICATOR_DATA.items.map((item, index) => (
        <li
          key={`TrustIndicator ${DEFAULT_INDICATOR_DATA.title} ${index}`}
          className={styles.itemContainer}
        >
          <span className={styles.itemText}>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default TrustIndicator;
