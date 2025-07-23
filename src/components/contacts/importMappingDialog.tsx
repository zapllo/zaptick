import { useState, useEffect } from 'react';
import { X, Upload, Check, Info, UploadCloud, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Field {
    key: string;
    label: string;
    required: boolean;
    type?: string;
}

interface ImportMappingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportComplete: () => void;
    wabaId: string;
}

export default function ImportMappingDialog({ open, onOpenChange, onImportComplete, wabaId }: ImportMappingDialogProps) {
    console.log("ImportMappingDialog rendered with open:", open, "wabaId:", wabaId);
    const [file, setFile] = useState<File | null>(null);
    const [availableFields, setAvailableFields] = useState<Field[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
    const [sampleData, setSampleData] = useState<any[]>([]);
    const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
    const [skipFirstRow, setSkipFirstRow] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [importProgress, setImportProgress] = useState(0);
    const [importResults, setImportResults] = useState<any>(null);
    const { toast } = useToast();

    // Fetch available fields for mapping when dialog opens
    useEffect(() => {
        if (open) {
            fetchAvailableFields();
        } else {
            // Reset state when dialog closes
            setFile(null);
            setCsvHeaders([]);
            setFieldMappings({});
            setSampleData([]);
            setStep('upload');
            setSkipFirstRow(false);
            setTotalRows(0);
            setImportProgress(0);
            setImportResults(null);
        }
    }, [open]);

    const fetchAvailableFields = async () => {
        try {
            const response = await fetch('/api/contacts/import');
            const data = await response.json();

            if (data.success) {
                setAvailableFields(data.fields);

                // Initialize mappings for required fields
                const initialMappings: Record<string, string> = {};
                data.fields.forEach((field: Field) => {
                    if (field.required) {
                        initialMappings[field.key] = '';
                    }
                });
                setFieldMappings(initialMappings);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch field options",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching fields:', error);
            toast({
                title: "Error",
                description: "Failed to fetch field options",
                variant: "destructive",
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Reset other states
            setCsvHeaders([]);
            setSampleData([]);
            setFieldMappings(prevMappings => {
                // Keep required fields, reset values
                const newMappings: Record<string, string> = {};
                Object.keys(prevMappings).forEach(key => {
                    if (availableFields.find(f => f.key === key && f.required)) {
                        newMappings[key] = '';
                    }
                });
                return newMappings;
            });
        }
    };

    const analyzeFile = async () => {
        if (!file || !wabaId) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('wabaId', wabaId);
            formData.append('analyze', 'true');

            const response = await fetch('/api/contacts/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setCsvHeaders(data.headers);
                setSampleData(data.sampleData);
                setTotalRows(data.totalRows);

                // Auto-match fields based on header names
                const autoMappings = { ...fieldMappings };

                // Match by common field names (case-insensitive)
                data.headers.forEach((header: string) => {
                    const headerLower = header.toLowerCase();

                    // Try to auto-match based on common field names
                    if (/name|full\s*name|contact\s*name/i.test(headerLower)) {
                        autoMappings['name'] = header;
                    }
                    else if (/phone|mobile|cell|contact\s*number|phone\s*number/i.test(headerLower)) {
                        autoMappings['phone'] = header;
                    }
                    else if (/email|e-mail|mail/i.test(headerLower)) {
                        autoMappings['email'] = header;
                    }
                    else if (/country\s*code|dial\s*code/i.test(headerLower)) {
                        autoMappings['countryCode'] = header;
                    }
                    else if (/tags|labels|categories/i.test(headerLower)) {
                        autoMappings['tags'] = header;
                    }
                    else if (/notes|comments|description/i.test(headerLower)) {
                        autoMappings['notes'] = header;
                    }
                    else if (/opt\s*in|subscription|consent|whatsapp\s*opt/i.test(headerLower)) {
                        autoMappings['whatsappOptIn'] = header;
                    }

                    // Try to match custom fields
                    availableFields.forEach(field => {
                        if (field.key.startsWith('customField.')) {
                            const fieldName = field.label.toLowerCase();
                            if (headerLower === fieldName || headerLower.includes(fieldName)) {
                                autoMappings[field.key] = header;
                            }
                        }
                    });
                });

                setFieldMappings(autoMappings);
                setStep('mapping');
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to analyze file",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error analyzing file:', error);
            toast({
                title: "Error",
                description: "Failed to analyze file",
                variant: "destructive",
            });
        }
    };

    const isRequiredMappingsMissing = () => {
        const requiredFields = availableFields.filter(field => field.required);
        return requiredFields.some(field => !fieldMappings[field.key]);
    };

    const handleImport = async () => {
        if (!file || !wabaId || isRequiredMappingsMissing()) return;

        setStep('importing');
        setImportProgress(10); // Start progress

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('wabaId', wabaId);
            formData.append('fieldMappings', JSON.stringify(fieldMappings));
            formData.append('skipFirstRow', skipFirstRow.toString());

            // Simulate progress while importing
            const progressInterval = setInterval(() => {
                setImportProgress(prev => {
                    if (prev >= 90) clearInterval(progressInterval);
                    return Math.min(prev + 5, 90);
                });
            }, 500);

            const response = await fetch('/api/contacts/import', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setImportProgress(100);

            const data = await response.json();

            if (data.success) {
                setImportResults(data.results);
                toast({
                    title: "Import Successful",
                    description: `Imported ${data.results.imported} contacts. Skipped ${data.results.skipped}. Failed ${data.results.errors}.`,
                });

                // Call the onImportComplete callback after a delay to allow the user to see the results
                setTimeout(() => {
                    onImportComplete();
                    onOpenChange(false);
                }, 3000);
            } else {
                toast({
                    title: "Import Failed",
                    description: data.error || "Failed to import contacts",
                    variant: "destructive",
                });
                setStep('mapping'); // Go back to mapping step
            }
        } catch (error) {
            console.error('Error importing contacts:', error);
            toast({
                title: "Import Failed",
                description: "An error occurred while importing contacts",
                variant: "destructive",
            });
            setStep('mapping'); // Go back to mapping step
        }
    };

    const goToPreview = () => {
        if (isRequiredMappingsMissing()) {
            toast({
                title: "Required Fields Missing",
                description: "Please map all required fields before continuing",
                variant: "destructive",
            });
            return;
        }
        setStep('preview');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-fit max-w-5xl w-full max-h-screen overflow-y-scroll flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Import Contacts
                    </DialogTitle>
                    <DialogDescription>
                        Import contacts from a CSV file into your WhatsApp Business Account
                    </DialogDescription>
                </DialogHeader>

                {step === 'upload' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="w-full max-w-md p-6 border-2 border-dashed rounded-lg text-center space-y-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <UploadCloud className="h-12 w-12 mx-auto text-slate-400" />

                            <div>
                                <h3 className="text-lg font-semibold text-slate-700">Upload CSV File</h3>
                                <p className="text-sm text-slate-500">
                                    Click to select or drag and drop your CSV file here
                                </p>
                            </div>

                            <input
                                id="file-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file && (
                                <div className="flex items-center justify-center p-2 bg-primary/10 rounded border border-primary/20">
                                    <Check className="h-4 w-4 text-primary mr-2" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                    <button
                                        className="ml-2 text-slate-500 hover:text-slate-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Format Information</AlertTitle>
                            <AlertDescription>
                                <p className="text-sm">
                                    Your CSV file should contain columns for contact data. The first row should contain headers.
                                    Required fields are: Name and Phone Number.
                                </p>
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={analyzeFile}
                            disabled={!file}
                            className="w-full max-w-md"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Analyze File
                        </Button>
                    </div>
                )}

                {step === 'mapping' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">1</span>
                                <h3 className="font-medium">Map Your CSV Columns to Contact Fields</h3>
                            </div>
                            <div className="text-sm text-slate-500">
                                {totalRows} rows detected
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <Checkbox
                                id="skip-first-row"
                                checked={skipFirstRow}
                                onCheckedChange={(checked) => setSkipFirstRow(checked as boolean)}
                            />
                            <Label htmlFor="skip-first-row">
                                Skip first row (use if headers are repeated in the first data row)
                            </Label>
                        </div>

                        <ScrollArea className="h-[400px] border p-2 rounded-lg pr-4">
                            <div className="space-y-4">
                                {availableFields.map(field => (
                                    <div key={field.key} className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <Label className="flex items-center gap-1">
                                                {field.label}
                                                {field.required && <span className="text-red-500">*</span>}
                                                {field.type && (
                                                    <span className="text-xs text-slate-500 ml-1">({field.type})</span>
                                                )}
                                            </Label>
                                        </div>

                                        <div className="col-span-6">
                                            <Select
                                                value={fieldMappings[field.key] || ''}
                                                onValueChange={(value) => {
                                                    setFieldMappings({
                                                        ...fieldMappings,
                                                        [field.key]: value
                                                    });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select CSV column" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="NONE">Do not import</SelectItem>
                                                    {csvHeaders.map(header => (
                                                        <SelectItem key={header} value={header}>
                                                            {header}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-2">
                                            {fieldMappings[field.key] && sampleData.length > 0 && (
                                                <span className="text-xs text-slate-500 truncate block">
                                                    Preview: {String(sampleData[0][fieldMappings[field.key]] || '').slice(0, 15)}
                                                    {String(sampleData[0][fieldMappings[field.key]] || '').length > 15 ? '...' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="flex  justify-between">
                            <Button variant="outline" onClick={() => setStep('upload')}>
                                Back
                            </Button>
                            <Button onClick={goToPreview}>
                                Preview & Import
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">2</span>
                                <h3 className="font-medium">Review and Confirm Import</h3>
                            </div>
                        </div>

                        <Alert>
                            <HelpCircle className="h-4 w-4" />
                            <AlertTitle>Review Your Mapping</AlertTitle>
                            <AlertDescription>
                                <p className="text-sm">
                                    Please review the field mappings below. The import will create {totalRows} new contacts.
                                </p>
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Field Mappings:</h4>
                            <Card>
                                <CardContent className="p-4">
                                    <ScrollArea className="h-[200px]">
                                        <Tabs defaultValue="mapped">
                                            <TabsList className="mb-4">
                                                <TabsTrigger value="mapped">Mapped Fields</TabsTrigger>
                                                <TabsTrigger value="unmapped">Unmapped Fields</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="mapped">
                                                <div className="space-y-2">
                                                    {Object.entries(fieldMappings)
                                                        .filter(([_, sourceField]) => sourceField)
                                                        .map(([targetField, sourceField]) => {
                                                            const field = availableFields.find(f => f.key === targetField);
                                                            return (
                                                                <div key={targetField} className="flex items-center justify-between py-1 border-b">
                                                                    <div className="font-medium">{field?.label || targetField}</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-slate-500">←</span>
                                                                        <span>{sourceField}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    {Object.values(fieldMappings).filter(Boolean).length === 0 && (
                                                        <p className="text-slate-500 text-sm">No fields mapped</p>
                                                    )}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="unmapped">
                                                <div className="space-y-2">
                                                    {availableFields
                                                        .filter(field => !fieldMappings[field.key])
                                                        .map(field => (
                                                            <div key={field.key} className="flex items-center justify-between py-1 border-b">
                                                                <div className="font-medium">{field.label}</div>
                                                                <div className="text-slate-500 text-sm">Not imported</div>
                                                            </div>
                                                        ))}
                                                    {availableFields.filter(field => !fieldMappings[field.key]).length === 0 && (
                                                        <p className="text-slate-500 text-sm">All fields are mapped</p>
                                                    )}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Sample Data Preview:</h4>
                            <Card>
                                <CardContent className="p-4">
                                    <ScrollArea className="h-[200px]">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="text-left p-2 border">#</th>
                                                    {Object.entries(fieldMappings)
                                                        .filter(([_, sourceField]) => sourceField)
                                                        .map(([targetField, _]) => {
                                                            const field = availableFields.find(f => f.key === targetField);
                                                            return (
                                                                <th key={targetField} className="text-left p-2 border">
                                                                    {field?.label || targetField}
                                                                </th>
                                                            );
                                                        })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sampleData.slice(0, 3).map((row, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2 border">{index + 1}</td>
                                                        {Object.entries(fieldMappings)
                                                            .filter(([_, sourceField]) => sourceField)
                                                            .map(([targetField, sourceField]) => (
                                                                <td key={targetField} className="p-2 border truncate max-w-[150px]">
                                                                    {row[sourceField] || '-'}
                                                                </td>
                                                            ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setStep('mapping')}>
                                Back to Mapping
                            </Button>
                            <Button onClick={handleImport}>
                                Import Contacts
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'importing' && (
                    <div className="space-y-6 py-6">
                        <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 mb-4 relative">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-center mb-2">
                                {importProgress < 100 ? 'Importing Contacts...' : 'Import Complete!'}
                            </h3>

                            <p className="text-slate-500 text-center mb-4">
                                {importProgress < 100
                                    ? 'Please wait while we process your contacts'
                                    : 'Your contacts have been imported successfully'}
                            </p>

                            <div className="w-full max-w-md mb-4">
                                <Progress value={importProgress} className="h-2" />
                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                    <span>Processing</span>
                                    <span>{importProgress}%</span>
                                </div>
                            </div>

                            {importResults && (
                                <div className="w-full max-w-md bg-slate-50 p-4 rounded-lg border">
                                    <h4 className="font-medium mb-2">Import Results:</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                                            <div className="text-sm text-slate-600">Imported</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-amber-600">{importResults.skipped}</div>
                                            <div className="text-sm text-slate-600">Skipped</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{importResults.errors}</div>
                                            <div className="text-sm text-slate-600">Failed</div>
                                        </div>
                                    </div>

                                    {importResults.errorDetails && importResults.errorDetails.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="font-medium text-sm mb-1">Errors:</h5>
                                            <ScrollArea className="h-[100px]">
                                                <div className="space-y-1">
                                                    {importResults.errorDetails.map((error: any, index: number) => (
                                                        <div key={index} className="text-xs p-1 border-b">
                                                            <span className="font-medium">Row {error.row}:</span> {error.error}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className=''>
                            {importProgress >= 100 && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onImportComplete();
                                        onOpenChange(false);
                                    }}
                                >
                                    Close
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}