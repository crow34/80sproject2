import { Film } from 'lucide-react';

export function Loader() {
  return (
    <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
      <Film className="w-12 h-12 animate-spin" />
    </div>
  );
}