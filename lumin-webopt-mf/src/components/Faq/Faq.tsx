import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { AppIcon } from "@/components/ui/app-icon";

import type { IFaq } from "@/interfaces/faq.interface copy";

import styles from "./Faq.module.scss";

interface IProps {
  data: IFaq[];
}

const Faq = ({ data }: IProps) => (
  <div className={styles.container}>
    <h2 className={styles.faqTitle}>Frequently asked questions</h2>
    <div>
      <ul>
        {data.map(({ question, answer }) => {
          if (!answer) {
            return null;
          }

          return (
            <li key={question}>
              <Accordion>
                <AccordionItem
                  header={
                    <div className={styles.faqItemTitle}>
                      <div className={styles.faqItemTitleText}>{question}</div>{" "}
                      <AppIcon type="chevron_down" size={24} />
                    </div>
                  }
                >
                  <p className={styles.faqItemDesc}>{answer}</p>
                </AccordionItem>
              </Accordion>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

export default Faq;
