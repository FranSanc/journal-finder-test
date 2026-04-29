import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import JournalCard from "./JournalCard";

export default function ResultsGrid({ 
  results, 
  isSearching, 
  onBackToSearch 
}) {
  if (isSearching) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Analyzing Your Research</h3>
          <p className="text-muted-foreground mt-2">
            Our AI is matching your work to the most suitable Frontiers journals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Journal Recommendations
          </h2>
          <p className="text-muted-foreground">
            Found {results.length} matching journals ranked by relevance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onBackToSearch}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          New Search
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {results.length > 0 ? (
          <div className="grid gap-6">
            {results.map((result, index) => (
              <motion.div
                key={result.journal_data.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <JournalCard journal={result} showScore={true} rank={index + 1} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No matches found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or providing more details about your research.
            </p>
            <Button onClick={onBackToSearch} className="bg-accent hover:bg-accent/90">
              Try Another Search
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}