import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, FileText, Target, Focus, Hash, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SaveSearchDialog from "./SaveSearchDialog";

export default function SearchForm({ 
  searchData, 
  setSearchData, 
  onSearch, 
  isSearching 
}) {
  const [mode, setMode] = useState("abstract"); // "abstract" | "keywords"
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isDisabled = isSearching || (
    mode === "abstract"
      ? !searchData.abstract.trim()
      : !searchData.keywords.trim() && !searchData.aims.trim() && !searchData.scope.trim()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-card">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <img
              src="https://media.base44.com/images/public/68acbfef2f7ee01e99f906ee/fb091ce5d_frontiers-1-2c466918.jpg"
              alt="Frontiers"
              className="h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Frontiers Journal Finder
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Provide your research abstract below and let us find the perfect Frontiers journal for your work
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex rounded-xl border-2 border-border overflow-hidden">
            <button
              onClick={() => setMode("abstract")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                mode === "abstract"
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <img src="https://media.base44.com/images/public/68acbfef2f7ee01e99f906ee/b1b2bcd93_Screenshot2026-04-21174029.png" alt="abstract" className="w-5 h-5 object-contain" />
              1. Match my abstract
            </button>
            <button
              onClick={() => setMode("keywords")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all duration-200 ${
                mode === "keywords"
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <img src="https://media.base44.com/images/public/68acbfef2f7ee01e99f906ee/08d35006e_Screenshot2026-04-21174404.png" alt="keywords" className="w-5 h-5 object-contain" />
              2. Search by keywords, aims & scope
            </button>
          </div>

          {/* Mode Content */}
          <AnimatePresence mode="wait">
            {mode === "abstract" ? (
              <motion.div
                key="abstract"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="abstract" className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="w-4 h-4 text-accent" />
                  Research Abstract
                </Label>
                <Textarea
                  id="abstract"
                  placeholder="Paste your research abstract here. Include key findings, methodology, and conclusions..."
                  value={searchData.abstract}
                  onChange={(e) => handleInputChange("abstract", e.target.value)}
                  className="min-h-48 border-2 focus:border-accent transition-colors"
                />
              </motion.div>
            ) : (
              <motion.div
                key="keywords"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="grid gap-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="flex items-center gap-2 text-sm font-semibold">
                    <Hash className="w-4 h-4 text-accent" />
                    Keywords
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="machine learning, neural networks, AI..."
                    value={searchData.keywords}
                    onChange={(e) => handleInputChange("keywords", e.target.value)}
                    className="border-2 focus:border-accent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aims" className="flex items-center gap-2 text-sm font-semibold">
                    <Target className="w-4 h-4 text-accent" />
                    Research Aims
                  </Label>
                  <Input
                    id="aims"
                    placeholder="Primary objectives of your research..."
                    value={searchData.aims}
                    onChange={(e) => handleInputChange("aims", e.target.value)}
                    className="border-2 focus:border-accent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope" className="flex items-center gap-2 text-sm font-semibold">
                    <Focus className="w-4 h-4 text-accent" />
                    Research Scope & Field
                  </Label>
                  <Input
                    id="scope"
                    placeholder="neuroscience, computational biology, medical imaging..."
                    value={searchData.scope}
                    onChange={(e) => handleInputChange("scope", e.target.value)}
                    className="border-2 focus:border-accent transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(true)}
              disabled={isSearching}
              className="rounded-full h-12 px-5 border-2 font-semibold shrink-0"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={onSearch}
              disabled={isDisabled}
              className="w-full h-12 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-white"
              style={{ backgroundColor: '#2B4EF5' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a3ae0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2B4EF5'}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Analyzing & Matching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-3" />
                  Find your journal
                </>
              )}
            </Button>
          </div>

          <SaveSearchDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            searchData={searchData}
            mode={mode}
          />

          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">💡 Pro Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use <strong>Match my abstract</strong> for the most accurate matching</li>
              <li>Use <strong>Keywords & aims</strong> when you don't have a full abstract yet</li>
              <li>Mention your research methodology if relevant</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}