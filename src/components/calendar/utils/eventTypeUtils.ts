import { CalendarIcon, X, DollarSign } from "lucide-react";

export const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "unavailable":
      return X;
    case "office_closure":
      return CalendarIcon;
    case "pay_date":
      return DollarSign;
    default:
      return CalendarIcon;
  }
};

export const getEventTypeColor = (type: string) => {
  switch (type) {
    case "unavailable":
      return "destructive" as const;
    case "office_closure":
      return "secondary" as const;
    case "pay_date":
      return "default" as const;
    default:
      return "outline" as const;
  }
};

export const getEventTypeOptions = (userRole: "field_rep" | "vendor") => {
  if (userRole === "field_rep") {
    return [
      { value: "unavailable", label: "Unavailable/Time Off", description: "Mark dates when you're not available for work" }
    ];
  } else {
    return [
      { value: "office_closure", label: "Office Closure", description: "Days when your office is closed" },
      { value: "pay_date", label: "Pay Date", description: "Payment processing days or pay periods" }
    ];
  }
};

export const generateDefaultTitle = (eventType: string) => {
  switch (eventType) {
    case "unavailable":
      return "Unavailable";
    case "office_closure":
      return "Office Closed";
    case "pay_date":
      return "Pay Day";
    default:
      return "";
  }
};