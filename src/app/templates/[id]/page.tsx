"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
interface EditTemplateForm {
  name: string;
  category: string;
  language: string;
  content: string;
  wabaId: string;
  footerText: string;
  variables: Variable[];
  headerType: 'none' | 'text' | 'media';
  headerText: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | '';
  mediaHandle: string;
  includeButtons: boolean;
  buttonType: 'NONE' | 'MULTIPLE';
  buttons: ButtonOption[];
}

// Template interface
interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string;
  variables: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  lastUsed?: string;
  useCount: number;
  rejectionReason?: string;
  type: 'text' | 'media';
  mediaType?: string;
  components: any[];
  whatsappTemplateId?: string;
  wabaId: string;
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
const WhatsAppPreview = ({ form, deviceType, footerText }: { form: CreateTemplateForm, deviceType: DeviceType }) => {
  const previewContent = form.content
    .replace(/\{\{1\}\}/g, form.variables[0]?.example || "John")
    .replace(/\{\{2\}\}/g, form.variables[1]?.example || "SAVE20")
    .replace(/\{\{3\}\}/g, form.variables[2]?.example || "June 30, 2024")
    .replace(/\{\{4\}\}/g, form.variables[3]?.example || "Sample Value")
    .replace(/\{\{5\}\}/g, form.variables[4]?.example || "Example");

  // Time for message timestamp
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Show only first 3 buttons, with "See all options" as 3rd if more than 3
  const displayButtons = form.buttons.slice(0, 2);
  const hasMoreButtons = form.buttons.length > 3;
  const showSeeAllOptions = form.buttons.length > 3;

  return (
    <div className="device-mockup mx-auto max-w-[320px]">
      {/* Device frame using background image */}
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
        {/* WhatsApp app interface - positioned inside the device screen area */}
        <div className="app-content flex flex-col h-[520px] mx-auto overflow-hidden rounded-2xl"
          style={{ width: '94%' }}>
          {/* Chat Background */}
          <div
            className="flex-1 wark:bg-[#0b141a] p-4 overflow-y-auto"
          >
            {/* Previous message example */}
            {previewContent && (
              <div className="flex mb-3 mt-20">
                {/* Chat bubble with tail on left side */}
                <div className="relative w-full max-w-[85%]">
                  {/* Bubble tail (triangle) */}
                  {deviceType != 'iphone' && (
                    <div
                      className="absolute left-[-8px] top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-b-0 border-l-0 border-solid border-transparent border-r-[#ffffff] wark:border-r-[#202c33]"
                      style={{ transform: 'translateY(6px)' }}
                    ></div>
                  )}

                  {/* Bubble tail (triangle) */}
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
                      className="absolute left-[-8px] top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-b-0 border-l-0 border-solid border-transparent border-r-[#ffffff] wark:border-r-[#202c33]"
                      style={{ transform: 'translateY(6px)' }}
                    ></div>
                  )}
                  {/* Message bubble content */}
                  <div className="bg-[#ffffff] wark:bg-[#202c33] p-3 rounded-lg ml-1 shadow-sm">
                    {/* Media Header */}
                    {form.headerType === 'media' && form.mediaHandle && (
                      <div className="mb-2 font-bold ">
                        {form.headerText && (
                          <div className="text-xs font-medium mb-2">{form.headerText}</div>
                        )}
                        <div className="bg-gray-200 wark:bg-gray-700 rounded p-4 flex items-center gap-3">
                          {getMediaTypeIcon(form.mediaType)}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">
                              {form.mediaType === 'IMAGE' && 'Image attachment'}
                              {form.mediaType === 'VIDEO' && 'Video attachment'}
                              {form.mediaType === 'DOCUMENT' && 'Document attachment'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text Header */}
                    {form.headerType === 'text' && form.headerText && (
                      <div className="font- mb-2 text-[12px] font-bold">{form.headerText}</div>
                    )}

                    {/* Message Content */}
                    <div className="text-[12px]  max-w-[100%]">
                      {previewContent || ""}
                    </div>
                    {/* Footer */}
                    {footerText && (
                      <div className="text-[10px] text-gray-500  border-gray-200 wark:border-gray-600 pt-2">
                        {footerText}
                      </div>
                    )}
                    <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-70">
                      <span>{currentTime}</span>
                    </div>

                    {/* Buttons with separators and icons */}
                    {form.buttonType !== 'NONE' && form.buttons.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-300 wark:border-gray-600">
                        {/* Display first 2 buttons */}
                        {displayButtons.map((button, index) => (
                          <div key={index}>
                            {/* Add separator if not the first item */}
                            {index > 0 && (
                              <div className="border-t border-gray-200 wark:border-gray-700 my-1"></div>
                            )}

                            <div className={`text-center  px-1 rounded-md flex items-center justify-center ${button.type === 'URL' ? 'text-[#0277BD]' :
                              button.type === 'PHONE_NUMBER' ? 'text-[#0277BD]' :
                                button.type === 'COPY_CODE' ? ' text-[#0277BD]' :
                                  'text-[#0277BD]'
                              }`}>
                              {/* Button Icon */}
                              <span className="mr-1">
                                {button.type === 'URL' && <svg width="19px" height="19px" viewBox="0 0 24 24" fill="#0096DE" xmlns="http://www.w3.org/2000/svg"><path d="M13 3L16.293 6.293L9.29297 13.293L10.707 14.707L17.707 7.707L21 11V3H13Z"></path><path d="M19 19H5V5H12L10 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V14L19 12V19Z"></path></svg>}
                                {button.type === 'PHONE_NUMBER' && <svg xmlns="http://www.w3.org/2000/svg" width="19px" height="19px" fill="#0096DE" viewBox="0 0 18 18"><path d="M17.01 12.38C15.78 12.38 14.59 12.18 13.48 11.82C13.3061 11.7611 13.1191 11.7523 12.9405 11.7948C12.7618 11.8372 12.5988 11.9291 12.47 12.06L10.9 14.03C8.07 12.68 5.42 10.13 4.01 7.2L5.96 5.54C6.23 5.26 6.31 4.87 6.2 4.52C5.83 3.41 5.64 2.22 5.64 0.99C5.64 0.45 5.19 0 4.65 0H1.19C0.65 0 0 0.24 0 0.99C0 10.28 7.73 18 17.01 18C17.72 18 18 17.37 18 16.82V13.37C18 12.83 17.55 12.38 17.01 12.38Z"></path></svg>}
                                {button.type === 'QUICK_REPLY'}
                                {button.type === 'COPY_CODE' && <svg width="19px" height="19px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_38_32111)"><path d="M6.66699 8.33268C6.66699 7.89065 6.84259 7.46673 7.15515 7.15417C7.46771 6.84161 7.89163 6.66602 8.33366 6.66602H15.0003C15.4424 6.66602 15.8663 6.84161 16.1788 7.15417C16.4914 7.46673 16.667 7.89065 16.667 8.33268V14.9993C16.667 15.4414 16.4914 15.8653 16.1788 16.1779C15.8663 16.4904 15.4424 16.666 15.0003 16.666H8.33366C7.89163 16.666 7.46771 16.4904 7.15515 16.1779C6.84259 15.8653 6.66699 15.4414 6.66699 14.9993V8.33268Z" stroke="#0096DE" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.333 6.66732V5.00065C13.333 4.55862 13.1574 4.1347 12.8449 3.82214C12.5323 3.50958 12.1084 3.33398 11.6663 3.33398H4.99967C4.55765 3.33398 4.13372 3.50958 3.82116 3.82214C3.5086 4.1347 3.33301 4.55862 3.33301 5.00065V11.6673C3.33301 12.1093 3.5086 12.5333 3.82116 12.8458C4.13372 13.1584 4.55765 13.334 4.99967 13.334H6.66634" stroke="#0096DE" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></g><defs><clipPath id="clip0_38_32111"><rect width="20" height="20" fill="white"></rect></clipPath></defs></svg>}
                              </span>

                              {/* Button Text */}
                              <span className="text-[12px] font-bold">
                                {button.text || `Button ${index + 1}`}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Third button or "See all options" */}
                        {form.buttons.length >= 3 && (
                          <div>
                            <div className="border-t border-gray-200 wark:border-gray-700 my-1"></div>
                            <div className="text-center px-1 rounded-md flex items-center justify-center text-[#0277BD]">
                              <span className="mr-1">
                                {showSeeAllOptions ? (
                                  <MoreHorizontal className="h-4 w-4" />
                                ) : (
                                  // Show the third button's icon
                                  <>
                                    {form.buttons[2]?.type === 'URL' && <svg width="19px" height="19px" viewBox="0 0 24 24" fill="#0096DE" xmlns="http://www.w3.org/2000/svg"><path d="M13 3L16.293 6.293L9.29297 13.293L10.707 14.707L17.707 7.707L21 11V3H13Z"></path><path d="M19 19H5V5H12L10 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V14L19 12V19Z"></path></svg>}
                                    {form.buttons[2]?.type === 'PHONE_NUMBER' && <svg xmlns="http://www.w3.org/2000/svg" width="19px" height="19px" fill="#0096DE" viewBox="0 0 18 18"><path d="M17.01 12.38C15.78 12.38 14.59 12.18 13.48 11.82C13.3061 11.7611 13.1191 11.7523 12.9405 11.7948C12.7618 11.8372 12.5988 11.9291 12.47 12.06L10.9 14.03C8.07 12.68 5.42 10.13 4.01 7.2L5.96 5.54C6.23 5.26 6.31 4.87 6.2 4.52C5.83 3.41 5.64 2.22 5.64 0.99C5.64 0.45 5.19 0 4.65 0H1.19C0.65 0 0 0.24 0 0.99C0 10.28 7.73 18 17.01 18C17.72 18 18 17.37 18 16.82V13.37C18 12.83 17.55 12.38 17.01 12.38Z"></path></svg>}
                                    {form.buttons[2]?.type === 'COPY_CODE' && <svg width="19px" height="19px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_38_32111)"><path d="M6.66699 8.33268C6.66699 7.89065 6.84259 7.46673 7.15515 7.15417C7.46771 6.84161 7.89163 6.66602 8.33366 6.66602H15.0003C15.4424 6.66602 15.8663 6.84161 16.1788 7.15417C16.4914 7.46673 16.667 7.89065 16.667 8.33268V14.9993C16.667 15.4414 16.4914 15.8653 16.1788 16.1779C15.8663 16.4904 15.4424 16.666 15.0003 16.666H8.33366C7.89163 16.666 7.46771 16.4904 7.15515 16.1779C6.84259 15.8653 6.66699 15.4414 6.66699 14.9993V8.33268Z" stroke="#0096DE" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.333 6.66732V5.00065C13.333 4.55862 13.1574 4.1347 12.8449 3.82214C12.5323 3.50958 12.1084 3.33398 11.6663 3.33398H4.99967C4.55765 3.33398 4.13372 3.50958 3.82116 3.82214C3.5086 4.1347 3.33301 4.55862 3.33301 5.00065V11.6673C3.33301 12.1093 3.5086 12.5333 3.82116 12.8458C4.13372 13.1584 4.55765 13.334 4.99967 13.334H6.66634" stroke="#0096DE" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path></g><defs><clipPath id="clip0_38_32111"><rect width="20" height="20" fill="white"></rect></clipPath></defs></svg>}
                                  </>
                                )}
                              </span>
                              <span className="text-[12px] font-bold">
                                {showSeeAllOptions ? "See all options" : (form.buttons[2]?.text || "Button 3")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Spacer */}
            <div className="flex-1 min-h-[150px]"></div>

            {/* Template Message */}
            <div className="flex justify-end mb-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState<EditTemplateForm>({
    name: '',
    category: '',
    language: '',
    content: '',
    wabaId: '',
    variables: [],
    footerText: '',
    headerType: 'none',
    headerText: '',
    mediaType: '',
    mediaHandle: '',
    includeButtons: false,
    buttonType: 'NONE',
    buttons: []
  });

  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone');
  const [totalButtonCount, setTotalButtonCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [footerCharCount, setFooterCharCount] = useState(0);
  const [showUrlInfo, setShowUrlInfo] = useState(false);
  const [footerText, setFooterText] = useState('');

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
      fetchUserData();
    }
  }, [templateId]);

  // Update total button count when buttons change
  useEffect(() => {
    setTotalButtonCount(form.buttons.length);
  }, [form.buttons]);

  useEffect(() => {
    setCharacterCount(form.content.length);
  }, [form.content]);

  useEffect(() => {
    setFooterCharCount(footerText.length);
  }, [footerText]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}`);

      if (response.ok) {
        const data = await response.json();
        const template = data.template;

        // Parse template data and populate form
        const headerComponent = template.components?.find((c: any) => c.type === 'HEADER');
        const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
        const footerComponent = template.components?.find((c: any) => c.type === 'FOOTER');
        const buttonsComponent = template.components?.find((c: any) => c.type === 'BUTTONS');

        // Extract variables from body text
        const variables: Variable[] = [];
        const variableMatches = bodyComponent?.text?.match(/\{\{(\d+)\}\}/g);
        if (variableMatches) {
          variableMatches.forEach((match: string, index: number) => {
            const exampleText = bodyComponent?.example?.body_text?.[0]?.[index] || '';
            variables.push({
              name: `Variable ${index + 1}`,
              example: exampleText
            });
          });
        }

        // Parse buttons
        const buttons: ButtonOption[] = [];
        if (buttonsComponent?.buttons) {
          buttonsComponent.buttons.forEach((btn: any) => {
            const button: ButtonOption = {
              type: btn.type,
              text: btn.text
            };

            if (btn.type === 'URL') {
              button.url = btn.url;
              button.urlType = btn.url?.includes('{{') ? 'dynamic' : 'static';
              if (btn.example?.[0]) {
                button.urlExample = btn.example[0];
              }
            } else if (btn.type === 'PHONE_NUMBER') {
              button.phone_number = btn.phone_number;
            } else if (btn.type === 'COPY_CODE') {
              button.copy_code = btn.copy_code;
            }

            buttons.push(button);
          });
        }

        // Set footer text
        const footerText = footerComponent?.text || '';
        setFooterText(footerText);

        // Populate form
        setForm({
          name: template.name,
          category: template.category.toUpperCase(),
          language: template.language,
          content: bodyComponent?.text || '',
          wabaId: template.wabaId,
          variables: variables,
          footerText: footerText,
          headerType: headerComponent ?
            (headerComponent.format === 'TEXT' ? 'text' : 'media') : 'none',
          headerText: headerComponent?.text || '',
          mediaType: headerComponent?.format || '',
          mediaHandle: headerComponent?.format ? 'existing-media' : '',
          includeButtons: buttons.length > 0,
          buttonType: buttons.length > 0 ? 'MULTIPLE' : 'NONE',
          buttons: buttons
        });

        setTemplate(template);
      } else {
        toast.error('Template not found');
        router.push('/templates');
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
      toast.error('Failed to fetch template');
      router.push('/templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setWabaAccounts(data.user.wabaAccounts || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type and size
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

      // Create FormData for file upload
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
          mediaType: detectedMediaType as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
          mediaHandle: data.handle
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

    setForm(prev => ({
      ...prev,
      buttonType,
      includeButtons: buttonType !== 'NONE',
      buttons: buttonType === 'NONE' ? [] : prev.buttons
    }));
  };

  const toggleButtonType = (type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'COPY_CODE') => {
    const exists = form.buttons.some(button => button.type === type);

    if (exists) {
      setForm(prev => ({
        ...prev,
        buttons: prev.buttons.filter(button => button.type !== type)
      }));
    } else {
      if (form.buttons.length >= 10) {
        toast.error('Maximum of 10 buttons allowed in total');
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
    }
  };

  const handleUpdateTemplate = async () => {
    if (!form.name || !form.category || !form.content || !form.wabaId || !form.language) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (form.headerType === 'media' && (!form.mediaType || !form.mediaHandle)) {
      toast.error('Please upload a media file for media templates');
      return;
    }

    if (form.buttonType !== 'NONE' && form.buttons.length === 0) {
      toast.error('Please add at least one button or select "None" for button type');
      return;
    }

    try {
      setUpdating(true);

      // Prepare components for API request
      const components = [];

      // Add header component if needed
      if (form.headerType === 'media') {
        const headerComponent: any = {
          type: 'HEADER',
          format: form.mediaType
        };

        // Only add example for new media uploads, not existing media
        if (form.mediaType && form.mediaHandle && form.mediaHandle !== 'existing-media') {
          headerComponent.example = {
            header_handle: [form.mediaHandle]
          };
        }

        if (form.headerText) {
          headerComponent.text = form.headerText;
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

      // Add example if variables are present
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
              if (button.urlType === 'dynamic' && button.urlExample) {
                buttonData.example = [button.urlExample];
              }
            } else if (button.type === 'PHONE_NUMBER') {
              buttonData.phone_number = button.phone_number;
            } else if (button.type === 'COPY_CODE') {
              buttonData.copy_code = button.copy_code;
            }

            return buttonData;
          })
        };

        components.push(buttonsComponent);
      }

      const payload = {
        components: components,
        category: form.category
      };

      console.log('Sending update payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`/api/templates/${templateId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (response.ok) {
        toast.success('Template updated successfully and resubmitted for approval!');
        router.push('/templates');
      } else {
        console.error('Update failed:', data);
        toast.error(data.error || 'Failed to update template');
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Template deleted successfully');
        router.push('/templates');
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const addVariable = () => {
    const newVariableIndex = form.variables.length + 1;
    const cursorPosition = document.getElementById('content')?.selectionStart || form.content.length;

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
    const updatedContent = form.content.replace(
      new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'),
      ''
    );

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

  const countButtonsByType = (type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY' | 'COPY_CODE') => {
    return form.buttons.filter(button => button.type === type).length;
  };

  const isFormValid = (): boolean => {
    const isBasicInfoValid = form.name && form.category && form.language && form.wabaId;
    const isContentValid = form.content?.trim().length > 0;
    const isMediaValid = form.headerType !== 'media' || (form.mediaType && form.mediaHandle);
    const isButtonsValid = form.buttonType === 'NONE' || form.buttons.some(b => b.text);

    return isBasicInfoValid && isContentValid && isMediaValid && isButtonsValid;
  };

  const toggleUrlInfo = () => {
    setShowUrlInfo(!showUrlInfo);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Template Edit Header */}
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-gray-700" onClick={() => router.back()}>
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-base font-medium">Edit Template: {template.name}</h1>
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

              <Button variant="outline" className="border-gray-300 text-gray-700" onClick={() => router.back()}>
                Cancel
              </Button>

              <Button
                onClick={handleUpdateTemplate}
                disabled={updating || !isFormValid()}
                className="bg-teal-500 hover:bg-teal-600 text-white border-none"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Resubmit for Approval'
                )}
              </Button>
            </div>
          </div>

          {/* Edit Limitation Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Template Editing Guidelines
                </p>
                <p className="text-sm text-blue-700">
                  An approved template can be edited once per day, up to 10 times per month.
                  After editing, the template will be resubmitted for WhatsApp approval.
                </p>
              </div>
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
                    disabled // Template name cannot be changed
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
                  <div className="text-blue-600 bg-blue-50 border-blue-200 rounded-md px-3 py-1 text-sm border">
                    {languageOptions.find(l => l.value === form.language)?.label}
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-sm font-medium mb-3">Template for {languageOptions.find(l => l.value === form.language)?.label} language</p>
                </div>
              </div>

              {/* Header Section */}
              <div className="p-5 border border-gray-200 rounded-md">
                <h3 className="text-sm font-medium mb-2">Header (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">Add a title, or select the media type you want to get approved for this template&apos;s header</p>

                <RadioGroup
                  value={form.headerType}
                  onValueChange={(value: 'none' | 'text' | 'media') =>
                    setForm(prev => ({
                      ...prev,
                      headerType: value,
                      headerText: value === 'none' ? '' : prev.headerText,
                      mediaType: value === 'none' ? '' : prev.mediaType,
                      mediaHandle: value === 'none' ? '' : prev.mediaHandle
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
                    <RadioGroupItem value="media" id="header-media" />
                    <Label htmlFor="header-media" className="text-sm">Media</Label>
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

                {form.headerType === 'media' && (
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
                      <Label>Media File</Label>
                      {form.mediaHandle ? (
                        <div className="border-2 border-dashed border-green-200 bg-green-50 wark:border-green-800 wark:bg-green-950 rounded-lg p-4 mt-2">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-green-700 wark:text-green-300">
                                {form.mediaHandle === 'existing-media' ? 'Using existing media' : 'File uploaded successfully'}
                              </p>
                              <p className="text-sm text-green-600 wark:text-green-400">
                                {form.mediaType} • Ready to use
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setForm(prev => ({ ...prev, mediaHandle: '', mediaType: '' }))}
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
                              <p className="font-medium">Upload media file</p>
                              <p className="text-sm text-gray-500">
                                Images, videos, or documents (max 16MB)
                              </p>
                            </div>
                            <Input
                              type="file"
                              accept="image/*,video/*,.pdf,.doc,.docx"
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

              {/* Body Section */}
              <div className="p-5 border border-gray-200 rounded-md">
                <h3 className="text-sm font-medium mb-2">Body</h3>
                <p className="text-sm text-gray-600 mb-4">The WhatsApp message in the language you have selected</p>

                <Textarea
                  id="content"
                  placeholder="Enter your message here..."
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
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
                    <button className="text-gray-500 hover:text-gray-700">
                      <Bold size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Italic size={16} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Underline size={16} />
                    </button>
                  </div>
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

              {/* Guidelines Card */}
              <div className="p-5 border border-yellow-200 bg-yellow-50 rounded-md">
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

            {/* Right Column: Preview */}
            <div className="space-y-4">
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

              {/* Delete Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Permanently delete this template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Template
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
