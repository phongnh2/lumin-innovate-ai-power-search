export interface InterfaceConstraint {
    getName(): string;
    getErrorMessage(value): string;
    validate(value): boolean;
    parse?(value): any;
}
