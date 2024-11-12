import React, { useState } from 'react';
import { Check, X, MoreHorizontal, Trash2 } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';

interface MovieStatusButtonProps {
  movieId: number;
  movieTitle: string;
  posterPath?: string;
}

export function MovieStatusButton({ movieId, movieTitle, posterPath }: MovieStatusButtonProps) {
  const { progress, markAsWatched, markAsUnavailable, removeMovieStatus } = useProgress();
  const [showOptions, setShowOptions] = useState(false);
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const isWatched = progress?.watchedMovies?.[movieId];
  const isUnavailable = progress?.unavailableMovies?.[movieId];

  const handleMarkUnavailable = async () => {
    if (showReasonInput) {
      await markAsUnavailable(movieId, movieTitle, reason, posterPath);
      setReason('');
      setShowReasonInput(false);
      setShowOptions(false);
    } else {
      setShowReasonInput(true);
    }
  };

  return (
    <div className="relative">
      {showOptions ? (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 rounded-lg shadow-lg p-2 min-w-[200px]">
          <button
            onClick={() => {
              markAsWatched(movieId, movieTitle, undefined, undefined, posterPath);
              setShowOptions(false);
            }}
            className="flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded"
          >
            <Check className="w-4 h-4" />
            <span>Mark as Watched</span>
          </button>
          <button
            onClick={handleMarkUnavailable}
            className="flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded"
          >
            <X className="w-4 h-4" />
            <span>Mark as Unavailable</span>
          </button>
          {(isWatched || isUnavailable) && (
            <button
              onClick={() => {
                removeMovieStatus(movieId);
                setShowOptions(false);
              }}
              className="flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Status</span>
            </button>
          )}
        </div>
      ) : null}

      {showReasonInput ? (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-900 rounded-lg shadow-lg p-2 min-w-[200px]">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is it unavailable?"
            className="w-full bg-gray-800 text-white rounded p-2 mb-2"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowReasonInput(false)}
              className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkUnavailable}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`p-2 rounded-full ${
          isWatched
            ? 'bg-green-600'
            : isUnavailable
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-gray-700'
        }`}
      >
        {isWatched ? (
          <Check className="w-4 h-4" />
        ) : isUnavailable ? (
          <X className="w-4 h-4" />
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}