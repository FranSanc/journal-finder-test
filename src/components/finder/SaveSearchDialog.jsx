import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function SaveSearchDialog({ open, onOpenChange, searchData, mode, onSaved }) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    await base44.entities.SavedSearch.create({
      name: name.trim(),
      abstract: searchData.abstract,
      keywords: searchData.keywords,
      aims: searchData.aims,
      scope: searchData.scope,
      mode
    });
    setIsSaving(false);
    setName("");
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="search-name">Name this search</Label>
          <Input
            id="search-name"
            placeholder="e.g. Neuroscience abstract v1"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name.trim() || isSaving}
            onClick={handleSave}
            className="text-white rounded-full"
            style={{ backgroundColor: '#2B4EF5' }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}