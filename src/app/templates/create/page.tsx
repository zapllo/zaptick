"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaAndroid, FaApple, FaWhatsapp } from "react-icons/fa";
import {
  ArrowLeft,
  Plus,
  Trash,
  Upload,
  CheckCircle,
  Loader2,
  FileText,
  Image,
  Video,
  File,
  FileImage,
  ExternalLink,
  AlertCircle,
  Smartphone,
  Phone,
  Link2,
  Type,
  Send,
  GripVertical,
  Copy,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Trash2,
  AlertTriangle,
  Info
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Button type interface
interface ButtonOption {
  type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'COPY_CODE';
  text: string;
  url?: string;
  urlType?: 'static' | 'dynamic';
  urlExample?: string;
  phone_number?: string;
  quick_reply?: string;
  copy_code?: string;
}

// Variable interface
interface Variable {
  name: string;
  example: string;
}

// Template form interface
interface CreateTemplateForm {
  name: string;
  category: string;
  language: string;
  content: string;
  wabaId: string;
  footerText: string;
  variables: Variable[];
  headerType: 'none' | 'text' | 'image' | 'video' | 'document';
  headerText: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | '';
  mediaHandle: string;
  mediaUrl: string; // Add this for preview
  includeButtons: boolean;
  buttonType: 'NONE' | 'MULTIPLE';
  buttons: ButtonOption[];
}

interface WabaAccount {
  wabaId: string;
  phoneNumberId: string;
  businessName: string;
  phoneNumber: string;
  status: string;
}

// Language options
const languageOptions = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Spanish' },
  { value: 'fr', label: '🇫🇷 French' },
  { value: 'de', label: '🇩🇪 German' },
  { value: 'pt_BR', label: '🇧🇷 Portuguese (Brazil)' },
  { value: 'it', label: '🇮🇹 Italian' },
  { value: 'ar', label: '🇸🇦 Arabic' },
  { value: 'hi', label: '🇮🇳 Hindi' },
  { value: 'id', label: '🇮🇩 Indonesian' },
  { value: 'zh_CN', label: '🇨🇳 Chinese (Simplified)' },
  { value: 'ja', label: '🇯🇵 Japanese' },
  { value: 'ko', label: '🇰🇷 Korean' },
  { value: 'ru', label: '🇷🇺 Russian' },
];

// Device type for preview
type DeviceType = 'iphone' | 'android';

// Helper function to get media type icon
const getMediaTypeIcon = (mediaType?: string) => {
  switch (mediaType) {
    case 'IMAGE': return <FileImage className="h-4 w-4" />;
    case 'VIDEO': return <Video className="h-4 w-4" />;
    case 'DOCUMENT': return <File className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

// WhatsApp Message Preview Component
// Update the WhatsApp Preview Component
const WhatsAppPreview = ({ form, deviceType, footerText }: { form: CreateTemplateForm, deviceType: DeviceType, footerText: string }) => {
  const previewContent = form.content
    .replace(/\{\{1\}\}/g, form.variables[0]?.example || "John")
    .replace(/\{\{2\}\}/g, form.variables[1]?.example || "SAVE20")
    .replace(/\{\{3\}\}/g, form.variables[2]?.example || "June 30, 2024")
    .replace(/\{\{4\}\}/g, form.variables[3]?.example || "Sample Value")
    .replace(/\{\{5\}\}/g, form.variables[4]?.example || "Example");

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayButtons = form.buttons.slice(0, 2);
  const showSeeAllOptions = form.buttons.length > 3;

  return (
    <div className="device-mockup mx-auto max-w-[320px]">
      <div
        className={`relative ${deviceType === 'iphone' ? 'pt-12 pb-[40px]' : 'pt-[40px] pb-[30px]'}`}
        style={{
          backgroundImage: `url(${deviceType === 'iphone'
            ? '/layout/iphone-view-layout.png'
            : '/layout/android-view-layout.png'})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '650px',
          width: '100%'
        }}
      >
        <div className="app-content flex flex-col h-[520px] mx-auto overflow-hidden rounded-2xl"
          style={{ width: '94%' }}>
          <div className="flex-1 dark:bg-[#0b141a] p-4 overflow-y-auto">
            {previewContent && (
              <div className="flex mb-3 mt-20">
                <div className="relative w-full max-w-[85%]">
                  {/* Bubble tail */}
                  {deviceType === 'iphone' && (
                    <div
                      className="absolute w-[20px] h-[20px] rounded-[10px] left-[-14px] bottom-[14px]"
                      style={{
                        boxShadow: 'rgb(254, 254, 254) 6px 6px 0px 0px',
                        backgroundColor: 'transparent',
                        cursor: 'auto'
                      }}
                    ></div>
                  )}
                  {deviceType !== 'iphone' && (
                    <div
                      className="absolute left-[-8px] top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-b-0 border-l-0 border-solid border-transparent border-r-[#ffffff] dark:border-r-[#202c33]"
                      style={{ transform: 'translateY(6px)' }}
                    ></div>
                  )}

                  <div className="bg-[#ffffff] dark:bg-[#202c33] p-3 rounded-lg ml-1 shadow-sm">
                    {/* Media Header */}
                    {(form.headerType === 'image' || form.headerType === 'video' || form.headerType === 'document') && form.mediaUrl && (
                      <div className="mb-2">
                        {form.headerText && (
                          <div className="text-xs font-medium mb-2">{form.headerText}</div>
                        )}
                        <div className="bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                          {form.headerType === 'image' && (
                            <img
                              src={form.mediaUrl}
                              alt="Header image"
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling!.style.display = 'flex';
                              }}
                            />
                          )}
                          {form.headerType === 'video' && (
                            <video
                              src={form.mediaUrl}
                              className="w-full h-32 object-cover"
                              controls={false}
                              muted
                            />
                          )}
                          {form.headerType === 'document' && (
                            <div className="p-4 flex items-center gap-3">
                              <File className="h-8 w-8 text-gray-500" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">Document</div>
                                <div className="text-xs text-gray-500">PDF Document</div>
                              </div>
                            </div>
                          )}
                          {/* Fallback placeholder */}
                          <div className="p-4 flex items-center gap-3" style={{ display: 'none' }}>
                            {getMediaTypeIcon(form.headerType.toUpperCase())}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">
                                {form.headerType === 'image' && 'Image attachment'}
                                {form.headerType === 'video' && 'Video attachment'}
                                {form.headerType === 'document' && 'Document attachment'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text Header */}
                    {form.headerType === 'text' && form.headerText && (
                      <div className="font-bold mb-2 text-[12px]">{form.headerText}</div>
                    )}

                    {/* Message Content */}
                    <div className="text-[12px] max-w-[100%]">
                      {previewContent || ""}
                    </div>

                    {/* Footer */}
                    {footerText && (
                      <div className="text-[10px] text-gray-500 border-gray-200 dark:border-gray-600 pt-2">
                        {footerText}
                      </div>
                    )}

                    <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-70">
                      <span>{currentTime}</span>
                    </div>

                    {/* Buttons section remains the same */}
                    {form.buttonType !== 'NONE' && form.buttons.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                        {/* ... existing button rendering code ... */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 min-h-[150px]"></div>
            <div className="flex justify-end mb-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTemplateForm>({
    name: '',
    category: '',
    language: '',
    content: '',
    wabaId: '',
    variables: [],
    footerText: '',
    headerType: 'none',
    mediaUrl: '',
    headerText: '',
    mediaType: '',
    mediaHandle: '',
    includeButtons: false,
    buttonType: 'NONE',
    buttons: []
  });

  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone');
  const [totalButtonCount, setTotalButtonCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [footerCharCount, setFooterCharCount] = useState(0);
  const [showUrlInfo, setShowUrlInfo] = useState(false);
  const [footerText, setFooterText] = useState('');
  // Fetch user's WABA accounts on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update total button count when buttons change
  useEffect(() => {
    setTotalButtonCount(form.buttons.length);
  }, [form.buttons]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setWabaAccounts(data.user.wabaAccounts || []);
        if (data.user.wabaAccounts?.length > 0) {
          setForm(prev => ({ ...prev, wabaId: data.user.wabaAccounts[0].wabaId }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Failed to fetch user data');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 16MB');
      return;
    }

    const allowedTypes = {
      'IMAGE': ['image/jpeg', 'image/png', 'image/gif'],
      'VIDEO': ['video/mp4', 'video/avi', 'video/mov'],
      'DOCUMENT': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    let detectedMediaType = '';
    for (const [type, mimeTypes] of Object.entries(allowedTypes)) {
      if (mimeTypes.includes(file.type)) {
        detectedMediaType = type;
        break;
      }
    }

    if (!detectedMediaType) {
      toast.error('Unsupported file type. Please upload an image, video, or document.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', detectedMediaType);

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({
          ...prev,
          headerType: detectedMediaType.toLowerCase() as 'image' | 'video' | 'document',
          mediaType: detectedMediaType as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
          mediaHandle: data.handle,
          mediaUrl: data.url
        }));
        toast.success('File uploaded successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  const handleButtonTypeChange = (value: string) => {
    const buttonType = value as 'NONE' | 'MULTIPLE';

    // Update form state with new button type
    setForm(prev => ({
      ...prev,
      buttonType,
      includeButtons: buttonType !== 'NONE',
      buttons: buttonType === 'NONE' ? [] : prev.buttons
    }));
  };

  // Add a function to handle checkbox selection for button types
  const toggleButtonType = (type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'COPY_CODE') => {
    // Check if this button type already exists
    const exists = form.buttons.some(button => button.type === type);

    if (exists) {
      // Remove buttons of this type
      setForm(prev => ({
        ...prev,
        buttons: prev.buttons.filter(button => button.type !== type)
      }));
    } else {
      // Check if adding this button would exceed the limit of 10
      if (form.buttons.length >= 10) {
        toast.error('Maximum of 10 buttons allowed in total');
        return;
      }

      // Add a new button of this type
      const newButton: ButtonOption = { type, text: '' };

      if (type === 'URL') {
        newButton.url = '';
        newButton.urlType = 'static';
        newButton.urlExample = '';
      } else if (type === 'PHONE_NUMBER') {
        newButton.phone_number = '';
      } else if (type === 'QUICK_REPLY') {
        newButton.quick_reply = '';
      } else if (type === 'COPY_CODE') {
        newButton.copy_code = '';
      }

      setForm(prev => ({
        ...prev,
        buttons: [...prev.buttons, newButton]
      }));
    }
  };

  // Add this state for tracking cursor position
  const [cursorPosition, setCursorPosition] = useState(0);

  // Add these functions for text formatting
  const insertFormatting = (startTag: string, endTag: string, placeholder: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const beforeText = form.content.substring(0, start);
    const afterText = form.content.substring(end);

    const newText = beforeText + startTag + textToInsert + endTag + afterText;

    setForm(prev => ({ ...prev, content: newText }));

    // Set cursor position after the inserted text
    setTimeout(() => {
      const newCursorPos = start + startTag.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleBold = () => {
    insertFormatting('*', '*', 'bold text');
  };

  const handleItalic = () => {
    insertFormatting('_', '_', 'italic text');
  };

  const handleUnderline = () => {
    insertFormatting('~', '~', 'strikethrough text');
  };

  const handleCreateTemplate = async () => {
    if (!form.name || !form.category || !form.content || !form.wabaId || !form.language) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (['image', 'video', 'document'].includes(form.headerType) && (!form.mediaType || !form.mediaHandle)) {
      toast.error('Please upload a media file for media templates');
      return;
    }
    if (form.buttonType !== 'NONE' && form.buttons.length === 0) {
      toast.error('Please add at least one button or select "None" for button type');
      return;
    }

    // Validate template name format
    if (!/^[a-z0-9_]+$/.test(form.name)) {
      toast.error('Template name can only contain lowercase letters, numbers, and underscores');
      return;
    }

    try {
      setCreating(true);

      // Prepare components for API request according to expected payload format
      const components = [];

      if (form.headerType === 'image' || form.headerType === 'video' || form.headerType === 'document') {
        const headerComponent: any = {
          type: 'HEADER',
          format: form.mediaType
        };

        if (form.mediaHandle) {
          headerComponent.example = {
            header_handle: [form.mediaHandle]
          };
          // Also pass the mediaHandle directly for the API
          headerComponent.mediaHandle = form.mediaHandle;
        }
        components.push(headerComponent);
      } else if (form.headerType === 'text' && form.headerText) {
        components.push({
          type: 'HEADER',
          format: 'TEXT',
          text: form.headerText
        });
      }

      // Add body component (required)
      const bodyComponent: any = {
        type: 'BODY',
        text: form.content
      };

      // Add example if variables are present - format as expected
      if (form.variables.length > 0) {
        bodyComponent.example = {
          body_text: [
            form.variables.map(v => v.example || `sample_${v.name}`)
          ]
        };
      }

      components.push(bodyComponent);

      // Add footer component if provided
      if (footerText.trim()) {
        components.push({
          type: 'FOOTER',
          text: footerText
        });
      }

      // Add buttons if included
      if (form.buttonType !== 'NONE' && form.buttons.length > 0) {
        const buttonsComponent: any = {
          type: 'BUTTONS',
          buttons: form.buttons.map(button => {
            const buttonData: any = {
              type: button.type,
              text: button.text
            };

            if (button.type === 'URL') {
              buttonData.url = button.url;
              // Add example for dynamic URLs in the correct format
              if (button.urlType === 'dynamic' && button.urlExample) {
                buttonData.example = [button.urlExample];
              }
            } else if (button.type === 'PHONE_NUMBER') {
              buttonData.phone_number = button.phone_number;
            } else if (button.type === 'QUICK_REPLY') {
              // For quick reply, no additional fields needed
            } else if (button.type === 'COPY_CODE') {
              buttonData.copy_code = button.copy_code;
            }

            return buttonData;
          })
        };

        components.push(buttonsComponent);
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          language: form.language,
          wabaId: form.wabaId,
          components: components
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Template created successfully! It will be reviewed by WhatsApp.');
        router.push('/templates');
      } else {
        toast.error(data.error || 'Failed to create template');
      }
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    } finally {
      setCreating(false);
    }
  };


  const addVariable = () => {
    const newVariableIndex = form.variables.length + 1;
    const cursorPosition = document.getElementById('content')?.selectionStart || form.content.length;

    // Insert variable placeholder at cursor position
    const updatedContent =
      form.content.slice(0, cursorPosition) +
      `{{${newVariableIndex}}}` +
      form.content.slice(cursorPosition);

    setForm(prev => ({
      ...prev,
      content: updatedContent,
      variables: [...prev.variables, { name: '', example: '' }]
    }));
  };

  const updateVariable = (index: number, field: keyof Variable, value: string) => {
    setForm(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) =>
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    // Remove the variable and renumber the remaining ones in the content
    const updatedContent = form.content.replace(
      new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'),
      ''
    );

    // Update all variable numbers in the template content
    let finalContent = updatedContent;
    for (let i = index + 2; i <= form.variables.length; i++) {
      finalContent = finalContent.replace(
        new RegExp(`\\{\\{${i}\\}\\}`, 'g'),
        `{{${i - 1}}}`
      );
    }

    setForm(prev => ({
      ...prev,
      content: finalContent,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const addButton = (type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'COPY_CODE') => {
    if (form.buttons.length >= 10) {
      toast.error('Maximum of 10 buttons allowed');
      return;
    }

    const newButton: ButtonOption = { type, text: '' };

    if (type === 'URL') {
      newButton.url = '';
      newButton.urlType = 'static';
      newButton.urlExample = '';
    } else if (type === 'PHONE_NUMBER') {
      newButton.phone_number = '';
    } else if (type === 'QUICK_REPLY') {
      newButton.quick_reply = '';
    } else if (type === 'COPY_CODE') {
      newButton.copy_code = '';
    }

    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, newButton]
    }));
  };

  const updateButton = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) => {
        if (i === index) {
          return { ...button, [field]: value };
        }
        return button;
      })
    }));
  };

  const removeButton = (index: number) => {
    setForm(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  // Function to move button up/down for reordering
  const moveButton = (index: number, direction: 'up' | 'down') => {
    const newButtons = [...form.buttons];
    if (direction === 'up' && index > 0) {
      [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
    } else if (direction === 'down' && index < newButtons.length - 1) {
      [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
    }

    setForm(prev => ({
      ...prev,
      buttons: newButtons
    }));
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    });
  };

  const isFormValid = (): boolean => {
    const isBasicInfoValid = form.name && form.category && form.language && form.wabaId;
    const isContentValid = form.content?.trim().length > 0;
    const isMediaValid = form.headerType !== 'media' || (form.mediaType && form.mediaHandle);
    const isButtonsValid = form.buttonType === 'NONE' || form.buttons.some(b => b.text);

    return isBasicInfoValid && isContentValid || isMediaValid && isButtonsValid;
  };

  // Count buttons by type
  const countButtonsByType = (type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'COPY_CODE') => {
    return form.buttons.filter(button => button.type === type).length;
  };

  useEffect(() => {
    setCharacterCount(form.content.length);
  }, [form.content]);

  // Update footer character count
  useEffect(() => {
    setFooterCharCount(footerText.length);
  }, [footerText]);

  const toggleUrlInfo = () => {
    setShowUrlInfo(!showUrlInfo);
  };

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Template Creation Header */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => router.back()}>
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-base font-medium">Create New Template</h1>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-md py-1 px-3">
                <FaWhatsapp className="text-green-500" size={16} />
                <span className="text-sm">WhatsApp</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm flex items-center">
                Best practices for creating WhatsApp templates
                <ExternalLink size={14} className="ml-1" />
              </a>

              <Button variant="outline" className="border-gray-300 text-gray-700">
                Cancel
              </Button>

              <Button
                onClick={handleCreateTemplate}

                className="bg-teal-500 hover:bg-teal-600 text-white border-none"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Template Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Template Name */}
                <div>
                  <Label htmlFor="template-name" className="text-sm font-medium block mb-1">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="Enter template name..."
                    value={form.name}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                    }))}
                    className="border-gray-300"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium block mb-1">Category</Label>
                  <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger id="category" className="border-gray-300 h-10 w-full">
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Button Type */}
                <div>
                  <Label htmlFor="button-type" className="text-sm font-medium block mb-1">
                    Button Type<span className="text-gray-500 font-normal"> (Optional)</span>
                  </Label>
                  <Select
                    value={form.buttonType}
                    onValueChange={handleButtonTypeChange}
                  >
                    <SelectTrigger id="button-type" className="border-gray-300 h-10 w-full">
                      <SelectValue placeholder="Copy Code, URL, Quick Replies etc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="MULTIPLE">Copy Code, URL, Quick Replies etc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Template Language Selection */}
              <div>
                <Label className="text-sm font-medium block mb-3">Template(s)</Label>
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className={`text-blue-600 ${form.language ? "bg-blue-50 border-blue-200" : "bg-gray-100"} rounded-md px-3 py-1 text-sm border`}>
                    {form.language ? languageOptions.find(l => l.value === form.language)?.label : 'Select Language'}
                  </div>
                  <Select value={form.language} onValueChange={(value) => setForm(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className="border-gray-300 h-8 w-56 bg-white">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {languageOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.language && (
                  <div className="py-2">
                    <p className="text-sm font-medium mb-3">Template for {languageOptions.find(l => l.value === form.language)?.label} language</p>
                    <Button
                      variant="outline"
                      className="bg-teal-500 hover:bg-teal-600 text-white border-none text-sm h-9"
                    >
                      Add Sample
                    </Button>
                  </div>
                )}
              </div>

              {/* Show form sections only after language is selected */}
              {form.language && (
                <>
                  {/* Header Section */}
                  <div className="p-5 border border-gray-200 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Header (Optional)</h3>
                    <p className="text-sm text-gray-600 mb-4">Add a title, or select the media type you want to get approved for this template&apos;s header</p>

                    <RadioGroup
                      value={form.headerType}
                      onValueChange={(value: 'none' | 'text' | 'image' | 'video' | 'document') =>
                        setForm(prev => ({
                          ...prev,
                          headerType: value,
                          headerText: value === 'none' ? '' : prev.headerText,
                          mediaType: value === 'none' ? '' :
                            value === 'image' ? 'IMAGE' :
                              value === 'video' ? 'VIDEO' :
                                value === 'document' ? 'DOCUMENT' : '',
                          mediaHandle: value === 'none' ? '' : prev.mediaHandle,
                          mediaUrl: value === 'none' ? '' : prev.mediaUrl
                        }))
                      }
                      className="flex space-x-4 mb-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="header-none" />
                        <Label htmlFor="header-none" className="text-sm">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="header-text" />
                        <Label htmlFor="header-text" className="text-sm">Text</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="header-image" />
                        <Label htmlFor="header-image" className="text-sm">Image</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="header-video" />
                        <Label htmlFor="header-video" className="text-sm">Video</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="document" id="header-document" />
                        <Label htmlFor="header-document" className="text-sm">Document</Label>
                      </div>
                    </RadioGroup>

                    {form.headerType === 'text' && (
                      <div className="mb-4">
                        <Input
                          placeholder="Enter header text..."
                          value={form.headerText}
                          onChange={(e) => setForm(prev => ({ ...prev, headerText: e.target.value }))}
                          className="border-gray-300"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum 60 characters</p>
                      </div>
                    )}

                    {['image', 'video', 'document'].includes(form.headerType) && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="headerText">Header Text (Optional)</Label>
                          <Input
                            id="headerText"
                            placeholder="e.g. Check out our latest offer!"
                            value={form.headerText}
                            onChange={(e) => setForm(prev => ({ ...prev, headerText: e.target.value }))}
                            maxLength={60}
                            className="border-gray-300"
                          />
                        </div>

                        <div className="pt-2">
                          <Label>
                            {form.headerType === 'image' && 'Image File'}
                            {form.headerType === 'video' && 'Video File'}
                            {form.headerType === 'document' && 'Document File'}
                          </Label>
                          {form.mediaHandle ? (
                            <div className="border-2 border-dashed border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 rounded-lg p-4 mt-2">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-green-700 dark:text-green-300">
                                    File uploaded successfully
                                  </p>
                                  <p className="text-sm text-green-600 dark:text-green-400">
                                    {form.mediaType} • Ready to use
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setForm(prev => ({
                                    ...prev,
                                    mediaHandle: '',
                                    mediaType: '',
                                    mediaUrl: ''
                                  }))}
                                >
                                  Change
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-2">
                              <div className="flex items-center gap-3">
                                <Upload className="h-8 w-8 text-gray-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium">
                                    Upload {form.headerType} file
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {form.headerType === 'image' && 'JPEG, PNG, GIF (max 16MB)'}
                                    {form.headerType === 'video' && 'MP4, AVI, MOV (max 16MB)'}
                                    {form.headerType === 'document' && 'PDF, DOC, DOCX (max 16MB)'}
                                  </p>
                                </div>
                                <Input
                                  type="file"
                                  accept={
                                    form.headerType === 'image' ? 'image/*' :
                                      form.headerType === 'video' ? 'video/*' :
                                        '.pdf,.doc,.docx'
                                  }
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(file);
                                    }
                                  }}
                                  disabled={uploading}
                                  className="hidden"
                                  id="file-upload"
                                />
                                <Label
                                  htmlFor="file-upload"
                                  className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-teal-600"
                                >
                                  {uploading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    'Upload'
                                  )}
                                </Label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 border border-gray-200 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Body</h3>
                    <p className="text-sm text-gray-600 mb-4">The WhatsApp message in the language you have selected</p>

                    <Textarea
                      id="content"
                      placeholder="Enter your message here..."
                      rows={5}
                      value={form.content}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, content: e.target.value }));
                        setCursorPosition(e.target.selectionStart);
                      }}
                      onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                      className="border-gray-300 resize-none"
                    />

                    <div className="flex justify-end mt-1 text-xs text-gray-500">
                      {characterCount}/1024
                    </div>

                    <div className="flex mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-teal-500 border-teal-500 text-xs h-7 px-2"
                        onClick={addVariable}
                      >
                        <Plus size={16} className="mr-1" /> Add variable
                      </Button>

                      <div className="ml-auto flex items-center space-x-3">
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={handleBold}
                          title="Bold (*text*)"
                        >
                          <Bold size={16} />
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={handleItalic}
                          title="Italic (_text_)"
                        >
                          <Italic size={16} />
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={handleUnderline}
                          title="Strikethrough (~text~)"
                        >
                          <Underline size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Add a helper text about formatting */}
                    <div className="mt-2 text-xs text-gray-500">
                      Use *bold*, _italic_, or ~strikethrough~ formatting. Select text and click buttons to format.
                    </div>

                    {/* Variables Section */}
                    {form.variables.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <Label className="text-sm font-medium">Variables</Label>
                        <div className="space-y-2">
                          {form.variables.map((variable, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono w-12 flex-shrink-0">
                                {`{{${index + 1}}}`}
                              </Badge>
                              <Input
                                placeholder="Variable name"
                                value={variable.name}
                                onChange={(e) => updateVariable(index, 'name', e.target.value)}
                                className="h-8 border-gray-300"
                              />
                              <Input
                                placeholder="Example value"
                                value={variable.example}
                                onChange={(e) => updateVariable(index, 'example', e.target.value)}
                                className="h-8 border-gray-300"
                              />
                              <button
                                onClick={() => removeVariable(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Footer Section */}
                  <div className="p-5 border border-gray-200 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Footer (Optional)</h3>
                    <p className="text-sm text-gray-600 mb-4">Add a short line of text to the bottom of your message template.</p>

                    <Input
                      placeholder="Enter footer text..."
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      className="border-gray-300"
                      maxLength={60}
                    />

                    <div className="flex justify-end mt-1 text-xs text-gray-500">
                      {footerCharCount}/60
                    </div>
                  </div>

                  {/* Buttons Section */}
                  {form.buttonType !== 'NONE' && (
                    <div className="p-5 border border-gray-200 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Copy Code, URL, Quick Replies etc.</h3>
                      <p className="text-sm text-gray-600 mb-4">Create buttons that let customers respond to your message or take action.</p>

                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="flex">
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">The total number of buttons from all four types cannot exceed 10.</span>
                            <span className="ml-2 text-blue-600 underline cursor-pointer">Learn More</span>
                          </div>
                          <div className="ml-auto text-xs font-medium">
                            {totalButtonCount}/10
                          </div>
                        </div>
                      </div>

                      {/* Coupon Code Button */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="add-coupon-code"
                              className="mr-2"
                              checked={countButtonsByType('COPY_CODE') > 0}
                              onChange={() => toggleButtonType('COPY_CODE')}
                            />
                            <Label htmlFor="add-coupon-code" className="text-sm font-medium">Add Coupon Code</Label>
                          </div>
                          {countButtonsByType('COPY_CODE') > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addButton('COPY_CODE')}
                              disabled={totalButtonCount >= 10}
                              className="text-teal-500 border-teal-500 text-xs h-7"
                            >
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          )}
                        </div>

                        {form.buttons.filter(b => b.type === 'COPY_CODE').length > 0 && (
                          <div className="pl-6 mt-2 space-y-2">
                            {form.buttons.filter(b => b.type === 'COPY_CODE').map((button, index) => {
                              const buttonIndex = form.buttons.findIndex(b => b === button);
                              return (
                                <div key={`coupon-${index}`} className="flex gap-2 items-center">
                                  <Input
                                    placeholder="Copy Code"
                                    value={button.text}
                                    onChange={(e) => updateButton(buttonIndex, 'text', e.target.value)}
                                    className="border-gray-300 w-64"
                                  />
                                  <Input
                                    placeholder="Enter text for coupon code"
                                    value={button.copy_code || ''}
                                    onChange={(e) => updateButton(buttonIndex, 'copy_code', e.target.value)}
                                    className="border-gray-300 flex-1"
                                  />
                                  <div className="text-xs text-gray-500">0/25</div>
                                  <button
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => removeButton(buttonIndex)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Quick Replies Buttons */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="add-quick-reply"
                              className="mr-2"
                              checked={countButtonsByType('QUICK_REPLY') > 0}
                              onChange={() => toggleButtonType('QUICK_REPLY')}
                            />
                            <Label htmlFor="add-quick-reply" className="text-sm font-medium">Add Quick Replies</Label>
                          </div>
                          {countButtonsByType('QUICK_REPLY') > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addButton('QUICK_REPLY')}
                              disabled={totalButtonCount >= 10}
                              className="text-teal-500 border-teal-500 text-xs h-7"
                            >
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          )}
                        </div>

                        {form.buttons.filter(b => b.type === 'QUICK_REPLY').length > 0 && (
                          <div className="pl-6 mt-2 space-y-2">
                            {form.buttons.filter(b => b.type === 'QUICK_REPLY').map((button, index) => {
                              const buttonIndex = form.buttons.findIndex(b => b === button);
                              return (
                                <div key={`quick-reply-${index}`} className="flex gap-2 items-center">
                                  <Input
                                    placeholder="Quick reply text"
                                    value={button.text}
                                    onChange={(e) => updateButton(buttonIndex, 'text', e.target.value)}
                                    className="border-gray-300 flex-1"
                                  />
                                  <div className="text-xs text-gray-500">0/25</div>
                                  <button
                                    className="text-gray-400 hover:text-red-500"
                                    onClick={() => removeButton(buttonIndex)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Website URL Buttons */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="add-website-url"
                              className="mr-2"
                              checked={countButtonsByType('URL') > 0}
                              onChange={() => toggleButtonType('URL')}
                            />
                            <Label htmlFor="add-website-url" className="text-sm font-medium">Add Website URL</Label>
                          </div>
                          {countButtonsByType('URL') > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addButton('URL')}
                              disabled={totalButtonCount >= 10}
                              className="text-teal-500 border-teal-500 text-xs h-7"
                            >
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          )}
                        </div>

                        {form.buttons.filter(b => b.type === 'URL').length > 0 && (
                          <div className="pl-6 mt-2 space-y-2">
                            {form.buttons.filter(b => b.type === 'URL').map((button, index) => {
                              const buttonIndex = form.buttons.findIndex(b => b === button);
                              return (
                                <div key={`url-${index}`} className="space-y-2">
                                  <div className="flex gap-2 items-center">
                                    <Select
                                      value={button.urlType || 'static'}
                                      onValueChange={(value) => updateButton(buttonIndex, 'urlType', value)}
                                    >
                                      <SelectTrigger className="border-gray-300 h-9 w-28">
                                        <SelectValue placeholder="Dynamic" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="dynamic">Dynamic</SelectItem>
                                        <SelectItem value="static">Static</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder={button.urlType === 'dynamic' ? "https://example.com/{{1}}" : "https://example.com"}
                                      value={button.url || ''}
                                      onChange={(e) => updateButton(buttonIndex, 'url', e.target.value)}
                                      className="border-gray-300 flex-1"
                                    />
                                    <div className="text-xs text-gray-500">0/2000</div>
                                    <button
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={() => removeButton(buttonIndex)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>

                                  {button.urlType === 'dynamic' && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-teal-500 border-teal-500 text-xs h-7"
                                        onClick={toggleUrlInfo}
                                      >
                                        <Info size={14} className="mr-1" /> Add UTM Parameters
                                      </Button>

                                      {showUrlInfo && (
                                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md text-xs text-gray-700 mt-2">
                                          <div className="flex items-center mb-2">
                                            <Info size={14} className="mr-2 text-blue-600" />
                                            <span className="font-medium">There are 2 ways of providing the dynamic URL:</span>
                                          </div>

                                          <ol className="space-y-3 ml-5 list-decimal">
                                            <li>
                                              <span className="font-medium">Dynamic portion of URL as a variable -</span> The provided URL should have a variable in place of the dynamic portion of the URL. If your actual URL is <span className="font-medium">https://www.example.com/order/12345</span> where 12345 is the dynamic part, you should enter the URL as <span className="font-medium">https://www.example.com/order/{"{{1}}"}</span>. You can map {"{{1}}"} to a user trait / event trait which contains the dynamic portion for each customer.
                                            </li>
                                            <li>
                                              <span className="font-medium">Full URL as a variable -</span> Provide the dynamic URL as <span className="font-medium">https://api.interakt.ai/cta?redirect={"{{1}}"}</span>. You can map {"{{1}}"} to a user trait / event trait, which contains the full URL for each customer.
                                            </li>
                                          </ol>

                                          <a href="#" className="text-blue-600 block mt-2">
                                            read less
                                          </a>
                                        </div>
                                      )}

                                      <div>
                                        <Input
                                          placeholder="Example URL (for dynamic URLs)"
                                          value={button.urlExample || ''}
                                          onChange={(e) => updateButton(buttonIndex, 'urlExample', e.target.value)}
                                          className="border-gray-300 w-full"
                                        />
                                        <div className="flex justify-end mt-1">
                                          <div className="text-xs text-gray-500">0/25</div>
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  <div>
                                    <Input
                                      placeholder="Enter text for the button"
                                      value={button.text}
                                      onChange={(e) => updateButton(buttonIndex, 'text', e.target.value)}
                                      className="border-gray-300 w-full"
                                    />
                                    <div className="flex justify-end mt-1">
                                      <div className="text-xs text-gray-500">0/25</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Phone Number Button */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="add-phone-number"
                              className="mr-2"
                              checked={countButtonsByType('PHONE_NUMBER') > 0}
                              onChange={() => toggleButtonType('PHONE_NUMBER')}
                            />
                            <Label htmlFor="add-phone-number" className="text-sm font-medium">Add Phone Number</Label>
                          </div>
                          {countButtonsByType('PHONE_NUMBER') > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addButton('PHONE_NUMBER')}
                              disabled={totalButtonCount >= 10}
                              className="text-teal-500 border-teal-500 text-xs h-7"
                            >
                              <Plus size={14} className="mr-1" /> Add
                            </Button>
                          )}
                        </div>

                        {form.buttons.filter(b => b.type === 'PHONE_NUMBER').length > 0 && (
                          <div className="pl-6 mt-2 space-y-2">
                            {form.buttons.filter(b => b.type === 'PHONE_NUMBER').map((button, index) => {
                              const buttonIndex = form.buttons.findIndex(b => b === button);
                              return (
                                <div key={`phone-${index}`} className="space-y-2">
                                  <div className="flex gap-2 items-center">
                                    <Select defaultValue="+91">
                                      <SelectTrigger className="border-gray-300 h-9 w-24">
                                        <SelectValue placeholder="+91" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="+91">+91</SelectItem>
                                        <SelectItem value="+1">+1</SelectItem>
                                        <SelectItem value="+44">+44</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder="Enter phone number"
                                      value={button.phone_number || ''}
                                      onChange={(e) => updateButton(buttonIndex, 'phone_number', e.target.value)}
                                      className="border-gray-300 flex-1"
                                    />
                                    <div className="text-xs text-gray-500">0/20</div>
                                    <button
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={() => removeButton(buttonIndex)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>

                                  <div>
                                    <Input
                                      placeholder="Enter text for the button"
                                      value={button.text}
                                      onChange={(e) => updateButton(buttonIndex, 'text', e.target.value)}
                                      className="border-gray-300 w-full"
                                    />
                                    <div className="flex justify-end mt-1">
                                      <div className="text-xs text-gray-500">0/25</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}




                </>
              )}
            </div>

            {/* Right Column: Preview */}
            <div className="space-y-4 relative">
              <div className="absolute w-full">
                {form.language && (
                  <Card className="sticky top-6">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Preview</CardTitle>
                        <div className="border rounded-lg overflow-hidden flex">
                          <Button
                            variant={deviceType === 'iphone' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="rounded-none px-3 h-8"
                            onClick={() => setDeviceType('iphone')}
                          >
                            <FaApple />
                          </Button>
                          <div className="border-r h-8"></div>
                          <Button
                            variant={deviceType === 'android' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="rounded-none px-3 h-8"
                            onClick={() => setDeviceType('android')}
                          >
                            <FaAndroid />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="">
                      <WhatsAppPreview form={form} deviceType={deviceType} footerText={footerText} />
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-center">
                      <div className="text-xs text-gray-500">
                        Preview is for visualization only
                      </div>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Guidelines Card */}
        <div className="flex justify-center">
          <div className="p-5 border max-w-7xl mx-6 border-yellow-200 bg-yellow-50 w-full rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-yellow-800">
                  Template Guidelines
                </p>
                <p className="text-xs text-yellow-700">
                  Templates must be approved by WhatsApp before use.
                </p>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-yellow-700 hover:underline"
                >
                  View WhatsApp guidelines
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
