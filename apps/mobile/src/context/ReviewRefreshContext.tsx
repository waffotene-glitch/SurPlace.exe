import React, { createContext, useContext, useMemo, useState } from "react";

type ReviewRefreshContextValue = {
  refreshToken: number;
  markReviewsUpdated: () => void;
};

const ReviewRefreshContext = createContext<ReviewRefreshContextValue | undefined>(undefined);
export function ReviewRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshToken, setRefreshToken] = useState(0);

  const value = useMemo<ReviewRefreshContextValue>(
    () => ({
      refreshToken,
      markReviewsUpdated: () => {
        setRefreshToken((current) => current + 1);
      },
    }),
    [refreshToken]
  );

  return (
    <ReviewRefreshContext.Provider value={value}>{children}</ReviewRefreshContext.Provider>
  );
}
