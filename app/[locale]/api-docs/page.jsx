'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { isTeamMember, isAdmin } from '@/config/team-members';
import SwaggerUI from '@/components/api-docs/SwaggerUI';
import ApiTester from '@/components/api-docs/ApiTester';
import JsonBlock from '@/components/api-docs/JsonBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, LockIcon, Code2, KeyRound, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ApiDocsPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [openApiSpec, setOpenApiSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token generation state
  const [tokenForm, setTokenForm] = useState({
    serviceId: '',
    name: '',
    email: '',
    tier: 'DEV_TESTING'
  });
  const [generatedToken, setGeneratedToken] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user has team access
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const hasAccess = isSignedIn && userEmail && isTeamMember(userEmail);
  const isUserAdmin = isSignedIn && userEmail && isAdmin(userEmail);

  useEffect(() => {
    fetch('/api-docs/openapi.json')
      .then(res => res.json())
      .then(spec => {
        setOpenApiSpec(spec);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedToken(null);

    try {
      const response = await fetch('/api/v1/admin/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenForm)
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedToken(data.data);
        setTokenForm({
          serviceId: '',
          name: '',
          email: '',
          tier: 'DEV_TESTING'
        });
      } else {
        alert('Error: ' + data.error.message);
      }
    } catch (error) {
      alert('Failed to generate token: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToken = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>
              Sign in to access API documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <SignInButton mode="modal">
              <Button className="w-full">Sign In with Clerk</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LockIcon className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              Email not authorized: <strong>{userEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Contact Administrator</AlertTitle>
              <AlertDescription>
                Request access from your team admin.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading API documentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QuakeWise API v1.1.0</h1>
              <p className="text-sm text-gray-500 mt-1">
                Authenticated: <span className="font-medium">{userEmail}</span>
              </p>
            </div>
            <Badge variant="outline">Production</Badge>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Base URL</p>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono">https://quakewise.com/api/v1</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText('https://quakewise.com/api/v1')}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="auth" className="space-y-6">
          <TabsList>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="reference">OpenAPI Spec</TabsTrigger>
            <TabsTrigger value="tester">Test API</TabsTrigger>
            {isUserAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          {/* Authentication */}
          <TabsContent value="auth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Two-Token System</h3>
                  <p className="text-sm text-gray-600 mb-3">All API calls require two tokens:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <Badge className="shrink-0">1</Badge>
                      <div>
                        <p className="font-medium">Platform Token (Service Token)</p>
                        <p className="text-gray-600 text-xs mt-1">
                          Header: <code className="bg-white px-1 py-0.5 rounded">X-Platform-Token: your_service_token</code>
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Identifies your application. Long-lived. Admin generates this for you.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-green-50 rounded border border-green-200">
                      <Badge className="shrink-0">2</Badge>
                      <div>
                        <p className="font-medium">User Token (JWT)</p>
                        <p className="text-gray-600 text-xs mt-1">
                          Header: <code className="bg-white px-1 py-0.5 rounded">Authorization: Bearer user_jwt_token</code>
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Identifies the end user. Short-lived (24h). Issue via <code className="bg-white px-1 py-0.5 rounded">/auth/issue-token</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rate Limits by Tier</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Tier</th>
                          <th className="text-left py-2">Per Hour</th>
                          <th className="text-left py-2">Per Day</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600">
                        <tr className="border-b">
                          <td className="py-2"><code>WEB_APP</code></td>
                          <td className="py-2">10,000</td>
                          <td className="py-2">100,000</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2"><code>BATCH_JOB</code></td>
                          <td className="py-2">1,000</td>
                          <td className="py-2">50,000</td>
                        </tr>
                        <tr>
                          <td className="py-2"><code>DEV_TESTING</code></td>
                          <td className="py-2">500</td>
                          <td className="py-2">5,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup</AlertTitle>
                  <AlertDescription className="text-sm space-y-1">
                    <p>1. Receive service token from admin</p>
                    <p>2. Add to <code className="bg-gray-100 px-1 rounded">SERVICE_TOKEN</code> environment variable</p>
                    <p>3. Issue user tokens as needed via <code className="bg-gray-100 px-1 rounded">/auth/issue-token</code></p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Quick Reference Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Method</th>
                        <th className="text-left py-3 px-4 font-semibold">Endpoint</th>
                        <th className="text-left py-3 px-4 font-semibold">Purpose</th>
                        <th className="text-left py-3 px-4 font-semibold">Auth Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-blue-50">POST</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs">/auth/issue-token</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">Issue JWT for end user</td>
                        <td className="py-3 px-4 text-gray-600">Platform Token</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-purple-50">POST</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs">/auth/verify-token</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">Verify JWT validity</td>
                        <td className="py-3 px-4 text-gray-600">Both Tokens</td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-green-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-green-100">POST</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs font-semibold">/assessment/complete</code>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">Complete building safety assessment</td>
                        <td className="py-3 px-4 text-gray-600">Both Tokens</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-orange-50">GET</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs">/parameters</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">Get valid parameter values</td>
                        <td className="py-3 px-4 text-gray-600">Platform Token</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-gray-50">GET</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs">/status</code>
                        </td>
                        <td className="py-3 px-4 text-gray-600">Check API health</td>
                        <td className="py-3 px-4 text-gray-600">Platform Token</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Detailed Endpoint Documentation</h3>
                </div>

                {/* Issue Token */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Badge variant="outline" className="bg-blue-50">POST</Badge>
                    <code className="text-sm font-mono">/auth/issue-token</code>
                  </div>
                  <p className="text-sm mb-3">Issue JWT token for end user</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-1 text-blue-600">REQUIRED HEADERS</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
X-Platform-Token: your_service_token
Content-Type: application/json</pre>
                    </div>

                    <div>
                      <p className="font-semibold mb-1 text-blue-600">INPUT (Request Body)</p>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <JsonBlock
                          title="Schema"
                          json={`{
  "userId": "string (required)",
  "appId": "string (required)",
  "tier": "WEB_APP | BATCH_JOB | DEV_TESTING (required)"
}`}
                        />
                        <JsonBlock
                          title="Example"
                          json={`{
  "userId": "user_123",
  "appId": "your-app-id",
  "tier": "WEB_APP"
}`}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-1 text-green-600">OUTPUT (Response 201 - Success)</p>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <JsonBlock
                          title="Schema"
                          json={`{
  "success": true,
  "data": {
    "token": "string (JWT token - expires in 24h)",
    "expiresAt": "ISO8601 datetime string"
  }
}`}
                        />
                        <JsonBlock
                          title="Example"
                          json={`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-11-25T00:00:00.000Z"
  }
}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verify Token */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Badge variant="outline" className="bg-purple-50">POST</Badge>
                    <code className="text-sm font-mono">/auth/verify-token</code>
                  </div>
                  <p className="text-sm mb-3">Verify JWT token validity</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium mb-1">Headers</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
X-Platform-Token: your_service_token
Authorization: Bearer user_jwt_token
Content-Type: application/json</pre>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Request Body</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
<code className="language-json">{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}</code></pre>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Response (200)</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
<code className="language-json">{`{
  "success": true,
  "data": {
    "valid": true,
    "userId": "user_123",
    "appId": "your-app-id",
    "expiresAt": "2025-11-25T00:00:00.000Z"
  }
}`}</code></pre>
                    </div>
                  </div>
                </div>

                {/* Complete Assessment */}
                <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded-r">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Badge variant="outline" className="bg-green-100 font-semibold">POST</Badge>
                    <code className="text-sm font-mono font-semibold">/assessment/complete</code>
                    <Badge className="ml-2 bg-green-600">Main API</Badge>
                  </div>
                  <p className="text-sm mb-3 font-medium">Perform complete building safety assessment</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-1 text-blue-600">REQUIRED HEADERS</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
X-Platform-Token: your_service_token
Authorization: Bearer user_jwt_token
Content-Type: application/json</pre>
                    </div>

                    <div>
                      <p className="font-semibold mb-1 text-blue-600">INPUT (Request Body)</p>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <JsonBlock
                          title="Schema"
                          json={`{
  "location": {
    "latitude": "number (required) - GPS latitude",
    "longitude": "number (required) - GPS longitude"
  },
  "building": {
    "structuralSystem": "string (required) - Code from /parameters",
    "numberOfStories": "number (required)",
    "yearOfConstruction": "number (required)",
    "designRegulation": "string (required) - Code from /parameters",
    "typeOfSoil": "string (optional) - ZA, ZB, ZC, ZD, ZE",
    "typeOfEarthquake": "string (optional) - Zone 1-4"
  },
  "options": {
    "includeAiAnalysis": "boolean (optional) - default: false",
    "includeLocationIntelligence": "boolean (optional) - default: false",
    "includeWeatherRisk": "boolean (optional) - default: false"
  }
}`}
                        />
                        <JsonBlock
                          title="Example"
                          json={{
                            location: {
                              latitude: 41.0082,
                              longitude: 28.9784
                            },
                            building: {
                              structuralSystem: "C2",
                              numberOfStories: 5,
                              yearOfConstruction: 2010,
                              designRegulation: "2007-2018",
                              typeOfSoil: "ZC",
                              typeOfEarthquake: "Zone 4"
                            },
                            options: {
                              includeAiAnalysis: true,
                              includeLocationIntelligence: true,
                              includeWeatherRisk: true
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-1 text-green-600">OUTPUT (Response 200 - Success)</p>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <JsonBlock
                          title="Schema"
                          json={`{
  "success": "boolean - always true on success",
  "data": {
    "safetyScore": {
      "overall": "number (0-100) - Safety score",
      "interpretation": "string - Risk level description",
      "buildingClassification": "string - Class A/B/C/D"
    },
    "seismicData": {
      "zone": "string - Earthquake zone",
      "pga": "number - Peak ground acceleration",
      "riskLevel": "string - Risk level"
    },
    "location": {
      "address": "string - Building address",
      "nearbyBuildings": "array - Adjacent structures",
      "terrain": "object - Terrain analysis"
    },
    "recommendations": "array of strings - Safety recommendations"
  }
}`}
                        />
                        <JsonBlock
                          title="Example"
                          json={{
                            success: true,
                            data: {
                              safetyScore: {
                                overall: 72.5,
                                interpretation: "Moderate risk",
                                buildingClassification: "Class B"
                              },
                              seismicData: {
                                zone: "Zone 4",
                                pga: 0.4,
                                riskLevel: "High"
                              },
                              location: {
                                address: "Sultanahmet, Istanbul",
                                nearbyBuildings: [],
                                terrain: {}
                              },
                              recommendations: [
                                "Consider structural reinforcement",
                                "Regular maintenance required"
                              ]
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Get Parameters */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Badge variant="outline" className="bg-orange-50">GET</Badge>
                    <code className="text-sm font-mono">/parameters</code>
                  </div>
                  <p className="text-sm mb-3">Get valid parameter values for assessments</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium mb-1">Headers</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
X-Platform-Token: your_service_token</pre>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Response (200)</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
<code className="language-json">{`{
  "success": true,
  "data": {
    "structuralSystems": [
      {
        "code": "C2",
        "description": "Concrete Shear Walls",
        "baseScore": 85
      },
      ...
    ],
    "designRegulations": [...],
    "soilTypes": [...],
    "earthquakeZones": [...]
  }
}`}</code></pre>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="border-l-4 border-gray-500 pl-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <Badge variant="outline" className="bg-gray-50">GET</Badge>
                    <code className="text-sm font-mono">/status</code>
                  </div>
                  <p className="text-sm mb-3">Check API health status</p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium mb-1">Headers</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
X-Platform-Token: your_service_token</pre>
                    </div>

                    <div>
                      <p className="font-medium mb-1">Response (200)</p>
                      <pre className="bg-gray-900 text-gray-100 p-2 rounded text-xs overflow-x-auto">
<code className="language-json">{`{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v1.0.0",
    "uptime": 123456,
    "services": {
      "database": "healthy",
      "ai": "configured",
      "geospatial": "configured"
    }
  }
}`}</code></pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Examples */}
          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* JavaScript/Node.js */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    JavaScript / Node.js
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
<code className="language-javascript">{`const API_BASE = 'https://quakewise.com/api/v1';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

// Step 1: Issue user token
async function getUserToken(userId) {
  const response = await fetch(\`\${API_BASE}/auth/issue-token\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Token': SERVICE_TOKEN
    },
    body: JSON.stringify({
      userId: userId,
      appId: 'your-app-id',
      tier: 'WEB_APP'
    })
  });

  const data = await response.json();
  return data.data.token;
}

// Step 2: Perform assessment
async function assessBuilding(userToken, buildingData) {
  const response = await fetch(\`\${API_BASE}/assessment/complete\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Token': SERVICE_TOKEN,
      'Authorization': \`Bearer \${userToken}\`
    },
    body: JSON.stringify(buildingData)
  });

  const data = await response.json();
  return data.data;
}

// Usage
const userToken = await getUserToken('user_123');
const result = await assessBuilding(userToken, {
  location: {
    latitude: 41.0082,
    longitude: 28.9784
  },
  building: {
    structuralSystem: 'C2',
    numberOfStories: 5,
    yearOfConstruction: 2010,
    designRegulation: '2007-2018'
  }
});

console.log('Safety Score:', result.safetyScore.overall);`}</code>
                  </pre>
                </div>

                {/* Python */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Python
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
<code className="language-python">{`import requests
import os

API_BASE = 'https://quakewise.com/api/v1'
SERVICE_TOKEN = os.getenv('SERVICE_TOKEN')

# Step 1: Issue user token
def get_user_token(user_id):
    response = requests.post(
        f'{API_BASE}/auth/issue-token',
        headers={
            'Content-Type': 'application/json',
            'X-Platform-Token': SERVICE_TOKEN
        },
        json={
            'userId': user_id,
            'appId': 'your-app-id',
            'tier': 'WEB_APP'
        }
    )

    data = response.json()
    return data['data']['token']

# Step 2: Perform assessment
def assess_building(user_token, building_data):
    response = requests.post(
        f'{API_BASE}/assessment/complete',
        headers={
            'Content-Type': 'application/json',
            'X-Platform-Token': SERVICE_TOKEN,
            'Authorization': f'Bearer {user_token}'
        },
        json=building_data
    )

    data = response.json()
    return data['data']

# Usage
user_token = get_user_token('user_123')
result = assess_building(user_token, {
    'location': {
        'latitude': 41.0082,
        'longitude': 28.9784
    },
    'building': {
        'structuralSystem': 'C2',
        'numberOfStories': 5,
        'yearOfConstruction': 2010,
        'designRegulation': '2007-2018'
    }
})

print(f"Safety Score: {result['safetyScore']['overall']}")`}</code>
                  </pre>
                </div>

                {/* cURL */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    cURL
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
<code className="language-bash">{`# Step 1: Issue user token
curl -X POST https://quakewise.com/api/v1/auth/issue-token \\
  -H "Content-Type: application/json" \\
  -H "X-Platform-Token: your_service_token" \\
  -d '{
    "userId": "user_123",
    "appId": "your-app-id",
    "tier": "WEB_APP"
  }'

# Step 2: Perform assessment (using token from step 1)
curl -X POST https://quakewise.com/api/v1/assessment/complete \\
  -H "Content-Type: application/json" \\
  -H "X-Platform-Token: your_service_token" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -d '{
    "location": {
      "latitude": 41.0082,
      "longitude": 28.9784
    },
    "building": {
      "structuralSystem": "C2",
      "numberOfStories": 5,
      "yearOfConstruction": 2010,
      "designRegulation": "2007-2018"
    }
  }'`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OpenAPI Spec */}
          <TabsContent value="reference">
            <Card>
              <CardHeader>
                <CardTitle>OpenAPI Specification</CardTitle>
              </CardHeader>
              <CardContent>
                {openApiSpec && <SwaggerUI spec={openApiSpec} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tester */}
          <TabsContent value="tester">
            <ApiTester />
          </TabsContent>

          {/* Admin */}
          {isUserAdmin && (
            <TabsContent value="admin" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    <CardTitle>Generate Service Token</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateToken} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serviceId">Service ID</Label>
                        <Input
                          id="serviceId"
                          placeholder="dev-john-doe"
                          value={tokenForm.serviceId}
                          onChange={(e) => setTokenForm({...tokenForm, serviceId: e.target.value})}
                          required
                        />
                        <p className="text-xs text-gray-500">lowercase-with-hyphens</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Developer Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={tokenForm.name}
                          onChange={(e) => setTokenForm({...tokenForm, name: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={tokenForm.email}
                          onChange={(e) => setTokenForm({...tokenForm, email: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tier">Tier</Label>
                        <Select
                          value={tokenForm.tier}
                          onValueChange={(value) => setTokenForm({...tokenForm, tier: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WEB_APP">WEB_APP (10k/hour)</SelectItem>
                            <SelectItem value="BATCH_JOB">BATCH_JOB (1k/hour)</SelectItem>
                            <SelectItem value="DEV_TESTING">DEV_TESTING (500/hour)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" disabled={generating}>
                      {generating ? 'Generating...' : 'Generate Token'}
                    </Button>
                  </form>

                  {generatedToken && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded space-y-3">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-900">Token Generated</h3>
                          <p className="text-sm text-green-700">Save this token. It won't be shown again.</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-gray-600">Service ID</Label>
                          <div className="flex gap-2 mt-1">
                            <code className="flex-1 p-2 bg-white border rounded text-sm">
                              {generatedToken.serviceId}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToken(generatedToken.serviceId)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600">Service Token</Label>
                          <div className="flex gap-2 mt-1">
                            <code className="flex-1 p-2 bg-white border rounded text-sm font-mono break-all">
                              {generatedToken.token}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToken(generatedToken.token)}
                            >
                              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-gray-600">Environment Variable</Label>
                          <div className="flex gap-2 mt-1">
                            <code className="flex-1 p-2 bg-white border rounded text-sm">
                              {generatedToken.envVar}={generatedToken.token}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToken(`${generatedToken.envVar}=${generatedToken.token}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
