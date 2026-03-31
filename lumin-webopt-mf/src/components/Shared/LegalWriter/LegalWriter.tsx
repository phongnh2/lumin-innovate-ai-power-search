import type { ITemplate } from "@/interfaces/template.interface";

import styles from "./LegalWriter.module.scss";

const getFullLink = (link: string) =>
  link.includes("https://") ? link : `https://${link}`;

const LegalWriterLink = ({
  link,
  writerName,
}: {
  link: string;
  writerName: string;
}) => (
  <a
    className={styles.link}
    href={getFullLink(link)}
    target="_blank"
    rel="noreferrer"
  >
    {writerName}
  </a>
);

const LegalWriter = ({ info }: { info: Omit<ITemplate, "thumbnails"> }) => {
  const { legalReview, writerName, bioLink, role } = info;

  if (!legalReview) {
    return null;
  }

  return (
    <p className={styles.legalWriterLink}>
      {role} by
      <LegalWriterLink link={bioLink} writerName={writerName} />
    </p>
  );
};

export default LegalWriter;
