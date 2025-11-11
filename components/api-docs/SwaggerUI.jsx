'use client';

/**
 * Swagger UI Component
 * Renders interactive API documentation using Swagger UI
 */

import { useEffect, useRef } from 'react';

export default function SwaggerUI({ spec }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamically import Swagger UI to avoid SSR issues
    if (typeof window !== 'undefined') {
      import('swagger-ui-react').then((SwaggerUIComponent) => {
        const SwaggerUI = SwaggerUIComponent.default;

        // Render Swagger UI
        if (containerRef.current && !containerRef.current.children.length) {
          const root = document.createElement('div');
          containerRef.current.appendChild(root);

          // Use React 18's createRoot if available
          import('react-dom/client').then(({ createRoot }) => {
            const reactRoot = createRoot(root);
            reactRoot.render(
              <SwaggerUI
                spec={spec}
                deepLinking={true}
                displayRequestDuration={true}
                filter={true}
                showExtensions={true}
                showCommonExtensions={true}
                tryItOutEnabled={true}
                requestInterceptor={(req) => {
                  console.log('API Request:', req);
                  return req;
                }}
                responseInterceptor={(res) => {
                  console.log('API Response:', res);
                  return res;
                }}
              />
            );
          });
        }
      }).catch((error) => {
        console.error('Failed to load Swagger UI:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-8 bg-red-50 border border-red-200 rounded-lg">
              <h3 class="text-lg font-semibold text-red-800 mb-2">Failed to Load API Documentation</h3>
              <p class="text-red-600">Please install swagger-ui-react:</p>
              <code class="block mt-2 p-2 bg-red-100 rounded">npm install swagger-ui-react</code>
            </div>
          `;
        }
      });
    }
  }, [spec]);

  return (
    <div className="swagger-container">
      <style jsx global>{`
        .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .swagger-ui .topbar {
          display: none;
        }

        .swagger-ui .info {
          margin: 20px 0;
        }

        .swagger-ui .scheme-container {
          background: #fafafa;
          padding: 15px;
          border-radius: 8px;
        }

        .swagger-ui .opblock {
          border-radius: 8px;
          margin: 15px 0;
        }

        .swagger-ui .opblock-tag {
          font-size: 18px;
          font-weight: 600;
        }

        .swagger-ui .btn {
          border-radius: 6px;
        }

        .swagger-ui .response-col_status {
          font-weight: 600;
        }
      `}</style>

      <div ref={containerRef} className="mt-8" />
    </div>
  );
}
