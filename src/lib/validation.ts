import { ProjectStatus } from "@/lib/types";

export const MAX_NAME_LENGTH = 100;
export const MAX_VALUE = 1_000_000_000; // 1 billion PKR

export interface ProjectInput {
  clientName: string;
  projectName: string;
  status: ProjectStatus;
  totalValue: number | string;
  amountPaid: number | string;
}

export interface VpsInput {
  company: string;
  ipAddress: string;
  username: string;
  password: string;
  clientName?: string;
  deployedItems?: string;
}

export interface ToolInput {
  appName: string;
  url: string;
  description?: string;
}

export interface SiteInput {
  siteName: string;
  username: string;
  password: string;
  driveLink?: string;
}

export interface ValidationErrors {
  clientName?: string;
  projectName?: string;
  totalValue?: string;
  amountPaid?: string;
  company?: string;
  ipAddress?: string;
  username?: string;
  password?: string;
  appName?: string;
  url?: string;
  siteName?: string;
  driveLink?: string;
}

/**
 * Validates project form data. Returns an errors object —
 * empty object means all fields are valid.
 */
export function validateProject(input: ProjectInput): ValidationErrors {
  const errors: ValidationErrors = {};

  const clientName = String(input.clientName).trim();
  const projectName = String(input.projectName).trim();
  const totalValue = Number(input.totalValue);
  const amountPaid = Number(input.amountPaid);

  if (!clientName) {
    errors.clientName = "Client name is required.";
  } else if (clientName.length > MAX_NAME_LENGTH) {
    errors.clientName = `Client name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!projectName) {
    errors.projectName = "Project name is required.";
  } else if (projectName.length > MAX_NAME_LENGTH) {
    errors.projectName = `Project name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (isNaN(totalValue) || totalValue <= 0) {
    errors.totalValue = "Total value must be greater than 0.";
  } else if (totalValue > MAX_VALUE) {
    errors.totalValue = `Total value cannot exceed ${MAX_VALUE.toLocaleString()}.`;
  }

  if (isNaN(amountPaid) || amountPaid < 0) {
    errors.amountPaid = "Amount paid cannot be negative.";
  } else if (!isNaN(totalValue) && amountPaid > totalValue) {
    errors.amountPaid = "Amount paid cannot exceed the total value.";
  } else if (amountPaid > MAX_VALUE) {
    errors.amountPaid = `Amount paid cannot exceed ${MAX_VALUE.toLocaleString()}.`;
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Returns trimmed, coerced values ready for storage */
export function coerceProject(input: ProjectInput) {
  return {
    clientName: String(input.clientName).trim(),
    projectName: String(input.projectName).trim(),
    status: input.status,
    totalValue: Number(input.totalValue),
    amountPaid: Number(input.amountPaid),
  };
}

export function validateVps(input: VpsInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.company.trim()) errors.company = "Company is required.";
  else if (input.company.trim().length > MAX_NAME_LENGTH) errors.company = `Company name must be ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!input.ipAddress.trim()) errors.ipAddress = "IP Address is required.";
  
  if (!input.username.trim()) errors.username = "Username is required.";
  
  if (!input.password.trim()) errors.password = "Password is required.";

  return errors;
}

export function coerceVps(input: VpsInput) {
  return {
    company: input.company.trim(),
    ipAddress: input.ipAddress.trim(),
    username: input.username.trim(),
    password: input.password.trim(),
    clientName: input.clientName?.trim() || "",
    deployedItems: input.deployedItems?.trim() || "",
  };
}

export function validateTool(input: ToolInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.appName.trim()) errors.appName = "App name is required.";
  else if (input.appName.trim().length > MAX_NAME_LENGTH) errors.appName = `App name must be ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!input.url.trim()) errors.url = "URL is required.";

  return errors;
}

export function coerceTool(input: ToolInput) {
  return {
    appName: input.appName.trim(),
    url: input.url.trim(),
    description: input.description?.trim() || "",
  };
}

export function validateSite(input: SiteInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.siteName.trim()) errors.siteName = "Site name is required.";
  else if (input.siteName.trim().length > MAX_NAME_LENGTH) errors.siteName = `Site name must be ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!input.username.trim()) errors.username = "Username is required.";
  if (!input.password.trim()) errors.password = "Password is required.";

  return errors;
}

export function coerceSite(input: SiteInput) {
  return {
    siteName: input.siteName.trim(),
    username: input.username.trim(),
    password: input.password.trim(),
    driveLink: input.driveLink?.trim() || "",
  };
}
