import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, Users } from "lucide-react";

export default function JournalCard({ journal, showScore = false, rank = null }) {
  const { journal_data, matching_score, relevance_explanation, key_matches } = journal;

  const getFieldColor = (field) => {
    const colors = {
      neuroscience: "bg-purple-100 text-purple-800 border-purple-200",
      psychology: "bg-blue-100 text-blue-800 border-blue-200", 
      medicine: "bg-red-100 text-red-800 border-red-200",
      public_health: "bg-green-100 text-green-800 border-green-200",
      bioengineering: "bg-orange-100 text-orange-800 border-orange-200",
      genetics: "bg-pink-100 text-pink-800 border-pink-200",
      microbiology: "bg-teal-100 text-teal-800 border-teal-200",
      plant_science: "bg-lime-100 text-lime-800 border-lime-200",
      environmental_science: "bg-emerald-100 text-emerald-800 border-emerald-200",
      computer_science: "bg-indigo-100 text-indigo-800 border-indigo-200",
      robotics: "bg-slate-100 text-slate-800 border-slate-200",
      physics: "bg-violet-100 text-violet-800 border-violet-200",
      chemistry: "bg-cyan-100 text-cyan-800 border-cyan-200",
      materials_science: "bg-amber-100 text-amber-800 border-amber-200",
      earth_science: "bg-stone-100 text-stone-800 border-stone-200",
      marine_science: "bg-sky-100 text-sky-800 border-sky-200",
      veterinary_science: "bg-rose-100 text-rose-800 border-rose-200",
      nutrition: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pharmacology: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      immunology: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[field] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <Card className="journal-card border-0 shadow-lg hover:shadow-2xl bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {rank && (
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  {rank}
                </div>
              )}
              <Badge 
                variant="secondary" 
                className={`${getFieldColor(journal_data.field)} border font-medium`}
              >
                {journal_data.field.replace(/_/g, ' ')}
              </Badge>
              {journal_data.open_access && (
                <Badge variant="outline" className="text-accent border-accent">
                  Open Access
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-bold text-foreground leading-tight">
              {journal_data.title}
            </CardTitle>
            {journal_data.short_title && (
              <p className="text-sm text-muted-foreground mt-1">
                {journal_data.short_title}
              </p>
            )}
          </div>
          
          {showScore && matching_score && (
            <div className={`px-3 py-2 rounded-lg font-bold text-lg ${getScoreColor(matching_score)}`}>
              {matching_score}%
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {journal_data.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {journal_data.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {journal_data.impact_factor && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>IF: {journal_data.impact_factor}</span>
            </div>
          )}
          {journal_data.submission_types && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{journal_data.submission_types.length} article types</span>
            </div>
          )}
        </div>

        {showScore && relevance_explanation && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <h4 className="font-semibold text-sm text-foreground mb-2">
              Why this journal matches:
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {relevance_explanation}
            </p>
          </div>
        )}

        {key_matches && key_matches.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Key matches:</h4>
            <div className="flex flex-wrap gap-1">
              {key_matches.slice(0, 4).map((match, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {match}
                </Badge>
              ))}
              {key_matches.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{key_matches.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {journal_data.keywords && journal_data.keywords.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Research areas:</h4>
            <div className="flex flex-wrap gap-1">
              {journal_data.keywords.slice(0, 6).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {journal_data.keywords.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{journal_data.keywords.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            asChild
            className="w-full rounded-full text-white font-semibold"
            style={{ backgroundColor: '#2B4EF5' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a3ae0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2B4EF5'}
          >
            <a
              href={journal_data.website_url || `https://www.frontiersin.org/journals/${journal_data.field}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Journal Website
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}