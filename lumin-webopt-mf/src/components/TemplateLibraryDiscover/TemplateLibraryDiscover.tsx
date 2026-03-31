import { useState } from "react";

import Vector from "@/assets/images/svg/vector.svg";

import { Template } from "@/components/Template";

import { SearchBar } from "./components";
import SearchResults from "./components/SearchResults/SearchResults";

import styles from "./TemplateLibraryDiscover.module.scss";

interface User {
  id: string;
  name: string;
  email: string;
}

interface TemplateLibraryDiscoverProps {
  user?: User;
}

export const TemplateLibraryDiscover = ({
  user,
}: TemplateLibraryDiscoverProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const displayName = user?.name?.split(" ")[0] || "there";

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isSearching = searchQuery.length > 0;

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>Hi {displayName},</h1>
        <img src={Vector} alt="logo" className={styles.vector} />
      </section>
      <SearchBar
        onSearch={handleSearch}
        onClear={handleClearSearch}
        showClearButton={isSearching}
      />
      {isSearching ? (
        <SearchResults searchQuery={searchQuery} />
      ) : (
        <Template.Gallery />
      )}
    </div>
  );
};
