import React from 'react';
import { format } from 'date-fns';

const Timeline = ({ events = [] }) => {
  if (!events.length) {
    return <div className="text-gray-500 text-sm py-4">No history available.</div>;
  }

  return (
    <div className="relative border-l-2 border-surface-tertiary ml-3 space-y-6 pb-4 mt-2">
      {events.map((event, idx) => {
        const Icon = event.icon;
        
        return (
          <div key={event.id || idx} className="relative pl-6">
            <div className="absolute -left-[11px] top-1 bg-white p-1 rounded-full border border-border">
              {Icon ? <Icon className="w-3 h-3 text-primary" /> : <div className="w-3 h-3 bg-primary rounded-full" />}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
              <span className="font-medium text-gray-900 text-sm">{event.action}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {event.date ? format(new Date(event.date), 'MMM d, yyyy h:mm a') : ''}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">{event.description}</p>
            
            {event.user && (
              <div className="text-xs text-gray-500 font-medium">
                by {event.user}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
