import React, { createContext, useContext, useMemo, useState } from "react";

type ReviewRefreshContextValue = {
  refreshToken: number;
  markReviewsUpdated: () => void;
};

const ReviewRefreshContext = createContext<ReviewRefreshContextValue | undefined>(undefined);