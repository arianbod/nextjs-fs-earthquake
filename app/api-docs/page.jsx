'use client';

/**
 * API Documentation Page
 * Comprehensive interactive documentation for QuakeWise External API
 */

import { useState, useEffect } from 'react';
import SwaggerUI from '@/components/api-docs/SwaggerUI';
import ApiTester from '@/components/api-docs/ApiTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, KeyIcon, ZapIcon, ShieldIcon, BookOpenIcon } from 'lucide-react';

export default function ApiDocsPage() {
  const [openApiSpec, setOpenApiSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <h1 className="text-4xl font-bold mb-4">QuakeWise External API</h1>
            <p className="text-xl text-blue-100 mb-6">
              Comprehensive earthquake safety assessment API for developers
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-white text-blue-800 hover:bg-blue-50">
                v1.0.0
              </Badge>
              <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                REST API
              </Badge>
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                Production Ready
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
                Dual authentication: Platform token + JWT for end users
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
                Tiered limits: 100-10,000 requests/hour based on plan
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
                <h3>1. Obtain API Credentials</h3>
                <p>Contact us to receive your platform authentication token:</p>
                <ul>
                  <li><strong>Platform Token:</strong> Static token for your application</li>
                  <li><strong>App ID:</strong> Unique identifier for your app</li>
                  <li><strong>Rate Limit Tier:</strong> Free, Pro, or Enterprise</li>
                </ul>

                <h3>2. Issue User Tokens</h3>
                <p>For each user session, obtain a JWT token:</p>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto">
{`POST /api/v1/auth/issue-token
Headers:
  X-Platform-Token: your_platform_token

Body:
{
  "userId": "user_123",
  "appId": "your-app-id",
  "tier": "pro"
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
                        <td className="p-2 font-semibold">Free</td>
                        <td className="p-2">100</td>
                        <td className="p-2">1,000</td>
                        <td className="p-2">Basic assessment, Safety calculation</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-semibold">Pro</td>
                        <td className="p-2">1,000</td>
                        <td className="p-2">10,000</td>
                        <td className="p-2">+ AI analysis, Location intelligence</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">Enterprise</td>
                        <td className="p-2">10,000</td>
                        <td className="p-2">100,000</td>
                        <td className="p-2">+ Priority support, Custom features</td>
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

const PLATFORM_TOKEN = 'your_platform_token';
const BASE_URL = 'https://quakewise.com/api/v1';

// 1. Issue user token
async function getUserToken(userId) {
  const response = await axios.post(
    \`\${BASE_URL}/auth/issue-token\`,
    {
      userId: userId,
      appId: 'my-app',
      tier: 'pro'
    },
    {
      headers: { 'X-Platform-Token': PLATFORM_TOKEN }
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
        'X-Platform-Token': PLATFORM_TOKEN,
        'Authorization': \`Bearer \${userToken}\`
      }
    }
  );
  return response.data.data;
}

// Usage
(async () => {
  const token = await getUserToken('user_123');
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

PLATFORM_TOKEN = 'your_platform_token'
BASE_URL = 'https://quakewise.com/api/v1'

def get_user_token(user_id):
    response = requests.post(
        f'{BASE_URL}/auth/issue-token',
        json={
            'userId': user_id,
            'appId': 'my-app',
            'tier': 'pro'
        },
        headers={'X-Platform-Token': PLATFORM_TOKEN}
    )
    return response.json()['data']['token']

def assess_building(user_token, building_data):
    response = requests.post(
        f'{BASE_URL}/assessment/complete',
        json=building_data,
        headers={
            'X-Platform-Token': PLATFORM_TOKEN,
            'Authorization': f'Bearer {user_token}'
        }
    )
    return response.json()['data']

# Usage
token = get_user_token('user_123')
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
