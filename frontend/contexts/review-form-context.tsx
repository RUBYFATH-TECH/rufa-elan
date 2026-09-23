"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReviewFormContextType {
  isReviewFormOpen: boolean;
  setIsReviewFormOpen: (isOpen: boolean) => void;
}

const ReviewFormContext = createContext<ReviewFormContextType | undefined>(undefined);

export function ReviewFormProvider({ children }: { children: ReactNode }) {
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  return (
    <ReviewFormContext.Provider value={{ isReviewFormOpen, setIsReviewFormOpen }}>
      {children}
    </ReviewFormContext.Provider>
  );
}

export function useReviewForm() {
  const context = useContext(ReviewFormContext);
  if (context === undefined) {
    throw new Error('useReviewForm must be used within a ReviewFormProvider');
  }
  return context;
}
