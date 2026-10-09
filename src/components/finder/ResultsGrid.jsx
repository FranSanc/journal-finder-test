import { Button } from "primereact/button";
import { motion, AnimatePresence } from "framer-motion";

import JournalCard from "./JournalCard";

export default function ResultsGrid({
  results,
  isSearching,
  onBackToSearch,
  onSaveSearch
}) {
  if (isSearching) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="py-12 text-center">
          <i className="pi pi-spin pi-spinner mb-4 text-4xl text-frontiers-600" />
          <h3 className="text-xl font-semibold text-surface-900">Analyzing Your Research</h3>
          <p className="mt-2 text-surface-600">
            Our AI is matching your work to the most suitable Frontiers journals...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-surface-900">
            Journal Recommendations
          </h2>
          <p className="text-surface-600">
            Found {results.length} matching journals ranked by relevance
          </p>
        </div>
        <div className="flex gap-3">
          {onSaveSearch && (
            <Button
              type="button"
              outlined
              label="Save Search"
              icon="pi pi-bookmark"
              onClick={onSaveSearch}
            />
          )}
          <Button
            type="button"
            outlined
            label="New Search"
            icon="pi pi-arrow-left"
            onClick={onBackToSearch}
          />
        </div>
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
            className="py-12 text-center"
          >
            <i className="pi pi-search mb-4 text-5xl text-surface-400" />
            <h3 className="mb-2 text-xl font-semibold text-surface-900">
              No matches found
            </h3>
            <p className="mb-6 text-surface-600">
              Try adjusting your search terms or providing more details about your research.
            </p>
            <Button
              type="button"
              label="Try Another Search"
              onClick={onBackToSearch}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
