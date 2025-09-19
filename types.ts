
export interface PolicyData {
  id: string;
  partnerName: string;
  productDetails: string;
  premium: string;
  tenure: string;
  cseName: string;
  branchName: string;
  branchCode: string;
  region: string;
  customerName: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  dateOfBirth: string;
  mobileNumber: string;
  customerId: string;
  enrolmentDate: string;
  savingsAccountNumber: string;
  csbCode: string;
  d2cRoCode: string;
  nomineeName: string;
  nomineeDateOfBirth: string;
  nomineeRelationship: string;
  nomineeMobileNumber: string;
  nomineeGender: 'Male' | 'Female' | 'Other' | '';
  remarks: string;
}
