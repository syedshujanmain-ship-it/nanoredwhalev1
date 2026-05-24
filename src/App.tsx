import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { NanoRedWhalePage } from '@/pages/NanoRedWhalePage';

const App: React.FC = () => {
  return (
    <>
      <div className="flex flex-col h-screen">
        <main className="flex-grow overflow-hidden">
          <NanoRedWhalePage />
        </main>
      </div>
      <Toaster />
    </>
  );
};

export default App;
