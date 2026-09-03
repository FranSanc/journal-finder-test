import { useEffect, useState } from "react";
import { InvokeLLM } from "@/integrations/keywordMatcher";
import { Journal } from "@/entities/Journal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Bookmark } from "lucide-react";

import SearchForm from "../components/finder/SearchForm";
import ResultsGrid from "../components/finder/ResultsGrid";
import SavedSearchesList from "../components/finder/SavedSearchesList";
import { SaveSearchDialog } from "../components/finder/SaveSearchDialog";
import { SavedSearchesService } from "@/utils/savedSearches";

export default function JournalFinder() {
  const [searchData, setSearchData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    aims: "",
    scope: ""
  });
  const [searchMode, setSearchMode] = useState("abstract");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [journals, setJournals] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  useEffect(() => {
    loadJournals();
    loadSavedSearches();
  }, []);

  const loadJournals = async () => {
    const journalList = await Journal.list();
    setJournals(journalList);
  };

  const loadSavedSearches = () => {
    setIsLoadingSaved(true);
    try {
      const searches = SavedSearchesService.getAll();
      setSavedSearches(searches);
    } catch (error) {
      console.error("Error loading saved searches:", error);
    } finally {
      setIsLoadingSaved(false);
    }
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
        searchMode,
        manuscript: {
          title: searchData.title,
          abstract: searchData.abstract,
        },
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

      const matches = matchingResult.data ?? matchingResult.matches ?? [];
      const isClassifierResult = Array.isArray(matchingResult.data);
      const enrichedResults = matches.map(match => {
        const journalTitle = match.journal_name ?? match.journal_title;
        const positive = Array.isArray(match.positive) ? match.positive : [];
        const journal = journals.find(j => j.title === journalTitle) ?? (isClassifierResult ? {
          title: journalTitle,
          field: "other",
          keywords: [],
          website_url: journalTitle
            ? `https://www.frontiersin.org/search?query=${encodeURIComponent(journalTitle)}`
            : undefined,
        } : null);

        return {
          ...match,
          journal_title: journalTitle,
          matching_score: match.score != null ? match.score * 20 : match.matching_score,
          relevance_explanation: match.relevance_explanation ?? positive.join(" "),
          key_matches: match.key_matches ?? positive,
          journal_data: journal
        };
      }).filter(result => result.journal_data?.title);

      setResults(enrichedResults);
    } catch (error) {
      console.error("Search error:", error);
    }

    setIsSearching(false);
  };

  const handleSaveSearch = (searchName) => {
    const savedSearch = SavedSearchesService.save({
      name: searchName,
      title: searchData.title,
      abstract: searchData.abstract,
      keywords: searchData.keywords,
      aims: searchData.aims,
      scope: searchData.scope,
      mode: searchMode,
      results: results
    });

    if (savedSearch) {
      loadSavedSearches();
      setShowSaveDialog(false);
    }
  };

  const handleRunSavedSearch = (savedSearch) => {
    setSearchData({
      title: savedSearch.title || "",
      abstract: savedSearch.abstract,
      keywords: savedSearch.keywords,
      aims: savedSearch.aims,
      scope: savedSearch.scope
    });
    setSearchMode(savedSearch.mode);
    setResults(savedSearch.results || []);
    setActiveTab("results");
  };

  const handleDeleteSavedSearch = (searchId) => {
    SavedSearchesService.delete(searchId);
    loadSavedSearches();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8 bg-card shadow-lg">
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
              Saved ({savedSearches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-0">
            <SearchForm
              searchData={searchData}
              setSearchData={setSearchData}
              onSearch={handleSearch}
              isSearching={isSearching}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
            />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <ResultsGrid
              results={results}
              isSearching={isSearching}
              onBackToSearch={() => setActiveTab("search")}
              onSaveSearch={() => setShowSaveDialog(true)}
            />
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <SavedSearchesList
              savedSearches={savedSearches}
              onRunSearch={handleRunSavedSearch}
              onDeleteSearch={handleDeleteSavedSearch}
              isLoading={isLoadingSaved}
            />
          </TabsContent>

        </Tabs>

        <SaveSearchDialog
          isOpen={showSaveDialog}
          onSave={handleSaveSearch}
          onCancel={() => setShowSaveDialog(false)}
          suggestedName=""
        />
      </div>
    </div>
  );
}