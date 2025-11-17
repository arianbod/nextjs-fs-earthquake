'use client';

/**
 * API Documentation Page - Developer Focused
 * Clean, organized documentation for QuakeWise API
 * Categorized by use case (Mobile, Web, Backend)
 */

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { isTeamMember } from '@/config/team-members';
import SwaggerUI from '@/components/api-docs/SwaggerUI';
import ApiTester from '@/components/api-docs/ApiTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, LockIcon, Code2, Smartphone, Globe, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApiDocsPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [openApiSpec, setOpenApiSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has team access
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const hasAccess = isSignedIn && userEmail && isTeamMember(userEmail);

  useEffect(() => {
    // Load OpenAPI specification
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

  // Loading Clerk user data
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // User not signed in
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
              This page is restricted to QuakeWise team members only
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Please sign in with your QuakeWise account to access the internal API documentation.
            </p>
            <SignInButton mode="modal">
              <Button className="w-full">
                Sign In with Clerk
              </Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User signed in but not authorized
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
              Your email is not authorized to access this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Current email: <strong>{userEmail}</strong>
            </p>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Team Members Only</AlertTitle>
              <AlertDescription>
                Access is restricted to authorized developers.
                Contact your team admin to request access.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading OpenAPI spec
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading API documentation...</p>
      </div>
    );
  }

  // Error loading spec
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Documentation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">QuakeWise API Documentation</h1>
              <p className="text-gray-600">
                RESTful API for earthquake safety assessments • v1.1.0
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Authenticated as: <span className="font-medium">{userEmail}</span>
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Production
            </Badge>
          </div>

          {/* Base URL */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Base URL</p>
                <code className="text-sm font-mono text-blue-600">https://quakewise.com/api/v1</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText('https://quakewise.com/api/v1')}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Documentation */}
        <Tabs defaultValue="quickstart" className="space-y-6">
          <TabsList>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Apps</TabsTrigger>
            <TabsTrigger value="web">Web Apps</TabsTrigger>
            <TabsTrigger value="reference">Full API Reference</TabsTrigger>
            <TabsTrigger value="tester">API Tester</TabsTrigger>
          </TabsList>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  Get started with QuakeWise API in 3 steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Step 1: Authentication Setup</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your service token has been provided separately. Add it to your environment:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
{`# .env
SERVICE_TOKEN=your_service_token_here`}
                  </pre>
                </div>

                {/* Step 2 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Step 2: Issue User Token</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    For each user session, obtain a JWT token:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                    <code className="language-javascript">{`// JavaScript Example
const response = await fetch('https://quakewise.com/api/v1/auth/issue-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Platform-Token': process.env.SERVICE_TOKEN
  },
  body: JSON.stringify({
    userId: 'user_123',
    appId: 'your-app-id',
    tier: 'WEB_APP'
  })
});

const { data } = await response.json();
const userToken = data.token;`}</code>
                  </pre>
                </div>

                {/* Step 3 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Step 3: Make API Calls</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Use both tokens to perform assessments:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                    <code className="language-javascript">{`// Perform building assessment
const assessment = await fetch('https://quakewise.com/api/v1/assessment/complete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Platform-Token': process.env.SERVICE_TOKEN,
    'Authorization': \`Bearer \${userToken}\`
  },
  body: JSON.stringify({
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
  })
});

const result = await assessment.json();
console.log('Safety Score:', result.data.safetyScore.overall);`}</code>
                  </pre>
                </div>

                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Rate Limits</AlertTitle>
                  <AlertDescription>
                    Your tier determines API limits. See your service configuration for details.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Apps Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  <CardTitle>Mobile App Integration</CardTitle>
                </div>
                <CardDescription>
                  Essential APIs for mobile applications (iOS, Android, React Native, Flutter)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Authentication */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Authentication
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="font-medium text-sm">POST /auth/issue-token</p>
                      <p className="text-xs text-gray-600 mt-1">Issue JWT for mobile users</p>
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                          View request/response
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600">REQUEST BODY:</p>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs mt-1">
                              <code className="language-json">{`{
  "userId": "mobile_user_123",
  "appId": "quakewise-mobile-api",
  "tier": "WEB_APP"
}`}</code>
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">RESPONSE (201):</p>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs mt-1">
                              <code className="language-json">{`{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-11-24T00:00:00.000Z"
  }
}`}</code>
                            </pre>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                {/* Core Assessment */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Building Assessment
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="font-medium text-sm">POST /assessment/complete</p>
                      <p className="text-xs text-gray-600 mt-1">Complete safety assessment with GPS location</p>
                      <details className="mt-2">
                        <summary className="text-sm text-green-600 cursor-pointer hover:underline">
                          View request/response
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600">REQUEST BODY:</p>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs mt-1">
                              <code className="language-json">{`{
  "location": {
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "building": {
    "structuralSystem": "C2",
    "numberOfStories": 5,
    "yearOfConstruction": 2010,
    "designRegulation": "2007-2018",
    "typeOfSoil": "ZC",
    "typeOfEarthquake": "Zone 4"
  },
  "options": {
    "includeAiAnalysis": true,
    "includeLocationIntelligence": true
  }
}`}</code>
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">RESPONSE (200):</p>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs mt-1">
                              <code className="language-json">{`{
  "success": true,
  "data": {
    "safetyScore": {
      "overall": 72.5,
      "interpretation": "Moderate risk",
      "buildingClassification": "Class B"
    },
    "seismicData": {
      "zone": "Zone 4",
      "pga": 0.4,
      "riskLevel": "High"
    },
    "recommendations": [
      "Consider structural reinforcement",
      "Regular maintenance required"
    ]
  }
}`}</code>
                            </pre>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Utilities
                  </h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="font-medium text-sm">GET /parameters</p>
                      <p className="text-xs text-gray-600 mt-1">Get valid options for dropdowns (requires auth)</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <p className="font-medium text-sm">GET /status</p>
                      <p className="text-xs text-gray-600 mt-1">Check API health (requires auth)</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Code Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Complete Mobile Example</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                    <code className="language-javascript">{`// React Native / Expo Example
import axios from 'axios';

const API_BASE = 'https://quakewise.com/api/v1';
const SERVICE_TOKEN = 'your_service_token';

// 1. Issue user token on login
async function loginUser(userId) {
  const { data } = await axios.post(
    \`\${API_BASE}/auth/issue-token\`,
    {
      userId,
      appId: 'quakewise-mobile-api',
      tier: 'WEB_APP'
    },
    {
      headers: { 'X-Platform-Token': SERVICE_TOKEN }
    }
  );

  // Store token securely
  await SecureStore.setItemAsync('userToken', data.data.token);
  return data.data.token;
}

// 2. Perform assessment with user's location
async function assessBuilding(buildingData) {
  const userToken = await SecureStore.getItemAsync('userToken');

  const { data } = await axios.post(
    \`\${API_BASE}/assessment/complete\`,
    buildingData,
    {
      headers: {
        'X-Platform-Token': SERVICE_TOKEN,
        'Authorization': \`Bearer \${userToken}\`
      }
    }
  );

  return data.data;
}

// 3. Usage in your component
async function handleAssess() {
  const location = await Location.getCurrentPositionAsync();

  const result = await assessBuilding({
    location: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    },
    building: {
      structuralSystem: selectedSystem,
      numberOfStories: parseInt(stories),
      yearOfConstruction: parseInt(year),
      designRegulation: selectedRegulation
    }
  });

  setAssessmentResult(result);
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Apps Tab */}
          <TabsContent value="web" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <CardTitle>Web App Integration</CardTitle>
                </div>
                <CardDescription>
                  Essential APIs for web applications (React, Vue, Angular, Next.js)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Similar structure to Mobile but with web-specific examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Next.js / React Example</h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                    <code className="language-javascript">{`// Next.js API Route (/app/api/assess/route.js)
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  // 1. Issue user token
  const tokenResponse = await fetch('https://quakewise.com/api/v1/auth/issue-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Token': process.env.SERVICE_TOKEN_WEB_APP
    },
    body: JSON.stringify({
      userId: body.userId,
      appId: 'quakewise-web-app',
      tier: 'WEB_APP'
    })
  });

  const { data: tokenData } = await tokenResponse.json();

  // 2. Perform assessment
  const assessmentResponse = await fetch('https://quakewise.com/api/v1/assessment/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Platform-Token': process.env.SERVICE_TOKEN_WEB_APP,
      'Authorization': \`Bearer \${tokenData.token}\`
    },
    body: JSON.stringify(body.assessment)
  });

  const assessment = await assessmentResponse.json();

  return NextResponse.json(assessment);
}

// Client Component
'use client';

export default function AssessmentForm() {
  const [result, setResult] = useState(null);

  async function handleSubmit(formData) {
    const response = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.userId,
        assessment: formData
      })
    });

    const data = await response.json();
    setResult(data.data);
  }

  return (/* Your form UI */);
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full API Reference Tab */}
          <TabsContent value="reference">
            <Card>
              <CardHeader>
                <CardTitle>Complete API Reference</CardTitle>
                <CardDescription>
                  Interactive OpenAPI specification for all endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                {openApiSpec && <SwaggerUI spec={openApiSpec} />}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tester Tab */}
          <TabsContent value="tester">
            <ApiTester />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
