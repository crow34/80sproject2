import React, { Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Outlet } from 'react-router-dom';
import { Loader } from './components/Loader';

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;