import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, BookmarkIcon } from "lucide-react";
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
          <BookmarkIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
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
            <Badge variant="secondary" className="text-base py-1.5 px-3">
              {savedSearches.length} {savedSearches.length === 1 ? "search" : "searches"}
            </Badge>
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
                            <Badge variant="outline" className="text-xs">
                              {search.mode === "abstract" ? "Abstract Match" : "Keywords & Aims"}
                            </Badge>
                            <span>
                              {new Date(search.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            onClick={() => onRunSearch(search)}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
                            size="sm"
                          >
                            <Play className="w-4 h-4" />
                            Display results
                          </Button>
                          <Button
                            onClick={() => onDeleteSearch(search.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
