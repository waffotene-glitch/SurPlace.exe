import React, { createContext, useContext, useMemo, useState } from "react";

type ReviewDraft = {
  restaurantId: string | null;
  plateId: string | null;
  rating: string;
  comment: string;
  capturedMediaUri: string | null;
  capturedMediaType: "image" | "video" | null;
};

type ReviewDraftContextValue = {
  draft: ReviewDraft;
  updateDraft: (patch: Partial<ReviewDraft>) => void;
  resetDraft: (nextDraft?: Partial<ReviewDraft>) => void;
};

const initialDraft: ReviewDraft = {
  restaurantId: null,
  plateId: null,
  rating: "5",
  comment: "",
  capturedMediaUri: null,
  capturedMediaType: null,
};