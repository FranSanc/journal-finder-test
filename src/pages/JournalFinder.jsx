import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/integrations/Core";
import { Journal } from "@/entities/Journal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Bookmark } from "lucide-react";

import SearchForm from "../components/finder/SearchForm";
import ResultsGrid from "../components/finder/ResultsGrid";
import SavedSearches from "../components/finder/SavedSearches";

export default function JournalFinder() {
  const [searchData, setSearchData] = useState({
    abstract: "",
    keywords: "",
    aims: "",
    scope: ""
  });
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [journals, setJournals] = useState([]);
  const [activeTab, setActiveTab] = useState("search");

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    const journalList = await Journal.list();
    setJournals(journalList);
  };

  const handleSearch = async () => {
    if (!searchData.abstract.trim() && !searchData.keywords.trim() && !searchData.aims.trim()) {
      return;
    }

    setIsSearching(true);
    setActiveTab("results");

    try {
      const searchPrompt = `
        Analyze the following research submission and match it to the most suitable Frontiers journals from the provided list.
        
        Research Details:
        Abstract: ${searchData.abstract}
        Keywords: ${searchData.keywords}
        Research Aims: ${searchData.aims}
        Scope: ${searchData.scope}
        
        Available Journals: ${JSON.stringify(journals.map(j => ({
          title: j.title,
          field: j.field,
          scope: j.scope,
          keywords: j.keywords,
          description: j.description
        })))}
        
        For each potentially suitable journal, calculate a matching score (0-100) based on:
        - Relevance of research topic to journal scope
        - Keyword overlap
        - Field alignment
        - Research aims compatibility
        
        Return the top 5 matching journals with detailed explanations for why each is suitable.
      `;

      const matchingResult = await InvokeLLM({
        prompt: searchPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  journal_title: { type: "string" },
                  matching_score: { type: "number" },
                  relevance_explanation: { type: "string" },
                  key_matches: {
                    type: "array",
                    items: { type: "string" }
                  },
                  submission_recommendation: { type: "string" }
                }
              }
            }
          }
        }
      });

      const enrichedResults = matchingResult.matches.map(match => {
        const journal = journals.find(j => j.title === match.journal_title);
        return {
          ...match,
          journal_data: journal
        };
      }).filter(result => result.journal_data);

      setResults(enrichedResults);
    } catch (error) {
      console.error("Search error:", error);
    }

    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8 bg-card shadow-lg">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Results ({results.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-0">
            <SearchForm
              searchData={searchData}
              setSearchData={setSearchData}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <ResultsGrid
              results={results}
              isSearching={isSearching}
              onBackToSearch={() => setActiveTab("search")}
            />
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                My Saved Searches
              </h2>
              <SavedSearches
                onLoadSearch={(s) => {
                  setSearchData({
                    abstract: s.abstract || "",
                    keywords: s.keywords || "",
                    aims: s.aims || "",
                    scope: s.scope || ""
                  });
                  setActiveTab("search");
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}