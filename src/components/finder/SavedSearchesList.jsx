import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedSearchesList({
  savedSearches,
  onRunSearch,
  onDeleteSearch,
  isLoading
}) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4" />
        <p className="text-muted-foreground">Loading saved searches...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {savedSearches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <i className="pi pi-bookmark mb-4 text-5xl text-surface-400" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No saved searches yet
          </h3>
          <p className="text-muted-foreground">
            Perform a search and save your results to access them later
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              My Saved Searches
            </h2>
            <Tag
              value={`${savedSearches.length} ${savedSearches.length === 1 ? "search" : "searches"}`}
              rounded
            />
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {savedSearches.map((search, index) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-foreground mb-2 truncate">
                            {search.name}
                          </h3>

                          <div className="space-y-2 mb-4">
                            {search.mode === "abstract" && search.abstract && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Abstract:
                                </p>
                                <p className="text-sm text-foreground line-clamp-2">
                                  {search.abstract}
                                </p>
                              </div>
                            )}

                            {search.mode === "keywords" && (
                              <div className="space-y-2">
                                {search.keywords && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Keywords:
                                    </p>
                                    <p className="text-sm text-foreground">
                                      {search.keywords}
                                    </p>
                                  </div>
                                )}
                                {search.aims && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Research Aims:
                                    </p>
                                    <p className="text-sm text-foreground line-clamp-1">
                                      {search.aims}
                                    </p>
                                  </div>
                                )}
                                {search.scope && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      Research Scope:
                                    </p>
                                    <p className="text-sm text-foreground line-clamp-1">
                                      {search.scope}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Tag
                              value={search.mode === "abstract" ? "Abstract Match" : "Keywords & Aims"}
                              severity="secondary"
                              rounded
                            />
                            <span>
                              {new Date(search.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 gap-2">
                          <Button
                            type="button"
                            size="small"
                            label="View results"
                            icon="pi pi-play"
                            onClick={() => onRunSearch(search)}
                          />
                          <Button
                            type="button"
                            size="small"
                            text
                            severity="danger"
                            icon="pi pi-trash"
                            aria-label="Delete search"
                            onClick={() => onDeleteSearch(search.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
