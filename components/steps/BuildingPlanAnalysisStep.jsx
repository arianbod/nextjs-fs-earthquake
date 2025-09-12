import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileImage,
  Brain,
  Building,
  Eye,
  Ruler,
  Layers,
  ArrowRight,
  ArrowLeft,
  Info,
  Zap,
  FileCheck,
  Camera
} from 'lucide-react';
import { useUserInput } from '@/context/UserInputContext';

const BuildingPlanAnalysisStep = ({ onNext, onPrevious }) => {
  const { userInput, updateUserInput, storeUserImages } = useUserInput();
  const [uploadedPlans, setUploadedPlans] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');

  // Load existing data if available
  useEffect(() => {
    if (userInput.buildingPlanAnalysis) {
      setAnalysisResults(userInput.buildingPlanAnalysis);
    }
  }, [userInput.buildingPlanAnalysis]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    if (validFiles.length === 0) {
      alert('Please upload image files (JPG, PNG) or PDF files containing building plans.');
      return;
    }

    const newPlans = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      analyzed: false
    }));

    setUploadedPlans(prev => [...prev, ...newPlans]);

    // Store images in base64 format
    try {
      await storeUserImages(validFiles);
      console.log('Building plans stored successfully');
    } catch (error) {
      console.error('Failed to store building plans:', error);
    }
  }, [storeUserImages]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Remove uploaded plan
  const removePlan = (planId) => {
    setUploadedPlans(prev => {
      const updated = prev.filter(plan => plan.id !== planId);
      const planToRemove = prev.find(plan => plan.id === planId);
      if (planToRemove) {
        URL.revokeObjectURL(planToRemove.url);
      }
      return updated;
    });
  };

  // Analyze building plans
  const analyzePlans = async () => {
    if (uploadedPlans.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResults(null);

    try {
      // Progressive analysis stages
      const stages = [
        'Preprocessing plan images...',
        'Detecting building elements...',
        'Measuring dimensions...',
        'Analyzing structural layout...',
        'Identifying room layouts...',
        'Calculating building metrics...',
        'Generating analysis report...'
      ];

      // Progress simulation with stages
      for (let i = 0; i < stages.length; i++) {
        setAnalysisStage(stages[i]);
        setAnalysisProgress((i + 1) * (100 / stages.length));
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Prepare images for analysis
      const planImages = await Promise.all(
        uploadedPlans.map(async (plan) => ({
          name: plan.name,
          type: plan.type,
          base64: await fileToBase64(plan.file),
          planType: determinePlanType(plan.name)
        }))
      );

      // Call building plan analysis API
      const response = await fetch('/api/analyze-building-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: planImages,
          location: {
            latitude: userInput.latitude,
            longitude: userInput.longitude,
            city: userInput.city,
            earthquakeZone: userInput.earthquakeZone,
            soilType: userInput.soilType
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Plan analysis failed');
      }

      // Process and save results
      const planAnalysisData = {
        // Building dimensions from architectural plans
        dimensions: {
          length: result.analysis.dimensions?.length || null,
          width: result.analysis.dimensions?.width || null,
          height: result.analysis.dimensions?.height || null,
          totalArea: result.analysis.dimensions?.totalArea || null,
          builtUpArea: result.analysis.dimensions?.builtUpArea || null,
          source: 'ARCHITECTURAL_PLANS',
          confidence: result.confidence?.dimensions || 0.9
        },

        // Structural information from plans
        structural: {
          numberOfStories: result.analysis.structural?.stories || null,
          structuralSystem: result.analysis.structural?.system || null,
          columnLayout: result.analysis.structural?.columns || null,
          beamLayout: result.analysis.structural?.beams || null,
          wallConfiguration: result.analysis.structural?.walls || null,
          source: 'ARCHITECTURAL_PLANS',
          confidence: result.confidence?.structural || 0.8
        },

        // Room and space analysis
        spaces: {
          rooms: result.analysis.spaces?.rooms || [],
          totalRooms: result.analysis.spaces?.totalRooms || null,
          largestRoom: result.analysis.spaces?.largestRoom || null,
          planEfficiency: result.analysis.spaces?.efficiency || null,
          source: 'ARCHITECTURAL_PLANS',
          confidence: result.confidence?.spaces || 0.7
        },

        // Building characteristics inferred from plans
        characteristics: {
          buildingType: result.analysis.characteristics?.buildingType || null,
          constructionType: result.analysis.characteristics?.constructionType || null,
          designStandard: result.analysis.characteristics?.designStandard || null,
          planRegularity: result.analysis.characteristics?.planRegularity || 'regular',
          source: 'ARCHITECTURAL_PLANS',
          confidence: result.confidence?.characteristics || 0.7
        },

        // Technical specifications
        technical: {
          scale: result.analysis.technical?.scale || null,
          units: result.analysis.technical?.units || 'meters',
          planQuality: result.analysis.technical?.quality || 'good',
          readabilityScore: result.analysis.technical?.readability || 0.8
        },

        // Analysis metadata
        metadata: {
          analysisDate: new Date().toISOString(),
          planCount: uploadedPlans.length,
          planTypes: planImages.map(img => img.planType),
          processingTime: Date.now(),
          aiModel: 'claude-3.5-sonnet',
          version: '2.0'
        },

        // Overall confidence and recommendations
        summary: {
          overallConfidence: result.confidence?.overall || 0.8,
          dataQuality: result.analysis.dataQuality || 'good',
          recommendations: result.analysis.recommendations || [],
          nextSteps: [
            'Upload building exterior photos for structural verification',
            'Confirm structural system type',
            'Validate building dimensions'
          ]
        }
      };

      setAnalysisResults(planAnalysisData);

      // Update user input with plan analysis data
      updateUserInput({
        buildingPlanAnalysis: planAnalysisData,
        buildingPlanAnalyzed: true,
        
        // Pre-fill building data from plans
        buildingLength: planAnalysisData.dimensions.length,
        buildingWidth: planAnalysisData.dimensions.width,
        buildingHeight: planAnalysisData.dimensions.height,
        numberOfStories: planAnalysisData.structural.numberOfStories,
        buildingType: planAnalysisData.characteristics.buildingType,
        structuralSystem: planAnalysisData.structural.structuralSystem,
        planRegularity: planAnalysisData.characteristics.planRegularity,

        // Mark plans as analyzed
        planAnalysisComplete: true,
        planAnalysisDate: new Date().toISOString()
      });

      // Mark plans as analyzed
      setUploadedPlans(prev => prev.map(plan => ({
        ...plan,
        analyzed: true
      })));

      setAnalysisProgress(100);
      setAnalysisStage('Analysis complete!');

    } catch (error) {
      console.error('Error analyzing building plans:', error);
      setAnalysisResults({
        error: true,
        message: error.message || 'Failed to analyze building plans. Please try again.',
        recommendations: [
          'Ensure plans are clear and high-quality',
          'Try uploading different plan views',
          'Check file format (JPG, PNG, PDF supported)'
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Determine plan type from filename
  const determinePlanType = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('floor') || name.includes('plan')) return 'floor_plan';
    if (name.includes('section') || name.includes('elevation')) return 'section';
    if (name.includes('site') || name.includes('plot')) return 'site_plan';
    if (name.includes('foundation')) return 'foundation_plan';
    if (name.includes('roof')) return 'roof_plan';
    return 'architectural_plan';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
          <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Building Plan Analysis
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your building's architectural plans for precise structural analysis. 
          Our AI will extract dimensions, layout, and structural details from your plans.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload Building Plans
          </CardTitle>
          <CardDescription>
            Upload architectural plans, floor plans, or technical drawings (JPG, PNG, PDF)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FileImage className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop building plans here or click to upload
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supports JPG, PNG, PDF formats. Multiple plan sheets welcome.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('plan-upload').click()}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Choose Plan Files
              </Button>
              <input
                id="plan-upload"
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
          </div>

          {/* Plan Guidelines */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              📐 Plan Upload Guidelines for Best Results
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-300">
              <div>• Floor plans with dimensions</div>
              <div>• Structural layout drawings</div>
              <div>• Elevation/section views</div>
              <div>• Foundation plans (if available)</div>
              <div>• Clear, high-resolution images</div>
              <div>• Multiple plan sheets encouraged</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Plans */}
      {uploadedPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Uploaded Plans ({uploadedPlans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedPlans.map((plan) => (
                <div key={plan.id} className="relative group border border-gray-200 rounded-lg p-3">
                  {/* Plan Preview */}
                  <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                    {plan.type === 'application/pdf' ? (
                      <div className="flex items-center justify-center h-full">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={plan.url}
                        alt={plan.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Plan Info */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate" title={plan.name}>
                      {plan.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {(plan.size / 1024).toFixed(1)} KB
                      </Badge>
                      <Badge className={plan.analyzed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                        {plan.analyzed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Analyzed
                          </>
                        ) : (
                          'Ready'
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => removePlan(plan.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadedPlans.length} plan(s) ready for AI analysis
              </p>
              <Button
                onClick={analyzePlans}
                disabled={isAnalyzing || uploadedPlans.length === 0 || analysisResults}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Plans...
                  </>
                ) : analysisResults ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Analysis Complete
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Analyze Plans with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <h3 className="font-medium">AI Plan Analysis in Progress</h3>
                  <p className="text-sm text-gray-600">{analysisStage}</p>
                </div>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {analysisProgress}% Complete - This may take a few minutes for detailed analysis
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults && !analysisResults.error && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600" />
              Building Plan Analysis Results
              <Badge className="bg-green-100 text-green-800">
                {Math.round((analysisResults.summary?.overallConfidence || 0) * 100)}% Confidence
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-extracted building characteristics from your architectural plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Building Dimensions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium">Building Dimensions</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Length: <span className="font-medium">{analysisResults.dimensions?.length || 'N/A'} m</span></div>
                  <div>Width: <span className="font-medium">{analysisResults.dimensions?.width || 'N/A'} m</span></div>
                  <div>Height: <span className="font-medium">{analysisResults.dimensions?.height || 'N/A'} m</span></div>
                  <div>Total Area: <span className="font-medium">{analysisResults.dimensions?.totalArea || 'N/A'} m²</span></div>
                </div>
              </div>

              {/* Structural Information */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  <h4 className="font-medium">Structural Details</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Stories: <span className="font-medium">{analysisResults.structural?.numberOfStories || 'N/A'}</span></div>
                  <div>System: <span className="font-medium">{analysisResults.structural?.structuralSystem || 'N/A'}</span></div>
                  <div>Plan Type: <span className="font-medium">{analysisResults.characteristics?.planRegularity || 'Regular'}</span></div>
                </div>
              </div>

              {/* Building Characteristics */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Building Type</h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Type: <span className="font-medium">{analysisResults.characteristics?.buildingType || 'N/A'}</span></div>
                  <div>Construction: <span className="font-medium">{analysisResults.characteristics?.constructionType || 'N/A'}</span></div>
                  <div>Total Rooms: <span className="font-medium">{analysisResults.spaces?.totalRooms || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Analysis Complete - Next Steps</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Your building plans have been analyzed successfully. In the next step, you'll upload exterior photos 
                    to verify and complement this structural data.
                  </p>
                  <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                    {analysisResults.summary?.nextSteps?.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Results */}
      {analysisResults?.error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Analysis Failed:</strong> {analysisResults.message}
                <ul className="mt-2 list-disc list-inside text-sm">
                  {analysisResults.recommendations?.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={onNext} 
          disabled={!analysisResults || analysisResults.error}
          className="gap-2"
        >
          Next: Upload Building Photos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BuildingPlanAnalysisStep;