export interface SamlSsoSectionData {
  options: Array<{
    title: string;
    subtitle: React.ReactNode;
    question: {
      type: string;
      field: {
        key: string;
        value: boolean;
      };
      dependents: any[];
      disabled?: boolean;
    };
    viewButton: React.ReactNode;
  }>;
  permission: {
    isAllow: boolean;
    disallowedReason: string;
    requiredUpgrade: boolean;
  };
}
