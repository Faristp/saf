// API configuration and helper functions
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://mydomain.com";
const LOGIN_URL = process.env.LOGIN_URL
export interface InvoiceListItem {
  SalesInvoices_SysId: string;
  SalesInvoices_TxnDate: string;
  SalesInvoices_TxnNum: number;
  SalesInvoices_ReferenceNum: string | null;
  Customers_SysId: string;
  Customers_Name: string;
  Salesmans_Name: string;
  Warehouses_Name: string;
  Currencies_Code: string;
  GrossValue: number;
  NetValueLC: number;
  PaymentStatus: string;
  WorkflowStatus: string;
  SalesInvoices_TxnInstanceId: string;
}

export interface InvoiceLineItem {
  SalesInvoiceId: string;
  ItemDescription: string;
  Qty: number;
  BaseQty: number;
  UnitPrice: number;
  GrossValue: number;
  NetValueLC: number;
  DiscountInPercent: number;
  DiscountValue: number;
  TaxAmount: number;
  Item: {
    Code: string;
    Name: string;
    NameL2: string;
    Level1ItemGroupName: string;
  };
  UnitOfMeasure: {
    Code: string;
    Name: string;
  };
  TxnInstanceDetail: string;
}

export interface InvoiceListResponse {
  data: InvoiceListItem[];
  totalCount: number;
}

export interface InvoiceDetailsResponse {
  data: InvoiceLineItem[];
  totalCount: number;
}

export async function getInvoicesList(skip: number = 0, take: number = 25, cookieHeader?: string) {
  const listingId = "c3a181aa-0d87-4c5a-a77c-e9f918df2caa";
  const listingViewId = "f4bedb32-0076-4ff1-bb9a-4271be0cac3d";

  const url = `${BASE_URL}/sales/SalesInvoice/GetListingData?skip=${skip}&take=${take}&requireTotalCount=true&listingId=${listingId}&listingViewId=${listingViewId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include", // Include cookies in request
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to fetch invoices: ${response.status} ${response.statusText} - ${raw.slice(0, 1000)}`
    );
  }

  // If backend returned HTML (login/redirect page) or non-JSON, throw with raw body
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Unexpected backend response (content-type=${contentType}): ${raw.slice(0, 1000)}`
    );
  }

  return JSON.parse(raw) as InvoiceListResponse;
}

export async function getInvoiceDetails(
  salesInvoiceId: string,
  txnInstanceId: string,
  cookieHeader?: string
) {
  const url = `${BASE_URL}/sales/SalesInvoice/GetInvoiceLines?salesInvoiceId=${salesInvoiceId}&txnInstanceId=${txnInstanceId}&requireTotalCount=true`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
    credentials: "include", // Include cookies in request
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to fetch invoice details: ${response.status} ${response.statusText} - ${raw.slice(0,1000)}`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Unexpected backend response (content-type=${contentType}): ${raw.slice(0,1000)}`
    );
  }

  return JSON.parse(raw) as InvoiceDetailsResponse;
}

// Authentication API - Using FormData
export async function loginUser(username: string, password: string) {
  const url = `${LOGIN_URL}/User/Login`; // Update this endpoint based on your API

  // Create FormData
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include", // Important: This allows cookies to be set
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Login failed: ${response.statusText}`
    );
  }

  return response.json();
}
