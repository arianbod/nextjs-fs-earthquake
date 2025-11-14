'use client';

/**
 * API Documentation Page
 * Internal documentation for QuakeWise team members only
 * Requires Clerk authentication with @quakewise.com email
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
import { InfoIcon, KeyIcon, ZapIcon, ShieldIcon, BookOpenIcon, LockIcon } from 'lucide-react';
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
              <ShieldIcon className="h-6 w-6 text-red-600" />
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
                Access is restricted to @quakewise.com email addresses registered in the team whitelist.
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">QuakeWise Internal API</h1>
            <p className="text-xl text-blue-100 mb-6">
              Internal microservices API for QuakeWise team members
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-white text-blue-800 hover:bg-blue-50">
                v1.1.0
              </Badge>
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                REST API
              </Badge>
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                Internal Only
              </Badge>
              <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                Authenticated: {userEmail}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <KeyIcon className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Service tokens + JWT for end users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <ZapIcon className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tiered limits: 500-10,000 requests/hour by service tier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <ShieldIcon className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Industry-standard security with JWT tokens and HTTPS
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <BookOpenIcon className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Well Documented</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Complete OpenAPI spec with interactive testing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Documentation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reference">API Reference</TabsTrigger>
            <TabsTrigger value="tester">API Tester</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to integrate QuakeWise API into your application
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>1. Get Service Tokens</h3>
                <p>Retrieve service tokens from team password manager (1Password/Vault):</p>
                <ul>
                  <li><strong>Service Token:</strong> Pre-registered token for your internal service</li>
                  <li><strong>Service ID:</strong> quakewise-web-app, quakewise-mobile-api, etc.</li>
                  <li><strong>Tier:</strong> WEB_APP, BATCH_JOB, or DEV_TESTING</li>
                </ul>

                <h3>2. Issue User Tokens</h3>
                <p>For each user session, obtain a JWT token:</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto">
{`POST /api/v1/auth/issue-token
Headers:
  X-Platform-Token: $SERVICE_TOKEN_WEB_APP

Body:
{
  "userId": "clerk_user_123",
  "appId": "quakewise-web-app",
  "tier": "WEB_APP"
}`}
                </pre>

                <h3>3. Make Assessment Requests</h3>
                <p>Use both tokens to perform building assessments:</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto">
{`POST /api/v1/assessment/complete
Headers:
  X-Platform-Token: your_platform_token
  Authorization: Bearer user_jwt_token

Body:
{
  "location": { "latitude": 41.0082, "longitude": 28.9784 },
  "building": {
    "structuralSystem": "C2",
    "numberOfStories": 5,
    "yearOfConstruction": 2010,
    "designRegulation": "2007-2018"
  }
}`}
                </pre>

                <Alert className="mt-6">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Base URL</AlertTitle>
                  <AlertDescription>
                    Production: <code>https://quakewise.com/api/v1</code><br />
                    Development: <code>http://localhost:3000/api/v1</code>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits & Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tier</th>
                        <th className="text-left p-2">Requests/Hour</th>
                        <th className="text-left p-2">Requests/Day</th>
                        <th className="text-left p-2">Features</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-semibold">WEB_APP</td>
                        <td className="p-2">10,000</td>
                        <td className="p-2">100,000</td>
                        <td className="p-2">Web & mobile apps (quakewise-web-app, quakewise-mobile-api)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-semibold">BATCH_JOB</td>
                        <td className="p-2">1,000</td>
                        <td className="p-2">50,000</td>
                        <td className="p-2">Background processing (batch-assessment-processor, analytics-service)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">DEV_TESTING</td>
                        <td className="p-2">500</td>
                        <td className="p-2">5,000</td>
                        <td className="p-2">Development & testing environments (dev-testing-service)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="reference">
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>
                  Complete OpenAPI 3.0 specification with interactive examples
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

          {/* Code Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Sample code in different programming languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">JavaScript / Node.js</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-sm">
{`const axios = require('axios');

const SERVICE_TOKEN = process.env.SERVICE_TOKEN_WEB_APP;
const BASE_URL = 'https://quakewise.com/api/v1';

// 1. Issue user token
async function getUserToken(clerkUserId) {
  const response = await axios.post(
    \`\${BASE_URL}/auth/issue-token\`,
    {
      userId: clerkUserId,
      appId: 'quakewise-web-app',
      tier: 'WEB_APP'
    },
    {
      headers: { 'X-Platform-Token': SERVICE_TOKEN }
    }
  );
  return response.data.data.token;
}

// 2. Perform assessment
async function assessBuilding(userToken, buildingData) {
  const response = await axios.post(
    \`\${BASE_URL}/assessment/complete\`,
    buildingData,
    {
      headers: {
        'X-Platform-Token': SERVICE_TOKEN,
        'Authorization': \`Bearer \${userToken}\`
      }
    }
  );
  return response.data.data;
}

// Usage
(async () => {
  const token = await getUserToken('clerk_user_123');
  const assessment = await assessBuilding(token, {
    location: { latitude: 41.0082, longitude: 28.9784 },
    building: {
      structuralSystem: 'C2',
      numberOfStories: 5,
      yearOfConstruction: 2010,
      designRegulation: '2007-2018'
    }
  });
  console.log('Safety Score:', assessment.safetyScore.overall);
})();`}
                  </pre>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Python</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-sm">
{`import requests
import os

SERVICE_TOKEN = os.getenv('SERVICE_TOKEN_WEB_APP')
BASE_URL = 'https://quakewise.com/api/v1'

def get_user_token(clerk_user_id):
    response = requests.post(
        f'{BASE_URL}/auth/issue-token',
        json={
            'userId': clerk_user_id,
            'appId': 'quakewise-web-app',
            'tier': 'WEB_APP'
        },
        headers={'X-Platform-Token': SERVICE_TOKEN}
    )
    return response.json()['data']['token']

def assess_building(user_token, building_data):
    response = requests.post(
        f'{BASE_URL}/assessment/complete',
        json=building_data,
        headers={
            'X-Platform-Token': SERVICE_TOKEN,
            'Authorization': f'Bearer {user_token}'
        }
    )
    return response.json()['data']

# Usage
token = get_user_token('clerk_user_123')
assessment = assess_building(token, {
    'location': {'latitude': 41.0082, 'longitude': 28.9784},
    'building': {
        'structuralSystem': 'C2',
        'numberOfStories': 5,
        'yearOfConstruction': 2010,
        'designRegulation': '2007-2018'
    }
})
print(f"Safety Score: {assessment['safetyScore']['overall']}")`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
