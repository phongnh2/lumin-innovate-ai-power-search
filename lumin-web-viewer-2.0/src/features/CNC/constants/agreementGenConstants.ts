import WriteEmploymentContract from 'assets/images/write-employment-contract.png';
import WriteLeaseAgreement from 'assets/images/write-lease-agreement.png';
import WriteNDA from 'assets/images/write-NDA.png';

export const EXAMPLES_PROMPT_AGREEMENT = [
  {
    id: 3.0,
    title: 'Non-Disclosure Agreement (NDA)',
    promptMessage: `Create a Non-Disclosure Agreement between <mark class="mark-home-prompt"><span contenteditable="false">[Party A]</span></mark> and <mark class="mark-home-prompt"><span contenteditable="false">[Party B]</span></mark> to protect confidential information.

Structure the document as follows:
1. Introduction: Identify the parties (Disclosing Party and Receiving Party) and the purpose of the agreement.
2. Definition of Confidential Information: Clearly define what information is considered confidential and provide examples.
3. Obligations of the Receiving Party: Outline how the receiving party must handle and protect the confidential information.
4. Exclusions from Confidential Information: State information that is not covered, such as public knowledge or independently developed data.
5. Duration of Confidentiality: Specify the time period for which the confidentiality obligation applies.
6. Breach and Penalties: Detail the consequences of breaching the agreement, including potential legal actions or penalties.
7. Governing Law and Jurisdiction: State the legal framework that governs the agreement.
8. Signatures: Provide space for both parties to sign and date the agreement.`,
    imgSrc: WriteNDA,
  },

  {
    id: 7.0,
    title: 'Employment Contract',
    promptMessage: `Generate an Employment Contract for hiring <mark class="mark-home-prompt"><span contenteditable="false">[Employee]</span></mark> as a <mark class="mark-home-prompt"><span contenteditable="false">[job position]</span></mark>.

Structure the contract with the following sections:
1. Introduction: Identify the employer and employee, and include the job title and start date.
2. Job Responsibilities: Clearly outline the employee’s duties and responsibilities.
3. Compensation and Benefits: Specify the salary, payment schedule, bonuses, and benefits such as health insurance, PTO, and retirement plans.
4. Working Hours and Policies: Define expected working hours, breaks, and overtime policies.
5. Probation Period: Include the duration and evaluation criteria for the probation period, if applicable.
6. Confidentiality and Non-Disclosure: Outline the employee’s obligation to protect sensitive company information.
7. Non-Compete and Non-Solicitation: Specify restrictions on competing with the employer or soliciting clients after employment.
8. Termination Clause: Include terms for resignation, dismissal, notice period, and severance pay.
9. Governing Law and Jurisdiction: Specify the applicable legal framework.
10. Signatures: Provide space for both parties to sign and date the contract.`,
    imgSrc: WriteEmploymentContract,
  },
  {
    id: 10.0,
    title: 'Lease Agreement',
    promptMessage: `Write a Lease Agreement for renting out <mark class="mark-home-prompt"><span contenteditable="false">[property address]</span></mark> between <mark class="mark-home-prompt"><span contenteditable="false">[Landlord]</span></mark> and <mark class="mark-home-prompt"><span contenteditable="false">[Tenant]</span></mark>.

Structure the agreement as follows:
1. Introduction: Identify the landlord and tenant, and describe the rental property (address, type, etc.).
2. Lease Term: Specify the duration of the lease, including start and end dates, and any renewal options.
3. Rent Details: Include the rent amount, payment frequency, payment methods, and late payment penalties.
4. Security Deposit: State the deposit amount, terms for refund, and allowable deductions.
5. Tenant Obligations: Define the tenant’s responsibilities, such as property maintenance and utility payments.
6. Landlord Obligations: Outline the landlord’s duties, including repairs and ensuring the property’s habitability.
7. Rules and Restrictions: Include specific rules, such as those regarding pets, noise, and subleasing.
8. Termination Clause: Specify the conditions for terminating the lease early and any associated penalties.
9. Governing Law and Jurisdiction: Define the legal framework for resolving disputes.
10. Signatures: Provide space for both parties to sign and date the agreement.`,
    imgSrc: WriteLeaseAgreement,
  },
];

export const PROMPT_TYPE = {
  SAMPLE_PROMPT_ORIGINAL: 'sample_prompt_original',
  SAMPLE_PROMPT_REVISED: 'sample_prompt_revised',
  SUGGESTED_QUESTION: 'suggested_question',
  CUSTOM_PROMPT: 'custom_prompt',
} as const;

export const CONTEXT = {
  LUMINPDF_HOMEPAGE: 'luminpdf_homepage',
  MY_DOCUMENTS: 'my_documents',
};

export const THINKING_MESSAGES = [
  'Working on it...',
  'Let me figure this out for you...',
  `Let's dive in...`,
  'Just connecting the dots...',
  `One moment, I'm sorting this out...`,
  'Gathering all the right words...',
  'Crunching through the details...',
  'Bringing everything together, just a second...',
];

export const AGREEMENT_GEN_EVENTS = {
  GENERATE_RESPONSE: 'generate_response',
  SAMPLE_PROMPT_SELECTED: 'sample_prompt_selected',
  MODAL_EXPANDED: 'modalExpanded',
  MODAL_COLLAPSED: 'modalCollapsed',
};
