import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowLeft,
  Eye,
  Brain,
  MapPin,
  Camera,
  Building,
  Ruler,
  Calendar,
  Shield,
  Zap,
  FileCheck
} from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';
import { dataConsistencyManager } from '@/lib/dataConsistencyManager';
import ImageGallery from '@/components/ImageGallery';

const FinalReviewStep = ({ onNext, onPrevious }) => {
  const { userInput, getImageGallery } = useUserInput();
  const [validationResults, setValidationResults] = useState(null);
  const [finalData, setFinalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Perform final validation and prepare unified data
    const performFinalValidation = () => {
      console.log('Performing final validation of assessment data');

      // Get final unified data
      const unifiedData = dataConsistencyManager.getFinalResultsData();
      setFinalData(unifiedData);

      // Validate data completeness and consistency
      const validation = validateAssessmentData(unifiedData);
      setValidationResults(validation);

      setLoading(false);
    };

    performFinalValidation();
  }, [userInput]);

  const validateAssessmentData = (data) => {
    const validation = {
      isComplete: true,
      isConsistent: true,
      errors: [],
      warnings: [],
      summary: {}
    };

    // Check data completeness
    const requiredFields = [
      { field: 'dimensions.length', label: 'Building Length', value: data.dimensions?.length },
      { field: 'dimensions.width', label: 'Building Width', value: data.dimensions?.width },
      { field: 'dimensions.stories', label: 'Number of Stories', value: data.dimensions?.stories },
      { field: 'building.type', label: 'Building Type', value: data.building?.type },
      { field: 'building.structuralSystem', label: 'Structural System', value: data.building?.structuralSystem },
      { field: 'location.earthquakeZone', label: 'Earthquake Zone', value: data.location?.earthquakeZone },
      { field: 'location.soilType', label: 'Soil Type', value: data.location?.soilType }
    ];

    requiredFields.forEach(field => {
      if (!field.value) {
        validation.errors.push(`${field.label} is missing`);
        validation.isComplete = false;
      }
    });

    // Check data consistency
    const auditTrail = dataConsistencyManager.getAuditTrail();
    if (auditTrail.inconsistencies.length > 0) {
      validation.warnings.push(`${auditTrail.inconsistencies.length} data inconsistencies were detected and may affect accuracy`);
    }

    // Generate summary
    validation.summary = {
      totalDataPoints: requiredFields.length,
      completedDataPoints: requiredFields.filter(f => f.value).length,
      confidenceScore: data.quality?.confidence?.overall || 0,
      dataSources: data.quality?.sources || [],
      imagesCollected: getImageGallery().totalImages
    };

    return validation;
  };

  const handleConfirmData = () => {
    setConfirmed(true);
    // Update user input with final unified data to ensure consistency
    const consistentData = dataConsistencyManager.getFinalResultsData();
    console.log('Final confirmed data:', consistentData);
  };

  const renderDataSummaryCard = (title, icon, data, confidence = 1.0) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
          <Badge variant={confidence >= 0.8 ? 'default' : confidence >= 0.6 ? 'secondary' : 'outline'}>
            {Math.round(confidence * 100)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key}:</span>
              <span className="font-medium">{value || 'Not specified'}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <h3 className="text-lg font-medium">Validating Assessment Data</h3>
              <p className="text-sm text-gray-600">Performing final consistency checks...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full mb-4">
          <FileCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Final Review & Confirmation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Review all collected data before generating your earthquake safety assessment
        </p>
      </div>

      {/* Validation Status */}
      <Card className={`border-2 ${validationResults?.isComplete && validationResults?.isConsistent ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {validationResults?.isComplete && validationResults?.isConsistent ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
            Data Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {validationResults?.summary.completedDataPoints}/{validationResults?.summary.totalDataPoints}
              </div>
              <p className="text-xs text-gray-600">Data Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((validationResults?.summary.confidenceScore || 0) * 100)}%
              </div>
              <p className="text-xs text-gray-600">AI Confidence</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {validationResults?.summary.imagesCollected || 0}
              </div>
              <p className="text-xs text-gray-600">Images</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {validationResults?.summary.dataSources?.length || 0}
              </div>
              <p className="text-xs text-gray-600">Data Sources</p>
            </div>
          </div>

          {validationResults?.errors.length > 0 && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Errors Found:</strong>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {validationResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationResults?.warnings.length > 0 && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings:</strong>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {validationResults.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="h-4 w-4" />
            Data Sources: {validationResults?.summary.dataSources?.join(', ')}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Building Dimensions */}
        {renderDataSummaryCard(
          'Building Dimensions',
          <Ruler className="h-4 w-4 text-blue-600" />,
          {
            'Length': `${finalData?.dimensions?.length || 'N/A'} m`,
            'Width': `${finalData?.dimensions?.width || 'N/A'} m`,
            'Height': `${finalData?.dimensions?.height || 'N/A'} m`,
            'Stories': finalData?.dimensions?.stories || 'N/A',
            'Area': finalData?.dimensions?.area ? `${finalData.dimensions.area} m²` : 'N/A'
          },
          finalData?.quality?.confidence?.dimensions
        )}

        {/* Building Type */}
        {renderDataSummaryCard(
          'Building Characteristics',
          <Building className="h-4 w-4 text-green-600" />,
          {
            'Type': finalData?.building?.type || 'N/A',
            'Material': finalData?.building?.materialType || 'N/A',
            'Structural System': finalData?.building?.structuralSystem || 'N/A',
            'Construction Year': finalData?.building?.constructionYear || 'N/A'
          },
          finalData?.quality?.confidence?.buildingType
        )}

        {/* Location Data */}
        {renderDataSummaryCard(
          'Location & Seismic',
          <MapPin className="h-4 w-4 text-purple-600" />,
          {
            'City': finalData?.location?.city || 'N/A',
            'Earthquake Zone': finalData?.location?.earthquakeZone || 'N/A',
            'Soil Type': finalData?.location?.soilType || 'N/A',
            'Coordinates': finalData?.location?.coordinates ? 
              `${finalData.location.coordinates.latitude?.toFixed(4)}, ${finalData.location.coordinates.longitude?.toFixed(4)}` : 'N/A'
          },
          finalData?.quality?.confidence?.location
        )}

        {/* Structural Assessment */}
        {renderDataSummaryCard(
          'Structural Assessment',
          <Shield className="h-4 w-4 text-orange-600" />,
          {
            'Plan Irregularity': finalData?.structural?.irregularities?.plan || 'Regular',
            'Vertical Irregularity': finalData?.structural?.irregularities?.vertical || 'Regular',
            'Soft Story': finalData?.structural?.softStory ? 'Yes' : 'No',
            'Condition': finalData?.structural?.condition || 'Good'
          },
          finalData?.quality?.confidence?.structural
        )}

        {/* Images Summary */}
        {renderDataSummaryCard(
          'Images Collected',
          <Camera className="h-4 w-4 text-cyan-600" />,
          {
            'Google Images': getImageGallery().categories.google.images.length,
            'Your Photos': getImageGallery().categories.user.images.length,
            'Total Images': getImageGallery().totalImages,
            'Storage Size': getImageGallery().storageInfo.sizeInMB
          },
          1.0
        )}

        {/* AI Analysis Summary */}
        {renderDataSummaryCard(
          'AI Analysis Quality',
          <Brain className="h-4 w-4 text-indigo-600" />,
          {
            'Overall Confidence': `${Math.round((finalData?.quality?.confidence?.overall || 0) * 100)}%`,
            'Data Sources': finalData?.quality?.sources?.length || 0,
            'Last Updated': finalData?.quality?.lastUpdated ? 
              new Date(finalData.quality.lastUpdated).toLocaleString() : 'N/A',
            'Status': validationResults?.isComplete ? 'Complete' : 'Incomplete'
          },
          finalData?.quality?.confidence?.overall
        )}
      </div>

      {/* Image Gallery Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Images Used in Analysis
          </CardTitle>
          <CardDescription>
            All images that contributed to your building assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGallery 
            imageGallery={getImageGallery()} 
            showTitle={false} 
            compact={true}
            className="border-0 shadow-none"
          />
        </CardContent>
      </Card>

      {/* Confirmation */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">Ready to Generate Results</h3>
              <p className="text-sm text-blue-800 mb-4">
                All data has been collected and validated. Your earthquake safety assessment will be generated using:
                AI-analyzed building characteristics, location-specific seismic data, and environmental factors.
              </p>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="confirm-data"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="confirm-data" className="text-sm font-medium text-blue-900">
                  I confirm that the data above is accurate and complete
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Review
        </Button>
        
        <Button 
          onClick={() => {
            handleConfirmData();
            onNext();
          }}
          disabled={!confirmed || (validationResults && (!validationResults.isComplete || validationResults.errors.length > 0))}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          Generate Safety Assessment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FinalReviewStep;