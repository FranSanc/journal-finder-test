import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchForm({
  searchData,
  setSearchData,
  onSearch,
  isSearching,
  searchMode = "abstract",
  setSearchMode
}) {
  const [mode, setMode] = useState(searchMode);

  React.useEffect(() => {
    setMode(searchMode);
  }, [searchMode]);

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (setSearchMode) {
      setSearchMode(newMode);
    }
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
      <Card className="max-w-4xl mx-auto border-surface-200 bg-white shadow-soft">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="/frontiers-logo.svg"
              alt="Frontiers icon"
              className="h-8 w-auto"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-surface-900">
            Frontiers journal finder
          </CardTitle>
          <p className="text-surface-600 mt-3">
            Provide your research abstract below and let us find the right Frontiers journal for your work
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex overflow-hidden rounded-xl border-2 border-surface-200">
            <button
              type="button"
              onClick={() => handleModeChange("abstract")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                mode === "abstract"
                  ? "bg-frontiers-100 text-frontiers-700"
                  : "bg-white text-surface-600 hover:bg-surface-50"
              }`}
            >
              <img
                src="/manuscript_icon.png"
                alt="Frontiers icon"
                className="h-6 w-auto"
              />
              1. Match my abstract
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("keywords")}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                mode === "keywords"
                  ? "bg-frontiers-100 text-frontiers-700"
                  : "bg-white text-surface-600 hover:bg-surface-50"
              }`}
            >
              <img
                src="/idea_icon.png"
                alt="light bulb icon"
                className="h-6 w-auto"
              />
              2. Search by keywords, aims & scope
            </button>
          </div>

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
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
                    Manuscript Title
                  </Label>
                  <InputText
                    id="title"
                    placeholder="Enter your manuscript title..."
                    value={searchData.title ?? ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full"
                  />
                </div>

                <Label htmlFor="abstract" className="flex items-center gap-2 text-sm font-semibold">
                  Research Abstract
                </Label>
                <InputTextarea
                  id="abstract"
                  placeholder="Paste your research abstract here. Include key findings, methodology, and conclusions..."
                  value={searchData.abstract}
                  onChange={(e) => handleInputChange("abstract", e.target.value)}
                  rows={10}
                  className="w-full"
                  autoResize={false}
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
                    Keywords
                  </Label>
                  <InputText
                    id="keywords"
                    placeholder="machine learning, neural networks, AI..."
                    value={searchData.keywords}
                    onChange={(e) => handleInputChange("keywords", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aims" className="flex items-center gap-2 text-sm font-semibold">
                    Research Aims
                  </Label>
                  <InputText
                    id="aims"
                    placeholder="Primary objectives of your research..."
                    value={searchData.aims}
                    onChange={(e) => handleInputChange("aims", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope" className="flex items-center gap-2 text-sm font-semibold">
                    Research Scope & Field
                  </Label>
                  <InputText
                    id="scope"
                    placeholder="neuroscience, computational biology, medical imaging..."
                    value={searchData.scope}
                    onChange={(e) => handleInputChange("scope", e.target.value)}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onSearch}
              disabled={isDisabled}
              loading={isSearching}
              label={isSearching ? "Analyzing & Matching..." : "Find your journal"}
              icon={isSearching ? undefined : "pi pi-search"}
              className="w-full"
            />
          </div>

          <div className="rounded-lg bg-surface-50 p-4 text-sm text-surface-600">
            <p className="mb-2 font-medium">Pro Tips:</p>
            <ul className="list-inside list-disc space-y-1">
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
