import React, { createContext, useContext, useMemo, useState } from "react";

type ReviewDraft = {
  restaurantId: string | null;
  plateId: string | null;
  rating: string;
  comment: string;
  capturedMediaUri: string | null;
  capturedMediaType: "image" | "video" | null;
};