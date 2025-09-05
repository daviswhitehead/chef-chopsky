'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, DollarSign, Zap } from 'lucide-react';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

interface ProjectStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageResponseTime: number;
  totalCost: number;
}

interface RecentRun {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime?: string;
  inputs?: any;
  outputs?: any;
  error?: string;
}

interface LangSmithHealth {
  tests: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: TestResult[];
  };
  monitoring: {
    recentRuns: RecentRun[];
    projectStats: ProjectStats;
  };
  timestamp: string;
}

export default function LangSmithMonitor() {
  const [health, setHealth] = useState<LangSmithHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test/langsmith');
      const data = await response.json();
      
      if (data.success) {
        setHealth(data);
      } else {
        setError(data.error || 'Failed to fetch LangSmith health');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  if (loading && !health) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Activity className="h-6 w-6 text-gray-400 animate-spin mr-2" />
          <span className="text-gray-500">Loading LangSmith health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">LangSmith Health Check Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHealth}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!health) return null;

  const { tests, monitoring } = health;
  const { projectStats, recentRuns } = monitoring;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">LangSmith Integration Health</h2>
          <p className="text-gray-600">Last updated: {formatTime(health.timestamp)}</p>
        </div>
        <button
          onClick={fetchHealth}
          className="btn-secondary flex items-center"
          disabled={loading}
        >
          <Activity className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Test Results Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Tests</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{tests.totalTests}</div>
            <div className="text-sm text-gray-600">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{tests.passedTests}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{tests.failedTests}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
        
        <div className="space-y-2">
          {tests.results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {getStatusIcon(result.passed)}
                <span className="ml-2 font-medium text-gray-900">{result.testName}</span>
              </div>
              <div className={`text-sm ${getStatusColor(result.passed)}`}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{projectStats.totalRuns}</div>
            <div className="text-sm text-gray-600">Total Runs</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-600">{projectStats.successfulRuns}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-xl font-bold text-red-600">{projectStats.failedRuns}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{formatDuration(projectStats.averageResponseTime)}</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-xl font-bold text-gray-900">{formatCost(projectStats.totalCost)}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>
        </div>
      </div>

      {/* Recent Runs */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Runs</h3>
        {recentRuns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent runs found
          </div>
        ) : (
          <div className="space-y-3">
            {recentRuns.map((run) => (
              <div key={run.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      run.status === 'success' ? 'bg-green-100 text-green-800' :
                      run.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {run.status}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">{run.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatTime(run.startTime)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {run.id}
                </div>
                {run.error && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {run.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
