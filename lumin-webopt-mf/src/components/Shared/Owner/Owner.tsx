import { AppIcon } from "@/components/ui/app-icon";

import type {
  ITemplate,
  ITemplateOwner,
} from "@/interfaces/template.interface";

import styles from "./Owner.module.scss";

const getFullLink = (pathName: string) => `https://${pathName}`;

interface IOwnerLinkProps {
  link: NonNullable<ITemplateOwner["link"]>;
}

const OwnerLink = ({ link }: IOwnerLinkProps) => (
  <>
    <a
      style={{
        marginLeft: 4,
      }}
      className={styles.link}
      href={getFullLink(link)}
      target="_blank"
      rel="noreferrer"
    >
      {link}
    </a>{" "}
    <AppIcon
      type="external-link"
      className={styles.link}
      style={{ marginLeft: 4 }}
    />
  </>
);

const Owner = ({ info }: { info: Omit<ITemplate, "thumbnails"> }) => {
  const { owner } = info;

  return (
    owner.link && (
      <p className={styles.ownerLink}>
        Originally published by <OwnerLink link={owner.link} />
      </p>
    )
  );
};

export default Owner;
