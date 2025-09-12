import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  Layers,
  Ruler,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Brain,
  Eye,
  Info,
  Settings,
  Home,
  Zap
} from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';
import { dataConsistencyManager } from '@/lib/dataConsistencyManager';
import { intelligentDefaults } from '@/lib/intelligentDefaults';

const SmartBuildingReviewStep = ({ onNext, onPrevious }) => {
  const { userInput, updateUserInput } = useUserInput();
  const [smartDefaults, setSmartDefaults] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [inconsistencies, setInconsistencies] = useState([]);
  const [confidence, setConfidence] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize smart defaults and data consistency
    const initializeSmartData = () => {
      console.log('Initializing smart building review with userInput:', userInput);

      // Set master data from AI analysis
      dataConsistencyManager.setMasterData(
        userInput.aiAnalysisData,
        {
          latitude: userInput.latitude,
          longitude: userInput.longitude,
          city: userInput.city,
          earthquakeZone: userInput.earthquakeZone,
          soilType: userInput.soilType
        },
        userInput.environmentalData
      );

      // Generate intelligent defaults
      const defaults = intelligentDefaults.generateDefaults(userInput);
      setSmartDefaults(defaults);

      // Get confidence scores
      setConfidence(dataConsistencyManager.getConfidenceScores());

      // Get consistent data
      const consistentData = dataConsistencyManager.getConsistentData('SmartBuildingReview');
      
      // Update user input with consistent data (but don't overwrite user modifications)
      updateUserInput(prev => ({
        ...prev,
        // Use consistent data as defaults, but preserve any existing user modifications
        buildingLength: prev.buildingLength || consistentData.buildingLength,
        buildingWidth: prev.buildingWidth || consistentData.buildingWidth,
        buildingHeight: prev.buildingHeight || consistentData.buildingHeight,
        numberOfStories: prev.numberOfStories || consistentData.numberOfStories,
        buildingType: prev.buildingType || consistentData.buildingType,
        structuralSystem: prev.structuralSystem || consistentData.structuralSystem,
        yearOfConstruction: prev.yearOfConstruction || consistentData.yearOfConstruction,
        designRegulation: prev.designRegulation || consistentData.designRegulation,
      }));

      setLoading(false);
    };

    if (userInput.aiAnalysisData) {
      initializeSmartData();
    } else {
      console.warn('No AI analysis data available for smart defaults');
      setLoading(false);
    }
  }, [userInput.aiAnalysisData]);

  // Check for data inconsistencies when form values change
  useEffect(() => {
    if (userInput && smartDefaults) {
      const detected = dataConsistencyManager.detectInconsistencies(userInput, 'SmartBuildingReview');
      setInconsistencies(detected);
    }
  }, [userInput, smartDefaults]);

  const handleFieldEdit = (field, value) => {
    updateUserInput({ [field]: value });
    dataConsistencyManager.updateData(field, value, 'USER_EDIT');
    setEditMode({ ...editMode, [field]: false });
  };

  const useAIValue = (field, aiValue) => {
    handleFieldEdit(field, aiValue);
  };

  const toggleEditMode = (field) => {
    setEditMode({ ...editMode, [field]: !editMode[field] });
  };

  const getConfidenceColor = (confidenceScore) => {
    if (confidenceScore >= 0.8) return 'text-green-600 bg-green-50';
    if (confidenceScore >= 0.6) return 'text-blue-600 bg-blue-50';
    if (confidenceScore >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceText = (confidenceScore) => {
    if (confidenceScore >= 0.8) return 'High Confidence';
    if (confidenceScore >= 0.6) return 'Good Confidence';
    if (confidenceScore >= 0.4) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  const renderSmartField = (field, label, value, aiValue, description, icon, confidenceScore = 0.8) => {
    const isEditing = editMode[field];
    const hasInconsistency = inconsistencies.some(inc => inc.field === field);

    return (
      <Card className={`transition-all duration-200 ${hasInconsistency ? 'border-orange-200 bg-orange-50/50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <CardTitle className="text-sm">{label}</CardTitle>
                {description && (
                  <CardDescription className="text-xs">{description}</CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getConfidenceColor(confidenceScore)}>
                {getConfidenceText(confidenceScore)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEditMode(field)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type={typeof value === 'number' ? 'number' : 'text'}
                value={value || ''}
                onChange={(e) => handleFieldEdit(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode({ ...editMode, [field]: false })}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setEditMode({ ...editMode, [field]: false })}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">
                  {value || 'Not specified'}
                </span>
                {confidenceScore >= 0.6 && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              {hasInconsistency && aiValue !== value && (
                <Alert className="py-2">
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    AI detected: <strong>{aiValue}</strong>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto ml-2 text-blue-600"
                      onClick={() => useAIValue(field, aiValue)}
                    >
                      Use AI Value
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <h3 className="text-lg font-medium">Preparing Smart Review</h3>
              <p className="text-sm text-gray-600">Analyzing AI data and generating intelligent defaults...</p>
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
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-4">
          <Brain className="h-10 w-10 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Smart Building Review
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Review AI-detected building characteristics. All values are pre-filled with intelligent defaults based on your photos.
        </p>
      </div>

      {/* Overall Confidence Score */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI Analysis Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getConfidenceColor(confidence.dimensions)}`}>
                <Ruler className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mt-2">Dimensions</p>
              <p className="text-xs text-gray-600">{Math.round((confidence.dimensions || 0) * 100)}%</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getConfidenceColor(confidence.buildingType)}`}>
                <Building className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mt-2">Building Type</p>
              <p className="text-xs text-gray-600">{Math.round((confidence.buildingType || 0) * 100)}%</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getConfidenceColor(confidence.structural)}`}>
                <Layers className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mt-2">Structure</p>
              <p className="text-xs text-gray-600">{Math.round((confidence.structural || 0) * 100)}%</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getConfidenceColor(confidence.overall)}`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mt-2">Overall</p>
              <p className="text-xs text-gray-600">{Math.round((confidence.overall || 0) * 100)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Inconsistency Alert */}
      {inconsistencies.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Inconsistencies Detected:</strong> {inconsistencies.length} field(s) differ from AI analysis. 
            Review the highlighted fields below and choose between AI values or your modifications.
          </AlertDescription>
        </Alert>
      )}

      {/* Building Review Tabs */}
      <Tabs defaultValue="dimensions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dimensions" className="gap-1">
            <Ruler className="h-4 w-4" />
            Dimensions
          </TabsTrigger>
          <TabsTrigger value="building" className="gap-1">
            <Building className="h-4 w-4" />
            Building Type
          </TabsTrigger>
          <TabsTrigger value="structural" className="gap-1">
            <Layers className="h-4 w-4" />
            Structure
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-1">
            <Settings className="h-4 w-4" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Dimensions Tab */}
        <TabsContent value="dimensions" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {renderSmartField(
              'buildingLength',
              'Building Length',
              userInput.buildingLength,
              userInput.aiAnalysisData?.dimensions?.length,
              'Length of the building in meters',
              <Ruler className="h-4 w-4 text-blue-600" />,
              confidence.dimensions
            )}
            
            {renderSmartField(
              'buildingWidth',
              'Building Width',
              userInput.buildingWidth,
              userInput.aiAnalysisData?.dimensions?.width,
              'Width of the building in meters',
              <Ruler className="h-4 w-4 text-blue-600" />,
              confidence.dimensions
            )}
            
            {renderSmartField(
              'numberOfStories',
              'Number of Stories',
              userInput.numberOfStories,
              userInput.aiAnalysisData?.numberOfStories,
              'Total number of floors including ground floor',
              <Building className="h-4 w-4 text-blue-600" />,
              confidence.dimensions
            )}
            
            {renderSmartField(
              'buildingHeight',
              'Building Height',
              userInput.buildingHeight,
              userInput.aiAnalysisData?.dimensions?.height,
              'Total height of the building in meters',
              <Ruler className="h-4 w-4 text-blue-600" />,
              confidence.dimensions
            )}
          </div>
        </TabsContent>

        {/* Building Type Tab */}
        <TabsContent value="building" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {renderSmartField(
              'buildingType',
              'Building Type',
              userInput.buildingType,
              userInput.aiAnalysisData?.buildingType,
              'Primary function and type of building',
              <Home className="h-4 w-4 text-green-600" />,
              confidence.buildingType
            )}
            
            {renderSmartField(
              'materialType',
              'Construction Material',
              userInput.materialType,
              userInput.aiAnalysisData?.materialType,
              'Primary construction material',
              <Building className="h-4 w-4 text-green-600" />,
              confidence.buildingType
            )}
            
            {renderSmartField(
              'yearOfConstruction',
              'Construction Year',
              userInput.yearOfConstruction,
              userInput.aiAnalysisData?.constructionYear,
              'Year when building was constructed',
              <Calendar className="h-4 w-4 text-green-600" />,
              confidence.construction
            )}
            
            {renderSmartField(
              'designRegulation',
              'Design Code',
              userInput.designRegulation,
              userInput.aiAnalysisData?.designRegulation,
              'Building design regulation/code used',
              <Eye className="h-4 w-4 text-green-600" />,
              confidence.construction
            )}
          </div>
        </TabsContent>

        {/* Structural Tab */}
        <TabsContent value="structural" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {renderSmartField(
              'structuralSystem',
              'Structural System',
              userInput.structuralSystem,
              userInput.aiAnalysisData?.structuralSystem,
              'Primary structural load-bearing system',
              <Layers className="h-4 w-4 text-purple-600" />,
              confidence.structural
            )}
            
            {/* Add irregularity, soft story, and other structural characteristics */}
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Add specific conditions, extra loads, neighbor buildings, etc. */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button onClick={onNext} className="gap-2">
          Continue to Review
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SmartBuildingReviewStep;