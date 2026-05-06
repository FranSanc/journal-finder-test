// Journal entity module
export const Journal = {
  async list() {
    try {
      const response = await fetch('/src/entities/journalData.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Transform CSV data to match expected format
      return data.map(journal => ({
        title: journal['Journal Name'],
        short_title: journal['Abbreviation'],
        field: mapSubjectAreaToField(journal['Subject Area']),
        scope: journal['Scope'],
        keywords: journal['Keywords'] ? journal['Keywords'].split('; ').map(k => k.trim()) : [],
        impact_factor: journal['Impact Factor'] ? parseFloat(journal['Impact Factor']) : null,
        submission_types: journal['Submission Types'] ? journal['Submission Types'].split('; ').map(t => t.trim()) : [],
        open_access: journal['Open Access'] === 'Yes',
        website_url: journal['URL'],
        description: journal['Description']
      }));
    } catch (error) {
      console.error('Error loading journal data:', error);
      return [];
    }
  }
};

// Helper function to map subject areas to field enums
function mapSubjectAreaToField(subjectArea) {
  const mapping = {
    'Life Sciences': 'biology',
    'Medicine & Health': 'medicine',
    'Engineering & Technology': 'engineering',
    'Environment & Sustainability': 'environmental_science',
    'Social Sciences & Humanities': 'social_sciences'
  };
  return mapping[subjectArea] || 'other';
}