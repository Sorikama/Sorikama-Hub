import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-muted rounded-full"></div>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
};

export default Loader;