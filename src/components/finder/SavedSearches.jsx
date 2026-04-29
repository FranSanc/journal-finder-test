import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SavedSearches({ onLoadSearch }) {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.SavedSearch.list("-created_date");
    setSavedSearches(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.SavedSearch.delete(id);
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-6 h-6 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookmarkCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No saved searches yet</p>
        <p className="text-sm mt-1">Save a search from the search form to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {savedSearches.map(s => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border border-border">
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{s.name}</p>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {s.mode === "abstract" ? "Abstract" : "Keywords"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {s.abstract || [s.keywords, s.aims, s.scope].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="rounded-full text-white text-xs"
                    style={{ backgroundColor: '#2B4EF5' }}
                    onClick={() => onLoadSearch(s)}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}