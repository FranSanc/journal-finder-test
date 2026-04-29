import React, { useState, useEffect } from "react";
import { Journal } from "@/entities/Journal";
import { motion, AnimatePresence } from "framer-motion";

import JournalCard from "../components/finder/JournalCard";
import BrowseFilters from "../components/browse/BrowseFilters";

export default function BrowseJournals() {
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, []);

  useEffect(() => {
    filterJournals();
  }, [journals, searchTerm, selectedField, sortBy]);

  const loadJournals = async () => {
    const journalList = await Journal.list();
    setJournals(journalList);
    setIsLoading(false);
  };

  const filterJournals = () => {
    let filtered = [...journals];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(journal =>
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Field filter
    if (selectedField !== "all") {
      filtered = filtered.filter(journal => journal.field === selectedField);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "impact_factor":
          return (b.impact_factor || 0) - (a.impact_factor || 0);
        case "field":
          return a.field.localeCompare(b.field);
        default:
          return 0;
      }
    });

    setFilteredJournals(filtered);
  };

  const getFieldColor = (field) => {
    const colors = {
      neuroscience: "bg-purple-100 text-purple-800",
      psychology: "bg-blue-100 text-blue-800",
      medicine: "bg-red-100 text-red-800",
      public_health: "bg-green-100 text-green-800",
      bioengineering: "bg-orange-100 text-orange-800",
      genetics: "bg-pink-100 text-pink-800",
      microbiology: "bg-teal-100 text-teal-800",
      plant_science: "bg-lime-100 text-lime-800",
      environmental_science: "bg-emerald-100 text-emerald-800",
      computer_science: "bg-indigo-100 text-indigo-800",
      robotics: "bg-slate-100 text-slate-800",
      physics: "bg-violet-100 text-violet-800",
      chemistry: "bg-cyan-100 text-cyan-800",
      materials_science: "bg-amber-100 text-amber-800",
      earth_science: "bg-stone-100 text-stone-800",
      marine_science: "bg-sky-100 text-sky-800",
      veterinary_science: "bg-rose-100 text-rose-800",
      nutrition: "bg-yellow-100 text-yellow-800",
      pharmacology: "bg-fuchsia-100 text-fuchsia-800",
      immunology: "bg-gray-100 text-gray-800"
    };
    return colors[field] || "bg-gray-100 text-gray-800";
  };

  const fields = [...new Set(journals.map(j => j.field))].sort();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse Frontiers Journals
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive collection of {journals.length} open-access journals
          </p>
        </div>

        <BrowseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          sortBy={sortBy}
          setSortBy={setSortBy}
          fields={fields}
          journalCount={filteredJournals.length}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {!isLoading ? (
              filteredJournals.map((journal, index) => (
                <motion.div
                  key={journal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <JournalCard
                    journal={{
                      journal_data: journal,
                      matching_score: null,
                      relevance_explanation: null
                    }}
                    showScore={false}
                  />
                </motion.div>
              ))
            ) : (
              Array(9).fill(0).map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
              ))
            )}
          </AnimatePresence>
        </div>

        {!isLoading && filteredJournals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No journals found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}