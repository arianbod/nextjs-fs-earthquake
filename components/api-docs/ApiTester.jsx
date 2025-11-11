'use client';

/**
 * API Tester Component
 * Interactive API testing interface with token management
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ApiTester() {
  const [platformToken, setPlatformToken] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test endpoint configurations
  const endpoints = {
    status: {
      method: 'GET',
      path: '/api/v1/status',
      requiresPlatform: false,
      requiresJWT: false,
      body: null
    },
    parameters: {
      method: 'GET',
      path: '/api/v1/parameters',
      requiresPlatform: false,
      requiresJWT: false,
      body: null
    },
    issueToken: {
      method: 'POST',
      path: '/api/v1/auth/issue-token',
      requiresPlatform: true,
      requiresJWT: false,
      body: {
        userId: 'test_user_123',
        appId: 'test-app',
        tier: 'pro',
        expiresIn: '7d'
      }
    },
    assessment: {
      method: 'POST',
      path: '/api/v1/assessment/complete',
      requiresPlatform: true,
      requiresJWT: true,
      body: {
        location: {
          latitude: 41.0082,
          longitude: 28.9784
        },
        building: {
          structuralSystem: 'C2',
          numberOfStories: 5,
          yearOfConstruction: 2010,
          designRegulation: '2007-2018',
          typeOfSoil: 'ZC',
          typeOfEarthquake: 'Zone 4'
        },
        options: {
          includeAiAnalysis: false,
          includeLocationIntelligence: true,
          includeWeatherRisk: true
        }
      }
    }
  };

  const [selectedEndpoint, setSelectedEndpoint] = useState('status');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(endpoints.status.body, null, 2) || ''
  );

  const handleEndpointChange = (endpointKey) => {
    setSelectedEndpoint(endpointKey);
    const endpoint = endpoints[endpointKey];
    setRequestBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '');
    setResponse(null);
    setError(null);
  };

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const endpoint = endpoints[selectedEndpoint];
      const headers = {
        'Content-Type': 'application/json'
      };

      if (endpoint.requiresPlatform && platformToken) {
        headers['X-Platform-Token'] = platformToken;
      }

      if (endpoint.requiresJWT && jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const options = {
        method: endpoint.method,
        headers
      };

      if (endpoint.method === 'POST' && requestBody) {
        options.body = requestBody;
      }

      const startTime = Date.now();
      const res = await fetch(endpoint.path, options);
      const endTime = Date.now();

      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: endTime - startTime,
        headers: Object.fromEntries(res.headers.entries()),
        data: data
      });

      // Auto-fill JWT token if this was issue-token endpoint
      if (selectedEndpoint === 'issueToken' && data.success && data.data.token) {
        setJwtToken(data.data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive API Tester</CardTitle>
          <CardDescription>
            Test QuakeWise API endpoints with your authentication tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform-token">Platform Token</Label>
              <Input
                id="platform-token"
                type="password"
                placeholder="Enter your platform token"
                value={platformToken}
                onChange={(e) => setPlatformToken(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Required for authenticated endpoints
              </p>
            </div>
            <div>
              <Label htmlFor="jwt-token">JWT Token</Label>
              <Input
                id="jwt-token"
                type="password"
                placeholder="Get from /auth/issue-token"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Required for user-specific endpoints
              </p>
            </div>
          </div>

          {/* Endpoint Selection */}
          <div>
            <Label htmlFor="endpoint">Select Endpoint</Label>
            <select
              id="endpoint"
              className="w-full p-2 border rounded-md"
              value={selectedEndpoint}
              onChange={(e) => handleEndpointChange(e.target.value)}
            >
              <option value="status">GET /api/v1/status (Public)</option>
              <option value="parameters">GET /api/v1/parameters (Public)</option>
              <option value="issueToken">POST /api/v1/auth/issue-token</option>
              <option value="assessment">POST /api/v1/assessment/complete</option>
            </select>
          </div>

          {/* Request Body */}
          {endpoints[selectedEndpoint].method === 'POST' && (
            <div>
              <Label htmlFor="request-body">Request Body</Label>
              <Textarea
                id="request-body"
                className="font-mono text-sm"
                rows={12}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="JSON request body"
              />
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={testEndpoint}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending Request...' : 'Send Request'}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Response Display */}
          {response && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <span className={`font-semibold ${response.status < 400 ? 'text-green-600' : 'text-red-600'}`}>
                    {response.status} {response.statusText}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Response time: {response.time}ms
                </div>
              </div>

              <Tabs defaultValue="body" className="w-full">
                <TabsList>
                  <TabsTrigger value="body">Response Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="mt-4">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-sm max-h-96">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </TabsContent>
                <TabsContent value="headers" className="mt-4">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-sm max-h-96">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
