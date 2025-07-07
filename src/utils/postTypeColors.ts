export const getPostTypeColor = (type: string) => {
  switch (type) {
    case "Coverage Needed": return "bg-red-100 text-red-800 border-red-200";
    case "Platform Help": return "bg-blue-100 text-blue-800 border-blue-200";
    case "Warnings": return "bg-orange-100 text-orange-800 border-orange-200";
    case "Tips": return "bg-green-100 text-green-800 border-green-200";
    case "Industry News": return "bg-purple-100 text-purple-800 border-purple-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};