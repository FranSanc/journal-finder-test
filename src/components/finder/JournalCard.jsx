import { Tag } from "primereact/tag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users } from "lucide-react";

export default function JournalCard({ journal, showScore = false, rank = null }) {
  const { journal_data, matching_score, relevance_explanation, key_matches } = journal;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <Card className="journal-card border border-surface-200 bg-white shadow-soft hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {rank && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-frontiers-600 text-sm font-bold text-white">
                  {rank}
                </div>
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
              <span>JIF: {journal_data.impact_factor}</span>
            </div>
          )}
          {journal_data.submission_types && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{journal_data.submission_types.length} article types</span>
            </div>
          )}
          {(journal_data.issn_print || journal_data.issn_electronic) && (
            <div className="flex items-center gap-1">
              <span>ISSN: {journal_data.issn_print || journal_data.issn_electronic}</span>
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
                <Tag key={`${match}-${index}`} value={match} rounded />
              ))}
              {key_matches.length > 4 && (
                <Tag value={`+${key_matches.length - 4} more`} rounded />
              )}
            </div>
          </div>
        )}

        {journal_data.keywords && journal_data.keywords.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Research areas:</h4>
            <div className="flex flex-wrap gap-1">
              {journal_data.keywords.slice(0, 6).map((keyword, index) => (
                <Tag key={`${keyword}-${index}`} value={keyword} severity="secondary" rounded />
              ))}
              {journal_data.keywords.length > 6 && (
                <Tag value={`+${journal_data.keywords.length - 6} more`} severity="secondary" rounded />
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <a
            href={journal_data.website_url || `https://www.frontiersin.org/journals/${journal_data.field}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-button p-component w-full"
          >
            <span className="p-button-icon p-button-icon-left pi pi-external-link" aria-hidden="true" />
            <span className="p-button-label">Visit Journal Website</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}