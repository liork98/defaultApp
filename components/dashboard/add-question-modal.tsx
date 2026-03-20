"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Difficulty, QuestionType } from "@/lib/types";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestion: (
    title: string,
    difficulty: Difficulty,
    type: QuestionType,
    url: string,
    date: Date
  ) => void;
  selectedDate: Date;
}

export function AddQuestionModal({
  open,
  onOpenChange,
  onAddQuestion,
  selectedDate,
}: AddQuestionModalProps) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [type, setType] = useState<QuestionType>("New");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      onAddQuestion(
        title.trim(),
        difficulty,
        type,
        url.trim(),
        selectedDate
      );
      // Reset form
      setTitle("");
      setDifficulty("Medium");
      setType("New");
      setUrl("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Add a new LeetCode question to your tracker for{" "}
            {format(selectedDate, "MMMM d, yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input
                placeholder="e.g., Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50"
              />
            </Field>

            <Field>
              <FieldLabel>URL</FieldLabel>
              <Input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-background/50"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Difficulty</FieldLabel>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as Difficulty)}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-easy" />
                        Easy
                      </span>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-medium" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="Hard">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-hard" />
                        Hard
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Type</FieldLabel>
                <RadioGroup value={type} onValueChange={(v) => setType(v as QuestionType)}>
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/20 px-3 py-2">
                      <RadioGroupItem value="New" />
                      <span className="text-sm">New</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/20 px-3 py-2">
                      <RadioGroupItem value="Blitz" />
                      <span className="text-sm">Blitz</span>
                    </label>
                  </div>
                </RadioGroup>
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !url.trim()}>
              Add Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
