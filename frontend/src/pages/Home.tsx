import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">Welcome to the Note-Taking App</h1>
      <p className="mt-2 text-base sm:text-lg text-gray-600">This is the home page.</p>
    </div>
  );
};

export default Home;