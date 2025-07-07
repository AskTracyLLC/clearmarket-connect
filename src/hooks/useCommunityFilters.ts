import { useState } from "react";
import { SortOption } from "@/utils/postUtils";

export const useCommunityFilters = () => {
  const [sortBy, setSortBy] = useState<SortOption>("helpful");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  return {
    sortBy,
    setSortBy,
    selectedCategory,
    setSelectedCategory,
    searchKeyword,
    setSearchKeyword,
    showCreateModal,
    setShowCreateModal,
  };
};