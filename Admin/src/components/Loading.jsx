const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600 text-lg font-medium">Loading...</span>
    </div>
  </div>
);

export default Loading;
