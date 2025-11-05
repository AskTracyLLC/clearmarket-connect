import { useState, useEffect, useRef } from 'react';

interface RequestLog {
  id: string;
  table: string;
  operation: string;
  timestamp: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
}

const requestLogs = new Map<string, RequestLog>();
const requestCounts = new Map<string, number>();
let listeners: Array<() => void> = [];

// Intercept fetch to track Supabase requests
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const url = args[0].toString();
  
  // Only track Supabase REST API calls
  if (url.includes('supabase.co/rest/v1/') || url.includes('/rpc/')) {
    const requestId = Math.random().toString(36).substr(2, 9);
    const table = url.split('/rest/v1/')[1]?.split('?')[0] || url.split('/rpc/')[1]?.split('?')[0] || 'unknown';
    const operation = args[1]?.method || 'GET';
    const key = `${table}:${operation}`;
    
    // Track request count for loop detection
    requestCounts.set(key, (requestCounts.get(key) || 0) + 1);
    
    const log: RequestLog = {
      id: requestId,
      table,
      operation,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    requestLogs.set(requestId, log);
    notifyListeners();
    
    try {
      const response = await originalFetch(...args);
      log.duration = Date.now() - log.timestamp;
      log.status = response.ok ? 'success' : 'error';
      requestLogs.set(requestId, log);
      notifyListeners();
      
      // Clean up old requests after 5 seconds
      setTimeout(() => {
        requestLogs.delete(requestId);
        notifyListeners();
      }, 5000);
      
      return response;
    } catch (error) {
      log.duration = Date.now() - log.timestamp;
      log.status = 'error';
      requestLogs.set(requestId, log);
      notifyListeners();
      throw error;
    }
  }
  
  return originalFetch(...args);
};

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export const useSupabaseDebug = () => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [loops, setLoops] = useState<string[]>([]);
  const updateCounter = useRef(0);

  useEffect(() => {
    const update = () => {
      updateCounter.current++;
      setRequests(Array.from(requestLogs.values()));
      
      // Detect potential loops (>10 requests to same endpoint in 5 seconds)
      const loopDetection: string[] = [];
      requestCounts.forEach((count, key) => {
        if (count > 10) {
          loopDetection.push(`${key} (${count} calls)`);
        }
      });
      setLoops(loopDetection);
    };
    
    listeners.push(update);
    update();
    
    // Reset counts every 5 seconds
    const interval = setInterval(() => {
      requestCounts.clear();
      setLoops([]);
    }, 5000);
    
    return () => {
      listeners = listeners.filter(fn => fn !== update);
      clearInterval(interval);
    };
  }, []);

  return { requests, loops };
};
