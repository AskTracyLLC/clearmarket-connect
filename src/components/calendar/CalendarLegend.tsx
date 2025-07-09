const CalendarLegend = () => {
  return (
    <div className="mt-6 pt-4 border-t">
      <p className="text-sm font-medium mb-3">Event Types:</p>
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-secondary rounded" />
          <span>Office Closure</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded" />
          <span>Pay Date</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;