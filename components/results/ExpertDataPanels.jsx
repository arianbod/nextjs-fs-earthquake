'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Brain,
  MapPin,
  CloudRain,
  Building,
  Camera,
  FileText,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * CollapsiblePanel - Reusable collapsible section for expert data
 */
function CollapsiblePanel({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  iconColor = 'text-gray-500'
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5", iconColor)} />
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * DataRow - Simple key-value display
 */
function DataRow({ label, value, highlight = false }) {
  if (value === null || value === undefined || value === 'N/A' || value === '') {
    return null;
  }

  return (
    <div className={cn(
      "flex justify-between items-center py-2 px-3 rounded",
      highlight ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800"
    )}>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

/**
 * ExpertDataPanels - Collapsible sections for all technical data
 *
 * This contains all the detailed data that was previously overwhelming users.
 * Now hidden behind the Expert Mode toggle, organized in collapsible sections.
 */
export function ExpertDataPanels({
  userInput,
  safetyResult,
  imageGallery,
  className
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          Expert Analysis Data
        </h3>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Raw Data
        </Button>
      </div>

      {/* AI Analysis Panel */}
      {userInput?.aiAnalysisData && (
        <CollapsiblePanel
          title="AI Photo Analysis"
          icon={Brain}
          iconColor="text-purple-500"
        >
          <div className="space-y-2">
            <DataRow label="Structural System" value={userInput.structuralSystem} highlight />
            <DataRow label="Construction Period" value={userInput.constructionPeriod} />
            <DataRow label="Material Condition" value={userInput.materialCondition} />
            <DataRow label="AI Confidence" value={userInput.aiAnalysisData?.confidence} highlight />

            {userInput.aiAnalysisData?.aiInsights && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Visual Insights
                </h4>
                <div className="space-y-2">
                  {Object.entries(userInput.aiAnalysisData.aiInsights).map(([key, value]) => (
                    <div key={key} className="text-sm p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <span className="font-medium capitalize">{key}: </span>
                      <span className="text-gray-700 dark:text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsiblePanel>
      )}

      {/* Location & Seismic Panel */}
      <CollapsiblePanel
        title="Location & Seismic Data"
        icon={MapPin}
        iconColor="text-blue-500"
      >
        <div className="space-y-2">
          <DataRow label="Address" value={userInput?.address} />
          <DataRow label="Earthquake Zone" value={userInput?.typeOfEarthquake} highlight />
          <DataRow label="Soil Type" value={userInput?.typeOfSoil} />
          <DataRow
            label="Coordinates"
            value={userInput?.latitude && userInput?.longitude
              ? `${parseFloat(userInput.latitude).toFixed(4)}, ${parseFloat(userInput.longitude).toFixed(4)}`
              : null
            }
          />
        </div>
      </CollapsiblePanel>

      {/* Weather & Environmental Panel */}
      {userInput?.weatherData && (
        <CollapsiblePanel
          title="Weather & Environmental Data"
          icon={CloudRain}
          iconColor="text-cyan-500"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-600">
                  {userInput.weatherData?.rainfall?.total5Days || 'N/A'}mm
                </p>
                <p className="text-xs text-cyan-700 dark:text-cyan-300">Rainfall (5 days)</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600 uppercase">
                  {userInput.weatherData?.soilSaturationRisk || 'N/A'}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Soil Saturation Risk</p>
              </div>
            </div>

            {userInput.weatherData?.analysis && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {userInput.weatherData.analysis.description}
                </p>
              </div>
            )}
          </div>
        </CollapsiblePanel>
      )}

      {/* Building Technical Specs Panel */}
      <CollapsiblePanel
        title="Building Technical Specifications"
        icon={Building}
        iconColor="text-green-500"
      >
        <div className="space-y-2">
          <DataRow label="Year Built" value={userInput?.yearOfConstruction} />
          <DataRow label="Number of Stories" value={userInput?.numberOfStories} />
          <DataRow label="Basement Floors" value={userInput?.numberOfBasement || 'None'} />
          <DataRow label="Design Regulation" value={userInput?.designRegulation} />
          <DataRow label="Plan Shape" value={userInput?.planShape} />
          <DataRow label="Foundation Type" value={userInput?.foundationType} />
          <DataRow label="Roof Type" value={userInput?.roofType} />
          <DataRow label="Plan Irregularity" value={userInput?.planIrregularity} />
          <DataRow label="Vertical Irregularity" value={userInput?.verticalIrregularity} />
          <DataRow label="Adjacent Buildings" value={userInput?.adjacentBuildingRisk} />

          {/* Dimensions if available */}
          {(userInput?.buildingLength || userInput?.buildingWidth || userInput?.buildingHeight) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dimensions
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {userInput.buildingLength && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-bold text-green-600">{userInput.buildingLength}m</p>
                    <p className="text-xs text-gray-500">Length</p>
                  </div>
                )}
                {userInput.buildingWidth && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-bold text-blue-600">{userInput.buildingWidth}m</p>
                    <p className="text-xs text-gray-500">Width</p>
                  </div>
                )}
                {userInput.buildingHeight && (
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <p className="font-bold text-purple-600">{userInput.buildingHeight}m</p>
                    <p className="text-xs text-gray-500">Height</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CollapsiblePanel>

      {/* Comprehensive Plan Data Panel (if available) */}
      {userInput?.hasComprehensivePlanData && (
        <CollapsiblePanel
          title="Architectural Plan Analysis"
          icon={FileText}
          iconColor="text-indigo-500"
        >
          <div className="space-y-4">
            {/* Reinforcement Details */}
            {userInput.reinforcementDetails && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
                  Reinforcement Details
                </h4>
                <div className="space-y-2 text-sm">
                  {userInput.reinforcementDetails.columnRebar && (
                    <p><strong>Column:</strong> {userInput.reinforcementDetails.columnRebar}</p>
                  )}
                  {userInput.reinforcementDetails.beamRebar && (
                    <p><strong>Beam:</strong> {userInput.reinforcementDetails.beamRebar}</p>
                  )}
                </div>
              </div>
            )}

            {/* Grid System */}
            {userInput.gridSystem && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Grid System</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{userInput.gridSystem}</p>
              </div>
            )}

            {/* Technical Specs */}
            {userInput.technicalSpecs && (
              <div className="grid grid-cols-2 gap-2">
                <DataRow label="Structural System" value={userInput.technicalSpecs.structuralSystem} />
                <DataRow label="Foundation" value={userInput.technicalSpecs.foundationSystem} />
                <DataRow label="Concrete Grade" value={userInput.technicalSpecs.concreteGrade} />
                <DataRow label="Steel Grade" value={userInput.technicalSpecs.steelGrade} />
              </div>
            )}

            {/* Plan Quality */}
            {userInput.planQualityAssessment && (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="font-bold capitalize">{userInput.planQualityAssessment.imageClarity}</p>
                  <p className="text-xs text-gray-500">Image Clarity</p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="font-bold">{userInput.planQualityAssessment.completeness}%</p>
                  <p className="text-xs text-gray-500">Completeness</p>
                </div>
              </div>
            )}
          </div>
        </CollapsiblePanel>
      )}

      {/* Collected Images Panel */}
      {imageGallery && (
        <CollapsiblePanel
          title="All Collected Images"
          icon={Camera}
          iconColor="text-pink-500"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {imageGallery?.categories?.google?.images?.length || 0}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Google Maps Images</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {imageGallery?.categories?.user?.images?.length || 0}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300">Your Photos</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            Total storage: {imageGallery?.storageInfo?.sizeInMB || '0 MB'}
          </p>
        </CollapsiblePanel>
      )}

      {/* Calculation Methodology Panel */}
      <CollapsiblePanel
        title="Calculation Methodology"
        icon={FileText}
        iconColor="text-gray-500"
      >
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p>
            This assessment uses the <strong>Turkish Building Earthquake Code (TBDY-2018)</strong>
            and <strong>FEMA seismic safety guidelines</strong> to evaluate building vulnerability.
          </p>
          <div className="space-y-2">
            <DataRow label="Overall Score" value={`${safetyResult?.overallScore}%`} highlight />
            <DataRow label="Structural Integrity" value={`${safetyResult?.structuralIntegrity}%`} />
            <DataRow label="Raw Score" value={safetyResult?.rawScore} />
          </div>
          <p className="text-xs text-gray-500 italic">
            Factors considered: structural system type, building age, height, soil conditions,
            seismic zone, irregularities, and material condition.
          </p>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

export default ExpertDataPanels;
