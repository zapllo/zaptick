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
  Info,
  ArrowRight,
  Check,
  Minus,
  MoreVertical,
  Play,
  MessageSquare,
  ShieldCheck,
  Globe,
  MousePointerClick,
  Calendar,
  MapPin,
  ShoppingCart,
  AlignLeft,
  Brackets,
  LayoutIcon,
  Strikethrough
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
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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


// Add these fields to the EditTemplateForm interface
interface EditTemplateForm {
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
  mediaUrl: string;
  // Add S3 URL fields
  s3Url?: string;
  s3Handle?: string;
  includeButtons: boolean;
  buttonType: 'NONE' | 'MULTIPLE';
  buttons: ButtonOption[];
  carouselCards: CarouselCard[];
  // Add limited time offer specific fields
  offerExpirationDate: string;
  offerExpirationTime: string;
  couponCode: string;
}

// Update CarouselCard interface to include S3 data
interface CarouselCard {
  header?: {
    format: 'IMAGE' | 'VIDEO';
    mediaHandle?: string;
    mediaUrl?: string;
    // Add S3 URL fields for carousel cards
    s3Url?: string;
    s3Handle?: string;
  };
  body: {
    text: string;
  };
  buttons?: ButtonOption[];
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
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt_BR', label: 'Portuguese (Brazil)' },
  { value: 'it', label: 'Italian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'id', label: 'Indonesian' },
  { value: 'zh_CN', label: 'Chinese (Simplified)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' },
];

// Category options
const categoryOptions = [
  {
    id: 'UTILITY',
    name: 'Utility',
    description: 'Send messages about an existing order or account',
    icon: <AlertCircle className="w-5 h-5" />
  },
  {
    id: 'MARKETING',
    name: 'Marketing',
    description: 'Send promotions or information about your product, service or business',
    icon: <Send className="w-5 h-5" />
  },
  {
    id: 'AUTHENTICATION',
    name: 'Authentication',
    description: 'Send one-time passwords or authentication codes for verification',
    icon: <ShieldCheck className="w-5 h-5" />
  },
  {
    id: 'CAROUSEL',
    name: 'Carousel',
    description: 'Send multiple cards with images, text, and buttons in a carousel format',
    icon: <LayoutIcon className="w-5 h-5" />
  },
  {
    id: 'CAROUSEL_UTILITY',
    name: 'Utility Carousel',
    description: 'Send multiple informational cards about orders, accounts, or services in a carousel format',
    icon: <LayoutIcon className="w-5 h-5" />
  },
  // {
  //   id: 'LIMITED_TIME_OFFER',
  //   name: 'Limited Time Offer',
  //   description: 'Send promotional messages with expiration countdown and coupon codes',
  //   icon: <Calendar className="w-5 h-5" />
  // }
];

// Device type for preview
type DeviceType = 'iphone' | 'android';

// Helper function to get media type icon
const getMediaTypeIcon = (mediaType?: string) => {
  switch (mediaType) {
    case 'IMAGE': return <FileImage className="h-8 w-8 text-gray-500" />;
    case 'VIDEO': return <Video className="h-8 w-8 text-gray-500" />;
    case 'DOCUMENT': return <File className="h-8 w-8 text-gray-500" />;
    default: return <File className="h-8 w-8 text-gray-500" />;
  }
};

/// Update the WhatsAppPreview component to handle S3 URLs properly
const WhatsAppPreview = ({ form, deviceType, footerText, authSettings }: {
  form: EditTemplateForm,
  deviceType: DeviceType,
  footerText: string,
  authSettings: any
}) => {

  // Helper function to format text with proper line breaks and formatting
  const formatWhatsAppText = (text: string) => {
    if (!text) return '';

    // First, handle variables
    let formattedText = text
      .replace(/\{\{1\}\}/g, form.variables[0]?.example || "John")
      .replace(/\{\{2\}\}/g, form.variables[1]?.example || "SAVE20")
      .replace(/\{\{3\}\}/g, form.variables[2]?.example || "June 30, 2024")
      .replace(/\{\{4\}\}/g, form.variables[3]?.example || "Sample Value")
      .replace(/\{\{5\}\}/g, form.variables[4]?.example || "Example");

    // Handle WhatsApp formatting
    formattedText = formattedText
      .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/~(.*?)~/g, '<span style="text-decoration: line-through;">$1</span>');

    // Handle line breaks - convert \n to <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
  };

  // For authentication templates, show a different preview
  if (form.category === 'AUTHENTICATION') {
    const sampleCode = authSettings.codeLength === 8
      ? 'A12B3C4D'  // Alphanumeric for 8-character
      : '123456'.substring(0, authSettings.codeLength);  // Numeric for other lengths

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
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex mb-3 mt-2">
                <div className="relative w-full max-w-[85%]">
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
                      className="absolute left-[-8px] top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-b-0 border-l-0 border-solid border-transparent border-r-[#ffffff]"
                      style={{ transform: 'translateY(6px)' }}
                    ></div>
                  )}

                  <div className="bg-white mt-12 p-3 rounded-lg ml-1 shadow-sm">
                    {/* Authentication template preview */}
                    <div className="text-[12px] max-w-full whitespace-pre-wrap break-words">
                      <div>
                        <p className="font-bold">WhatsApp Authentication</p>
                        <p className="mt-2">Your verification code is: <span className="font-bold">{sampleCode}</span></p>
                        <p className="mt-2">This code will expire in {authSettings.codeExpirationMinutes} minutes.</p>
                        <p className="mt-1">Do not share this code with anyone.</p>
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-1 pt-2 text-[10px] opacity-70">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Code entry button */}
                    {authSettings.addCodeEntryOption && (
                      <div className="mt-1 pt-2 border-t border-gray-200">
                        <div className="space-y-1.5">
                          <button className="w-full text-left gap-2 text-[12px] text-[#0097DF] font-medium flex justify-center items-center">
                            <svg width="13px" height="13px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clipPath="url(#clip0_38_32111)">
                                <path d="M6.66699 8.33268C6.66699 7.89065 6.84259 7.46673 7.15515 7.15417C7.46771 6.84161 7.89163 6.66602 8.33366 6.66602H15.0003C15.4424 6.66602 15.8663 6.84161 16.1788 7.15417C16.4914 7.46673 16.667 7.89065 16.667 8.33268V14.9993C16.667 15.4414 16.4914 15.8653 16.1788 16.1779C15.8663 16.4904 15.4424 16.666 15.0003 16.666H8.33366C7.89163 16.666 7.46771 16.4904 7.15515 16.1779C6.84259 15.8653 6.66699 15.4414 6.66699 14.9993V8.33268Z" stroke="#0096DE" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path>
                                <path d="M13.333 6.66732V5.00065C13.333 4.55862 13.1574 4.1347 12.8449 3.82214C12.5323 3.50958 12.1084 3.33398 11.6663 3.33398H4.99967C4.55765 3.33398 4.13372 3.50958 3.82116 3.82214C3.5086 4.1347 3.33301 4.55862 3.33301 5.00065V11.6673C3.33301 12.1093 3.5086 12.5333 3.82116 12.8458C4.13372 13.1584 4.55765 13.334 4.99967 13.334H6.66634" stroke="#0096DE" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path>
                              </g>
                              <defs>
                                <clipPath id="clip0_38_32111">
                                  <rect width="20" height="20" fill="white"></rect>
                                </clipPath>
                              </defs>
                            </svg>
                            Enter code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For carousel templates, show carousel preview
  if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
    const formattedContent = formatWhatsAppText(form.content);

    return (
      <div className="device-mockup mx-auto max-w-[320px]">
        <div
          className={` relative ${deviceType === 'iphone' ? 'pt-12 pb-[40px]' : 'pt-[40px] pb-[30px]'}`}
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
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex mb-3 mt-2">
                <div className="relative w-full max-w-[85%]">
                  {/* Bubble tail */}
                  {deviceType !== 'iphone' && (
                    <div
                      className="absolute left-[-8px] top-0 w-0 h-0 border-t-[8px] border-r-[8px] border-b-0 border-l-0 border-solid border-transparent border-r-[#ffffff]"
                      style={{ transform: 'translateY(6px)' }}
                    ></div>
                  )}

                  <div className="bg-white mt-12 p-3 rounded-lg ml-1 shadow-sm">
                    {/* Carousel preview */}
                    <div className="text-[12px] max-w-full">
                      {/* Body text before carousel */}
                      {form.content && (
                        <div className="mb-3 break-words">
                          <div dangerouslySetInnerHTML={{ __html: formattedContent || "" }} />
                        </div>
                      )}

                      <div className="flex justify-end items-center gap-1 pt-2 text-[10px] opacity-70">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className=" mt-1  rounded-lg ml-1 ">
                    {/* Carousel preview */}
                    <div className="text-[12px] max-w-full">
                      {/* Carousel cards container */}
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide w-[270px] pb-2">
                        {form.carouselCards.length > 0 ? form.carouselCards.map((card, index) => (
                          <div key={index} className="flex-shrink-0 w-[180px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            {/* Card header media */}
                            {card.header && card.header.mediaUrl && (
                              <div className="h-32 bg-gray-200 overflow-hidden">
                                {card.header.format === 'IMAGE' ? (
                                  <img
                                    src={card.header.mediaUrl}
                                    alt={`Card ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.log('Failed to load carousel image:', card.header?.mediaUrl);
                                      const img = e.target as HTMLImageElement;
                                      img.style.display = 'none';
                                      // Show fallback placeholder
                                      const parent = img.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `
                                          <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <svg class="h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                            </svg>
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <Play className="h-6 w-6 text-gray-500" />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Card body */}
                            <div className="p-2">
                              <p className="text-[10px] mb-2 break-words">
                                {card.body.text || `Card ${index + 1} content`}
                              </p>

                              {/* Card buttons */}
                              {card.buttons && card.buttons.length > 0 && (
                                <div className="space-y-1">
                                  {card.buttons.map((button, buttonIndex) => (
                                    <button
                                      key={buttonIndex}
                                      className="w-full text-left text-[10px] text-[#0097DF] font-medium flex justify-center items-center gap-1 py-1"
                                    >
                                      {button.type === 'URL' && <ExternalLink className="h-3 w-3" />}
                                      {button.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3" />}
                                      {button.text || `Button ${buttonIndex + 1}`}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="flex-shrink-0 w-[200px] border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                            <div className="h-20 bg-gray-200 flex items-center justify-center">
                              <LayoutIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="p-2">
                              <p className="text-[10px] text-gray-500">No cards added yet</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular template preview - Updated to match create template styling
  const previewContent = form.content
    .replace(/\{\{1\}\}/g, form.variables[0]?.example || "John")
    .replace(/\{\{2\}\}/g, form.variables[1]?.example || "SAVE20")
    .replace(/\{\{3\}\}/g, form.variables[2]?.example || "June 30, 2024")
    .replace(/\{\{4\}\}/g, form.variables[3]?.example || "Sample Value")
    .replace(/\{\{5\}\}/g, form.variables[4]?.example || "Example");

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Updated button display logic to match create template
  const displayButtons = form.buttons.length <= 3 ? form.buttons : form.buttons.slice(0, 2);
  const showSeeMoreOptions = form.buttons.length > 3;

  const formattedContent = formatWhatsAppText(form.content);

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
          <div className="flex-1 p-4 mt-8 overflow-y-auto">
            {previewContent && (
              <div className="flex mb-3 -mt-2">
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
                    ></div>
                  )}

                  <div className="bg-white mt-12 p-3 rounded-lg ml-1 shadow-sm">
                    {/* Media Header */}
                    {(form.headerType === 'image' || form.headerType === 'video' || form.headerType === 'document') && form.mediaUrl && (
                      <div className="mb-2">
                        {form.headerText && (
                          <div className="text-xs font-medium mb-2">{form.headerText}</div>
                        )}
                        <div className="bg-gray-200 rounded overflow-hidden">
                          {form.headerType === 'image' && (
                            <img
                              src={form.mediaUrl}
                              alt="Header image"
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (img && img.style) {
                                  img.style.display = 'none';
                                  const sibling = img.nextElementSibling as HTMLElement;
                                  if (sibling && sibling.style) {
                                    sibling.style.display = 'flex';
                                  }
                                }
                              }}
                            />
                          )}
                          {form.headerType === 'video' && (
                            <div className="relative">
                              <video
                                src={form.mediaUrl}
                                className="w-full h-32 object-cover"
                                controls={false}
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 rounded-full p-2">
                                  <Play className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
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
                          <div className="p-4 flex items-center justify-center gap-3 h-32" style={{ display: 'none' }}>
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
                    <div className="text-[12px] max-w-full whitespace-pre-wrap break-words">
                      <div dangerouslySetInnerHTML={{ __html: formattedContent || "" }} />
                    </div>

                    {/* Footer */}
                    {footerText && (
                      <div className="text-[10px] text-gray-500 border-gray-200 pt-2">
                        {footerText}
                      </div>
                    )}

                    <div className="flex justify-end items-center gap-1 pt-2 text-[10px] opacity-70">
                      <span>{currentTime}</span>
                    </div>

                    {/* Buttons section - Updated styling to match create template */}
                    {form.buttons.length > 0 && (
                      <div className="mt-1">
                        <div className="space-y-1.5">
                          {displayButtons.map((button, index) => (
                            <button
                              key={index}
                              className={`w-full text-center gap-2 text-[12px] text-[#0097DF] p-1 bg-gray-100 rounded font-medium flex justify-center items-center ${index < displayButtons.length - 1 ? 'border border-gray-200' : ''}`}
                            >
                              {button.type === 'URL' && <svg width="13px" height="13px" className="" viewBox="0 0 24 24" fill="#0096DE" xmlns="http://www.w3.org/2000/svg"><path d="M13 3L16.293 6.293L9.29297 13.293L10.707 14.707L17.707 7.707L21 11V3H13Z"></path><path d="M19 19H5V5H12L10 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V14L19 12V19Z"></path></svg>}
                              {button.type === 'PHONE_NUMBER' && <svg xmlns="http://www.w3.org/2000/svg" width="13px" height="13px" fill="#0096DE" viewBox="0 0 18 18"><path d="M17.01 12.38C15.78 12.38 14.59 12.18 13.48 11.82C13.3061 11.7611 13.1191 11.7523 12.9405 11.7948C12.7618 11.8372 12.5988 11.9291 12.47 12.06L10.9 14.03C8.07 12.68 5.42 10.13 4.01 7.2L5.96 5.54C6.23 5.26 6.31 4.87 6.2 4.52C5.83 3.41 5.64 2.22 5.64 0.99C5.64 0.45 5.19 0 4.65 0H1.19C0.65 0 0 0.24 0 0.99C0 10.28 7.73 18 17.01 18C17.72 18 18 17.37 18 16.82V13.37C18 12.83 17.55 12.38 17.01 12.38Z"></path></svg>}
                              {button.type === 'COPY_CODE' && <svg width="13px" height="13px" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_38_32111)"><path d="M6.66699 8.33268C6.66699 7.89065 6.84259 7.46673 7.15515 7.15417C7.46771 6.84161 7.89163 6.66602 8.33366 6.66602H15.0003C15.4424 6.66602 15.8663 6.84161 16.1788 7.15417C16.4914 7.46673 16.667 7.89065 16.667 8.33268V14.9993C16.667 15.4414 16.4914 15.8653 16.1788 16.1779C15.8663 16.4904 15.4424 16.666 15.0003 16.666H8.33366C7.89163 16.666 7.46771 16.4904 7.15515 16.1779C6.84259 15.8653 6.66699 15.4414 6.66699 14.9993V8.33268Z" stroke="#0096DE" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13.333 6.66732V5.00065C13.333 4.55862 13.1574 4.1347 12.8449 3.82214C12.5323 3.50958 12.1084 3.33398 11.6663 3.33398H4.99967C4.55765 3.33398 4.13372 3.50958 3.82116 3.82214C3.5086 4.1347 3.33301 4.55862 3.33301 5.00065V11.6673C3.33301 12.1093 3.5086 12.5333 3.82116 12.8458C4.13372 13.1584 4.55765 13.334 4.99967 13.334H6.66634" stroke="#0096DE" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"></path></g><defs><clipPath id="clip0_38_32111"><rect width="20" height="20" fill="white"></rect></clipPath></defs></svg>}
                              {button.text || ``}
                            </button>
                          ))}
                          {showSeeMoreOptions && (
                            <button className="w-full text-center pt-2 justify-center text-[12px] text-[#0097DF] font-medium flex gap-2 border-t items-center">
                              <svg width="13px" height="13px" viewBox="0 0 19 16" fill="#0096DE" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5C1.17 6.5 0.5 7.17 0.5 8C0.5 8.83 1.17 9.5 2 9.5C2.83 9.5 3.5 8.83 3.5 8C3.5 7.17 2.83 6.5 2 6.5ZM2 0.5C1.17 0.5 0.5 1.17 0.5 2C0.5 2.83 1.17 3.5 2 3.5C2.83 3.5 3.5 2.83 3.5 2C3.5 1.17 2.83 0.5 2 0.5ZM2 12.5C1.17 12.5 0.5 13.18 0.5 14C0.5 14.82 1.18 15.5 2 15.5C2.82 15.5 3.5 14.82 3.5 14C3.5 13.18 2.83 12.5 2 12.5ZM5 15H19V13H5V15ZM5 9H19V7H5V9ZM5 1V3H19V1H5Z"></path></svg>
                              See more options
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
  const [currentStep, setCurrentStep] = useState(1);
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
    mediaUrl: '',
    includeButtons: false,
    buttonType: 'NONE',
    buttons: [],
    carouselCards: [],
    // Add limited time offer fields
    offerExpirationDate: '',
    offerExpirationTime: '',
    couponCode: ''
  });

  const [wabaAccounts, setWabaAccounts] = useState<WabaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone');
  const [characterCount, setCharacterCount] = useState(0);
  const [footerText, setFooterText] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [authSettings, setAuthSettings] = useState({
    codeExpirationMinutes: 10,
    codeLength: 6,
    addCodeEntryOption: true
  });
  const [offerSettings, setOfferSettings] = useState({
    expirationTimeMs: 0,
    couponCode: ''
  });

  // Steps configuration based on category
  const getSteps = () => {
    if (form.category === 'AUTHENTICATION') {
      return [{ number: 1, title: 'Authentication Template', completed: false }];
    }
    if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
      return [
        { number: 1, title: 'Basic Info', completed: false },
        { number: 2, title: 'Carousel Cards', completed: false }
      ];
    }
    if (form.category === 'LIMITED_TIME_OFFER') {
      return [
        { number: 1, title: 'Basic Info', completed: false },
        { number: 2, title: 'Content & Offer', completed: false },
        { number: 3, title: 'Buttons', completed: false },
        { number: 4, title: 'Variables', completed: false }
      ];
    }
    return [
      { number: 1, title: 'Basic Info', completed: false },
      { number: 2, title: 'Content', completed: false },
      { number: 3, title: 'Buttons', completed: false },
      { number: 4, title: 'Variables', completed: false }
    ];
  };

  const steps = getSteps();

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
      fetchUserData();
    }
  }, [templateId]);

  useEffect(() => {
    setCharacterCount(form.content.length);
  }, [form.content]);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (form.category === 'AUTHENTICATION') {
      let filledFields = 0;
      let totalFields = 4; // name, category, language, wabaId

      if (form.name) filledFields++;
      if (form.category) filledFields++;
      if (form.language) filledFields++;
      if (form.wabaId) filledFields++;

      return Math.round((filledFields / totalFields) * 100);
    }

    if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
      let filledFields = 0;
      let totalFields = 5; // name, category, language, wabaId, cards

      if (form.name) filledFields++;
      if (form.category) filledFields++;
      if (form.language) filledFields++;
      if (form.wabaId) filledFields++;
      if (form.carouselCards.length > 0 && form.carouselCards.every(card => card.body.text)) filledFields++;

      return Math.round((filledFields / totalFields) * 100);
    }

    let filledFields = 0;
    let totalFields = 0;

    // Step 1 fields
    if (form.name) filledFields++;
    if (form.category) filledFields++;
    if (form.language) filledFields++;
    if (form.wabaId) filledFields++;
    totalFields += 4;

    // Step 2 fields
    if (form.content) filledFields++;
    totalFields += 1;

    if (form.headerType !== 'none') {
      if (form.headerType === 'text' && form.headerText) filledFields++;
      if (['image', 'video', 'document'].includes(form.headerType) && form.mediaHandle) filledFields++;
      totalFields += 1;
    }

    if (form.buttons.length > 0) {
      const validButtons = form.buttons.filter(button =>
        button.text && (
          (button.type === 'URL' && button.url) ||
          (button.type === 'PHONE_NUMBER' && button.phone_number) ||
          (button.type === 'COPY_CODE' && button.copy_code) ||
          button.type === 'QUICK_REPLY'
        )
      ).length;

      filledFields += validButtons;
      totalFields += form.buttons.length;
    }

    return Math.round((filledFields / totalFields) * 100);
  };

  // Validate template name
  const validateTemplateName = (name: string) => {
    if (!name) {
      setNameError("Template name is required");
      return false;
    }

    if (name.length > 512) {
      setNameError("Template name must be less than 512 characters");
      return false;
    }

    if (!/^[a-z0-9_]+$/.test(name)) {
      setNameError("Only lowercase letters, numbers, and underscores are allowed");
      return false;
    }

    setNameError(null);
    return true;
  };

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}`);

      if (response.ok) {
        const data = await response.json();

        // Check if the response has the expected structure
        if (!data.success || !data.template) {
          console.error('Invalid response structure:', data);
          toast.error('Invalid response from server');
          router.push('/templates');
          return;
        }

        const template = data.template;

        // Parse template data and populate form
        const headerComponent = template.components?.find((c: any) => c.type === 'HEADER');
        const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
        const footerComponent = template.components?.find((c: any) => c.type === 'FOOTER');
        const buttonsComponent = template.components?.find((c: any) => c.type === 'BUTTONS');
        const carouselComponent = template.components?.find((c: any) => c.type === 'CAROUSEL');

        // Extract variables from body text
        const variables: Variable[] = [];
        const variableMatches = bodyComponent?.text?.match(/\{\{(\d+)\}\}/g);
        if (variableMatches) {
          variableMatches.forEach((match: string, index: number) => {
            const variableNumber = parseInt(match.replace(/[{}]/g, ''));
            const exampleText = bodyComponent?.example?.body_text?.[0]?.[variableNumber - 1] || '';
            variables.push({
              name: `Variable ${variableNumber}`,
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

        // Parse carousel cards with S3 URLs
        const carouselCards: CarouselCard[] = [];
        if (carouselComponent?.cards) {
          carouselComponent.cards.forEach((card: any) => {
            const headerComp = card.components?.find((c: any) => c.type === 'HEADER');
            const bodyComp = card.components?.find((c: any) => c.type === 'BODY');
            const buttonsComp = card.components?.find((c: any) => c.type === 'BUTTONS');

            const carouselCard: CarouselCard = {
              body: { text: bodyComp?.text || '' }
            };

            if (headerComp) {
              carouselCard.header = {
                format: headerComp.format,
                mediaHandle: headerComp.example?.header_handle?.[0] || '',
                // Use S3 URL if available, otherwise use WhatsApp media URL or empty string
                mediaUrl: headerComp.mediaUrl || headerComp.example?.header_handle?.[0] || ''
              };
            }

            if (buttonsComp?.buttons) {
              carouselCard.buttons = buttonsComp.buttons.map((btn: any) => ({
                type: btn.type,
                text: btn.text,
                url: btn.url,
                phone_number: btn.phone_number
              }));
            }

            carouselCards.push(carouselCard);
          });
        }

        // Set footer text
        const footerText = footerComponent?.text || '';
        setFooterText(footerText);

        // Determine header type and media info with S3 URL support
        let headerType: 'none' | 'text' | 'image' | 'video' | 'document' = 'none';
        let mediaType = '';
        let mediaUrl = '';
        let mediaHandle = '';
        let s3Url = '';
        let s3Handle = '';

        if (headerComponent) {
          if (headerComponent.format === 'TEXT') {
            headerType = 'text';
          } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format)) {
            headerType = headerComponent.format?.toLowerCase() as any;
            mediaType = headerComponent.format;
            mediaHandle = headerComponent.example?.header_handle?.[0] || 'existing-media';

            // Use S3 URL if available, otherwise fallback to WhatsApp media URL
            mediaUrl = headerComponent.mediaUrl || '';
            s3Url = headerComponent.mediaUrl || '';
            s3Handle = headerComponent.s3Handle || '';

            console.log('Header media info:', {
              mediaUrl,
              s3Url,
              s3Handle,
              mediaHandle
            });
          }
        }

        // Parse offer settings if it's a limited time offer template
        let offerExpirationDate = '';
        let offerExpirationTime = '';
        let couponCode = '';

        if (template.category.toUpperCase() === 'LIMITED_TIME_OFFER' && template.offerSettings) {
          if (template.offerSettings.expirationTimeMs) {
            const expirationDate = new Date(template.offerSettings.expirationTimeMs);
            offerExpirationDate = expirationDate.toISOString().split('T')[0];
            offerExpirationTime = expirationDate.toTimeString().split(' ')[0].slice(0, 5);
          }
          couponCode = template.offerSettings.couponCode || '';
        }

        // Populate form
        setForm({
          name: template.name,
          category: template.category.toUpperCase(),
          language: template.language,
          content: bodyComponent?.text || '',
          wabaId: template.wabaId,
          variables: variables,
          footerText: footerText,
          headerType: headerType,
          headerText: headerComponent?.text || '',
          mediaType: mediaType as any,
          mediaHandle: mediaHandle,
          mediaUrl: mediaUrl, // This will be the S3 URL for preview
          includeButtons: buttons.length > 0,
          buttonType: buttons.length > 0 ? 'MULTIPLE' : 'NONE',
          buttons: buttons,
          carouselCards: carouselCards,
          offerExpirationDate: offerExpirationDate,
          offerExpirationTime: offerExpirationTime,
          couponCode: couponCode,
          // Store S3 data for form state
          s3Url: s3Url,
          s3Handle: s3Handle
        });

        // Set current step based on category
        if (template.category.toUpperCase() === 'AUTHENTICATION') {
          setCurrentStep(1);
          // Set auth settings if available
          if (template.authSettings) {
            setAuthSettings({
              codeExpirationMinutes: template.authSettings.codeExpirationMinutes || 10,
              codeLength: template.authSettings.codeLength || 6,
              addCodeEntryOption: template.authSettings.addCodeEntryOption !== false
            });
          }
        } else if (['CAROUSEL', 'CAROUSEL_UTILITY'].includes(template.category.toUpperCase())) {
          setCurrentStep(1);
        } else if (template.category.toUpperCase() === 'LIMITED_TIME_OFFER') {
          setCurrentStep(1);
          // Set offer settings if available
          if (template.offerSettings) {
            setOfferSettings({
              expirationTimeMs: template.offerSettings.expirationTimeMs || 0,
              couponCode: template.offerSettings.couponCode || ''
            });
          }
        } else {
          setCurrentStep(1);
        }

        // Set the template state to indicate successful loading
        setTemplate({
          id: template.id,
          name: template.name,
          category: template.category,
          language: template.language,
          status: template.status as any,
          content: template.content,
          variables: template.variables,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          approvedAt: template.approvedAt,
          lastUsed: template.lastUsed,
          useCount: template.useCount,
          rejectionReason: template.rejectionReason,
          type: template.type as any,
          mediaType: template.mediaType,
          components: template.components,
          whatsappTemplateId: template.whatsappTemplateId,
          wabaId: template.wabaId
        });

      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
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

  // File upload handler
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
      toast.error('Unsupported file type.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', file.type);

      const response = await fetch('/api/media-handle', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({
          ...prev,
          headerType: detectedMediaType.toLowerCase() as 'image' | 'video' | 'document',
          mediaType: detectedMediaType as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
          mediaHandle: data.h,
          mediaUrl: data.url || URL.createObjectURL(file)
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

  // Carousel helper functions
  const addCarouselCard = () => {
    if (form.carouselCards.length >= 10) {
      toast.error('Maximum of 10 carousel cards allowed');
      return;
    }

    const newCard: CarouselCard = {
      body: { text: '' },
      buttons: []
    };

    setForm(prev => ({
      ...prev,
      carouselCards: [...prev.carouselCards, newCard]
    }));
  };

  const updateCarouselCard = (cardIndex: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map((card, index) => {
        if (index === cardIndex) {
          if (field.includes('.')) {
            const [parentField, childField] = field.split('.');
            return {
              ...card,
              [parentField]: {
                ...card[parentField as keyof CarouselCard],
                [childField]: value
              }
            };
          }
          return { ...card, [field]: value };
        }
        return card;
      })
    }));
  };

  const removeCarouselCard = (cardIndex: number) => {
    setForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.filter((_, index) => index !== cardIndex)
    }));
  };

  const addButtonToCarouselCard = (cardIndex: number) => {
    const currentCard = form.carouselCards[cardIndex];
    if (currentCard.buttons && currentCard.buttons.length >= 2) {
      toast.error('Maximum of 2 buttons per card allowed');
      return;
    }

    const newButton: ButtonOption = {
      type: 'QUICK_REPLY',
      text: ''
    };

    setForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map((card, index) => {
        if (index === cardIndex) {
          return {
            ...card,
            buttons: [...(card.buttons || []), newButton]
          };
        }
        return card;
      })
    }));
  };

  const updateCarouselCardButton = (cardIndex: number, buttonIndex: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map((card, index) => {
        if (index === cardIndex) {
          return {
            ...card,
            buttons: card.buttons?.map((button, bIndex) => {
              if (bIndex === buttonIndex) {
                if (field === 'type') {
                  const newButton = { type: value as ButtonOption['type'], text: button.text };
                  if (value === 'URL') {
                    (newButton as any).url = '';
                    (newButton as any).urlType = 'static';
                  }
                  return newButton;
                }
                return { ...button, [field]: value };
              }
              return button;
            }) || []
          };
        }
        return card;
      })
    }));
  };

  const removeCarouselCardButton = (cardIndex: number, buttonIndex: number) => {
    setForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map((card, index) => {
        if (index === cardIndex) {
          return {
            ...card,
            buttons: card.buttons?.filter((_, bIndex) => bIndex !== buttonIndex) || []
          };
        }
        return card;
      })
    }));
  };

  const handleCarouselFileUpload = async (file: File, cardIndex: number) => {
    if (!file) return;

    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 16MB');
      return;
    }

    const allowedTypes = {
      'IMAGE': ['image/jpeg', 'image/png', 'image/gif'],
      'VIDEO': ['video/mp4', 'video/avi', 'video/mov']
    };

    let detectedMediaType: 'IMAGE' | 'VIDEO' | null = null;
    for (const [type, mimeTypes] of Object.entries(allowedTypes)) {
      if (mimeTypes.includes(file.type)) {
        detectedMediaType = type as 'IMAGE' | 'VIDEO';
        break;
      }
    }

    if (!detectedMediaType) {
      toast.error('Unsupported file type. Only images and videos are allowed for carousel.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', file.type);

      const response = await fetch('/api/media-handle', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        updateCarouselCard(cardIndex, 'header', {
          format: detectedMediaType,
          mediaHandle: data.h,
          mediaUrl: data.url || URL.createObjectURL(file)
        });
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

  // Authentication settings component
  const renderAuthenticationSettings = () => {
    if (form.category !== 'AUTHENTICATION') return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 rounded-full p-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Authentication Settings</h3>
          <Badge className="ml-auto" variant="default">Required</Badge>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Authentication Template</h4>
              <p className="text-sm text-blue-700">
                This template will be used to send verification codes. WhatsApp will automatically
                generate the code based on your settings below.
              </p>
              <p className="text-xs text-blue-600 mt-3">
                Authentication templates don&apos;t require content, variables, or buttons. WhatsApp will
                generate the message with verification code automatically.
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Configure how your authentication code works. These settings help users understand the code format and expiration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Code format</Label>
            <Select
              value={authSettings.codeLength.toString()}
              onValueChange={(value) => setAuthSettings(prev => ({ ...prev, codeLength: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select code length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4-digit code (e.g., 1234)</SelectItem>
                <SelectItem value="5">5-digit code (e.g., 12345)</SelectItem>
                <SelectItem value="6">6-digit code (e.g., 123456)</SelectItem>
                <SelectItem value="8">8-character alphanumeric (e.g., A12B34CD)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              The length and format of the authentication code you&apos;ll send
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Code expiration time</Label>
            <Select
              value={authSettings.codeExpirationMinutes.toString()}
              onValueChange={(value) => setAuthSettings(prev => ({ ...prev, codeExpirationMinutes: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              How long the code will be valid before expiring
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="code-entry"
              checked={authSettings.addCodeEntryOption}
              onCheckedChange={(checked) => setAuthSettings(prev => ({ ...prev, addCodeEntryOption: checked }))}
            />
            <Label htmlFor="code-entry" className="text-sm font-medium">Add code entry option</Label>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-7">
            Adds a button to your message that helps users easily enter or copy the code
          </p>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Important Notes</h4>
              <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc pl-4">
                <li>Authentication templates cannot be sent to users in India (country code +91)</li>
                <li>WhatsApp will automatically generate the message with verification code</li>
                <li>Authentication templates have a higher delivery priority</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Limited time offer settings component
  const renderLimitedTimeOfferSettings = () => {
    if (form.category !== 'LIMITED_TIME_OFFER') return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 rounded-full p-2">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Limited Time Offer Settings</h3>
          <Badge className="ml-auto" variant="default">Required</Badge>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">Limited Time Offer Template</h4>
              <p className="text-sm text-red-700">
                This template creates urgency with a countdown timer and allows users to copy coupon codes.
                Perfect for flash sales, limited-time promotions, and exclusive offers.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Offer expiration date</Label>
            <Input
              type="date"
              value={form.offerExpirationDate}
              onChange={(e) => {
                setForm(prev => ({ ...prev, offerExpirationDate: e.target.value }));
                updateOfferExpiration(e.target.value, form.offerExpirationTime);
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Offer expiration time</Label>
            <Input
              type="time"
              value={form.offerExpirationTime}
              onChange={(e) => {
                setForm(prev => ({ ...prev, offerExpirationTime: e.target.value }));
                updateOfferExpiration(form.offerExpirationDate, e.target.value);
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-sm font-medium">Coupon code (optional)</Label>
          <Input
            value={form.couponCode}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              setForm(prev => ({ ...prev, couponCode: value }));
              setOfferSettings(prev => ({ ...prev, couponCode: value }));
            }}
            placeholder="e.g., FLASH25, SAVE50"
            maxLength={20}
          />
          <p className="text-xs text-gray-500 mt-1">
            If provided, users can copy this code using a button. Leave empty if not needed.
          </p>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Important Notes</h4>
              <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc pl-4">
                <li>Limited time offers create urgency with countdown timers</li>
                <li>The offer will expire at the specified date and time</li>
                <li>Consider timezone differences for your audience</li>
                <li>You can include both URL and copy code buttons</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to update offer expiration
  const updateOfferExpiration = (date: string, time: string) => {
    if (date && time) {
      const expirationDate = new Date(`${date}T${time}`);
      const expirationTimeMs = expirationDate.getTime();
      setOfferSettings(prev => ({ ...prev, expirationTimeMs }));
    }
  };

  const handleUpdateTemplate = async () => {
    if (!form.name || !form.category || !form.language || !form.wabaId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!validateTemplateName(form.name)) {
      toast.error(nameError || 'Invalid template name');
      return;
    }

    try {
      setUpdating(true);

      // For authentication templates, we'll send minimal required data
      if (form.category === 'AUTHENTICATION') {
        const requestBody = {
          name: form.name,
          category: form.category,
          language: form.language,
          wabaId: form.wabaId,
          authSettings: {
            codeExpirationMinutes: authSettings.codeExpirationMinutes,
            codeLength: authSettings.codeLength,
            addCodeEntryOption: authSettings.addCodeEntryOption
          }
        };

        const response = await fetch(`/api/templates/${templateId}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Authentication template updated successfully!');
          router.push('/templates');
        } else {
          toast.error(data.error || 'Failed to update template');
          console.error('API error details:', data.details);
        }

        setUpdating(false);
        return;
      }

      // For carousel templates
      if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
        if (!form.content) {
          toast.error('Please add body text for your carousel message');
          return;
        }

        if (form.carouselCards.length === 0) {
          toast.error('Please add at least one carousel card');
          return;
        }

        if (form.carouselCards.some(card => !card.body.text)) {
          toast.error('Please add content to all carousel cards');
          return;
        }

        const buttonCounts = form.carouselCards.map(card => card.buttons?.length || 0);
        const firstButtonCount = buttonCounts[0];
        const allSameButtonCount = buttonCounts.every(count => count === firstButtonCount);

        if (!allSameButtonCount) {
          toast.error('All carousel cards must have the same number of buttons');
          return;
        }

        const components = [];

        const bodyComponent: any = {
          type: 'BODY',
          text: form.content
        };

        if (form.variables.length > 0) {
          bodyComponent.example = {
            body_text: [form.variables.map(v => v.example || 'Sample')]
          };
        }

        components.push(bodyComponent);

        const carouselComponent: any = {
          type: 'CAROUSEL',
          cards: form.carouselCards.map(card => {
            const cardData: any = {
              body: {
                text: card.body.text
              }
            };

            if (card.header && card.header.mediaHandle) {
              cardData.header = {
                format: card.header.format,
                example: {
                  header_handle: [card.header.mediaHandle]
                }
              };
            }

            if (card.buttons && card.buttons.length > 0) {
              cardData.buttons = card.buttons.map(button => {
                const buttonObj: any = {
                  type: button.type,
                  text: button.text
                };

                if (button.type === 'URL') {
                  buttonObj.url = button.url;
                } else if (button.type === 'PHONE_NUMBER') {
                  buttonObj.phone_number = button.phone_number;
                }

                return buttonObj;
              });
            }

            return cardData;
          })
        };

        components.push(carouselComponent);

        if (footerText) {
          components.push({
            type: 'FOOTER',
            text: footerText
          });
        }

        const response = await fetch(`/api/templates/${templateId}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            components: components,
            category: form.category
          })
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Carousel template updated successfully! It will be reviewed by WhatsApp.');
          router.push('/templates');
        } else {
          toast.error(data.error || 'Failed to update carousel template');
          console.error('API error details:', data.details);
        }

        setUpdating(false);
        return;
      }

      // For other templates, validate content
      if (!form.content) {
        toast.error('Please enter message content');
        return;
      }

      const components = [];

      // Add header component if present
      if (form.headerType === 'text' && form.headerText) {
        components.push({
          type: 'HEADER',
          format: 'TEXT',
          text: form.headerText
        });
      } else if (['image', 'video', 'document'].includes(form.headerType) && form.mediaHandle) {
        components.push({
          type: 'HEADER',
          format: form.mediaType,
          example: {
            header_handle: [form.mediaHandle]
          }
        });
      }

      // Add body component (required)
      const bodyComponent: any = {
        type: 'BODY',
        text: form.content
      };

      if (form.variables.length > 0) {
        bodyComponent.example = {
          body_text: [form.variables.map(v => v.example)]
        };
      }

      components.push(bodyComponent);

      // Add footer component if present
      if (footerText) {
        components.push({
          type: 'FOOTER',
          text: footerText
        });
      }

      // Add buttons component if present
      if (form.buttons.length > 0) {
        const buttonsComponent: any = {
          type: 'BUTTONS',
          buttons: form.buttons.map(button => {
            const buttonObj: any = {
              type: button.type,
              text: button.text
            };

            if (button.type === 'URL') {
              buttonObj.url = button.url;
              if (button.urlType === 'dynamic') {
                buttonObj.example = [button.urlExample || button.url];
              }
            } else if (button.type === 'PHONE_NUMBER') {
              buttonObj.phone_number = button.phone_number;
            } else if (button.type === 'COPY_CODE') {
              buttonObj.copy_code = button.copy_code;
            }

            return buttonObj;
          })
        };

        components.push(buttonsComponent);
      }

      const response = await fetch(`/api/templates/${templateId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          components: components,
          category: form.category
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Template updated successfully and resubmitted for approval!');
        router.push('/templates');
      } else {
        toast.error(data.error || 'Failed to update template');
        console.error('API error details:', data.details);
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (!form.name || !form.category || !form.language || !form.wabaId) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (nameError) {
        toast.error(nameError);
        return;
      }

      if (form.category === 'AUTHENTICATION') {
        handleUpdateTemplate();
        return;
      }

      if (form.category === 'LIMITED_TIME_OFFER') {
        setCurrentStep(2);
        return;
      }

      if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
        setCurrentStep(2);
        return;
      }
    }

    if (currentStep === 2) {
      if (form.category === 'LIMITED_TIME_OFFER') {
        if (!form.content) {
          toast.error('Please add message content for your limited time offer');
          return;
        }

        if (!form.offerExpirationDate || !form.offerExpirationTime) {
          toast.error('Please set the offer expiration date and time');
          return;
        }

        setCurrentStep(3);
        return;
      }

      if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
        if (!form.content) {
          toast.error('Please add body text for your carousel message');
          return;
        }

        if (form.carouselCards.length === 0) {
          toast.error('Please add at least one carousel card');
          return;
        }

        if (form.carouselCards.some(card => !card.body.text)) {
          toast.error('Please add content to all carousel cards');
          return;
        }

        const buttonCounts = form.carouselCards.map(card => card.buttons?.length || 0);
        const firstButtonCount = buttonCounts[0];
        const allSameButtonCount = buttonCounts.every(count => count === firstButtonCount);

        if (!allSameButtonCount) {
          toast.error('All carousel cards must have the same number of buttons');
          return;
        }

        handleUpdateTemplate();
        return;
      } else {
        if (!form.content) {
          toast.error('Please enter message content');
          return;
        }
      }
    }

    if (currentStep === 3) {
      if (form.category === 'LIMITED_TIME_OFFER') {
        if (form.variables.length > 0) {
          setCurrentStep(4);
        } else {
          handleUpdateTemplate();
        }
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleUpdateTemplate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addVariable = () => {
    const newVariableIndex = form.variables.length + 1;
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const cursorPosition = textarea?.selectionStart || form.content.length;

    const updatedContent =
      form.content.slice(0, cursorPosition) +
      `{{${newVariableIndex}}}` +
      form.content.slice(cursorPosition);

    setForm(prev => ({
      ...prev,
      content: updatedContent,
      variables: [...prev.variables, { name: '', example: '' }]
    }));

    if (form.variables.length === 0 && currentStep === 2) {
      toast.info('Please configure your variable in the Variables step');
    }
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

  const addButton = () => {
    if (form.buttons.length >= 10) {
      toast.error('Maximum of 10 buttons allowed');
      return;
    }

    const newButton: ButtonOption = {
      type: 'URL',
      text: '',
      url: '',
      urlType: 'static'
    };

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

  const insertFormatting = (startTag: string, endTag: string, placeholder: string = '', textareaId: string = 'content') => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    const newText = beforeText + startTag + textToInsert + endTag + afterText;

    if (textareaId === 'carousel-content') {
      setForm(prev => ({ ...prev, content: newText }));
    } else {
      setForm(prev => ({ ...prev, content: newText }));
    }

    setTimeout(() => {
      const newCursorPos = start + startTag.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoryOptions.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getLanguageName = (languageCode: string) => {
    const language = languageOptions.find(l => l.value === languageCode);
    return language ? language.label : languageCode;
  };

  const getPlaceholderForVariable = (index: number) => {
    const placeholders = [
      "John Smith", "SAVE20", "June 30, 2024", "$49.99", "Order #12345"
    ];
    return placeholders[index % placeholders.length];
  };

  // Create step navigation component
  const StepNavigation = () => {
    const progress = calculateProgress();

    if (form.category === 'AUTHENTICATION') {
      return (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Template Edit Progress</h2>
            <span className="text-sm font-medium">{progress}% complete</span>
          </div>

          <Progress value={progress} className="h-2 mb-4" />

          <Tabs value="1" className="w-full">
            <TabsList className="grid grid-cols-1 w-full">
              <TabsTrigger
                value="1"
                className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2 relative"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-green-600 text-white">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-medium text-white">Authentication Template</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      );
    }

    if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
      return (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Template Edit Progress</h2>
            <span className="text-sm font-medium">{progress}% complete</span>
          </div>

          <Progress value={progress} className="h-2 mb-4" />

          <Tabs
            value={currentStep.toString()}
            onValueChange={(value) => setCurrentStep(parseInt(value))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger
                value="1"
                className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    currentStep >= 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {currentStep > 1 ? <Check className="w-3 h-3" /> : "1"}
                  </div>
                  <span className="hidden md:inline">Basic Info</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="2"
                disabled={currentStep < 2}
                className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    currentStep >= 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {currentStep > 2 ? <Check className="w-3 h-3" /> : "2"}
                  </div>
                  <span className="hidden md:inline">Carousel Cards</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      );
    }

    if (form.category === 'LIMITED_TIME_OFFER') {
      const ltoSteps = [
        { number: 1, title: 'Basic Info' },
        { number: 2, title: 'Content & Offer' },
        { number: 3, title: 'Buttons' },
        { number: 4, title: 'Variables' }
      ];

      return (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Limited Time Offer Edit</h2>
            <span className="text-sm font-medium">{progress}% complete</span>
          </div>

          <Progress value={progress} className="h-2 mb-4" />

          <Tabs
            value={currentStep.toString()}
            onValueChange={(value) => setCurrentStep(parseInt(value))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              {ltoSteps.map((step) => (
                <TabsTrigger
                  key={step.number}
                  value={step.number.toString()}
                  disabled={step.number > currentStep}
                  className={cn(
                    "data-[state=active]:bg-primary data-[state=active]:text-white",
                    "gap-2 relative"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      currentStep === step.number
                        ? "bg-red-600 text-white"
                        : currentStep > step.number
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    )}>
                      {currentStep > step.number ? <Check className="w-3 h-3" /> : step.number}
                    </div>
                    <span className="hidden md:inline text-xs">
                      {step.title}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Template Edit Progress</h2>
          <span className="text-sm font-medium">{progress}% complete</span>
        </div>

        <Progress value={progress} className="h-2 mb-4" />

        <Tabs
          value={currentStep.toString()}
          onValueChange={(value) => setCurrentStep(parseInt(value))}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            {steps.map((step) => (
              <TabsTrigger
                key={step.number}
                value={step.number.toString()}
                disabled={step.number > currentStep}
                className={cn(
                  "data-[state=active]:bg-primary data-[state=active]:text-white",
                  "gap-2 relative"
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          currentStep === step.number
                            ? "bg-green-600 text-white"
                            : currentStep > step.number
                              ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                        )}>
                          {currentStep > step.number ? <Check className="w-3 h-3" /> : step.number}
                        </div>
                        <span className={cn(
                          "hidden md:inline",
                          currentStep === step.number ? "font-medium text-white" : ""
                        )}>
                          {step.title}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{step.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    );
  };

  // Helper function to render the basic info step
  const renderBasicInfoStep = () => (
    <div className="space-y-8">
      {/* Template Name */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 rounded-full p-2">
            <Type className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Template Details</h3>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-2 flex items-center">
              Template name
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="inline w-4 h-4 ml-1 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm">
                    <p>Only lowercase letters, numbers, and underscores are allowed</p>
                    <p className="mt-1 text-xs">Example: {form.category === 'CAROUSEL' ? 'product_carousel_2024' : 'summer_sale_2024'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              placeholder={`Enter template name (e.g., ${form.category === 'CAROUSEL' ? 'product_showcase' : 'summer_sale_2024'})`}
              value={form.name}
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                setForm(prev => ({ ...prev, name: value }));
                validateTemplateName(value);
              }}
              className={cn("mb-2", nameError && "border-red-500 focus-visible:ring-red-500")}
            />
            <div className="flex items-start gap-2">
              {nameError ? (
                <div className="flex items-center text-xs text-red-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {nameError}
                </div>
              ) : (
                <div className="flex items-center text-xs text-gray-500">
                  <Check className="h-3 w-3 mr-1 text-green-500" />
                  Only lowercase letters(a), numbers(0) and underscore (_) allowed
                </div>
              )}
              <div className="flex-1 text-right text-xs text-gray-500">{form.name.length}/512</div>
            </div>
          </div>

          <Separator />

          {/* Category selection - Read-only for editing */}
          <div>
            <Label className="text-base font-medium mb-2">Category</Label>
            <p className="text-sm text-gray-500 mb-4">
              Template category cannot be changed after creation.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {categoryOptions.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "relative p-2 rounded-lg border-2 transition-all",
                    form.category === category.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 opacity-50"
                  )}
                >
                  {form.category === category.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {category.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language and Business */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 rounded-full p-2">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-medium">Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label className="text-base font-medium mb-2">Language</Label>
            <p className="text-sm text-gray-500 mb-3">Language cannot be changed after creation</p>
            <Select value={form.language} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-base font-medium mb-2">Business</Label>
            <p className="text-sm text-gray-500 mb-3">Business account cannot be changed after creation</p>
            <Select value={form.wabaId} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent>
                {wabaAccounts.map(account => (
                  <SelectItem key={account.wabaId} value={account.wabaId}>
                    {account.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    if (form.category === 'AUTHENTICATION') {
      return (
        <div className="space-y-8">
          {renderBasicInfoStep()}
          {renderAuthenticationSettings()}

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Ready to Update</h3>
            </div>

            <p className="text-sm text-gray-700 mb-4">
              Your authentication template is ready for update. Changes will be applied immediately.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Template Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{form.name || "Not set"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium">Authentication</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Language:</span>
                  <span className="font-medium">{getLanguageName(form.language) || "Not set"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Code Format:</span>
                  <span className="font-medium">{authSettings.codeLength}-digit code</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Expiration:</span>
                  <span className="font-medium">{authSettings.codeExpirationMinutes} minutes</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Code Entry Button:</span>
                  <span className="font-medium">{authSettings.addCodeEntryOption ? "Yes" : "No"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // For carousel templates
    if (form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') {
      switch (currentStep) {
        case 1:
          return renderBasicInfoStep();

        case 2:
          return (
            <div className="space-y-8">
              {/* Body Section for Carousel */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Message Body</h3>
                  <Badge variant="default" className="ml-auto">Required</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Add introductory text that will appear before your carousel cards. This helps provide context for your carousel.
                </p>

                <div className="relative">
                  <Textarea
                    id="carousel-content"
                    placeholder="Type your message content here... This will appear before the carousel cards."
                    rows={4}
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    className="resize-none font-medium"
                    maxLength={1024}
                  />

                  <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-sm border">
                    <TooltipProvider>
                      <div className="flex">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => insertFormatting('*', '*', 'bold', 'carousel-content')}
                              className="px-2 h-8"
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bold text</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => insertFormatting('_', '_', 'italic', 'carousel-content')}
                              className="px-2 h-8"
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Italic text</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => insertFormatting('~', '~', 'strikethrough', 'carousel-content')}
                              className="px-2 h-8"
                            >
                              <Strikethrough className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Strikethrough text</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addVariable}
                    className="text-primary border-primary/30"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add variable
                  </Button>

                  <div className="flex items-center text-xs">
                    <div className={cn(
                      "text-gray-500",
                      form.content.length > 1000 ? "text-red-500" : form.content.length > 800 ? "text-amber-500" : ""
                    )}>
                      {form.content.length}/1024 characters
                    </div>
                  </div>
                </div>

                {/* Show variables if any */}
                {form.variables.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Variables in your message:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                          {`{{${index + 1}}}`} → {variable.example || 'No example set'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Carousel Cards Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <LayoutIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Carousel Cards</h3>
                  <Badge variant="default" className="ml-auto">Required</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Create multiple cards that users can swipe through. Each card can have an image/video, text, and up to 2 buttons.
                  Minimum 1 card required, maximum 10 cards allowed.
                </p>

                {/* Show button count validation warning if cards have different button counts */}
                {form.carouselCards.length > 1 && (() => {
                  const buttonCounts = form.carouselCards.map(card => card.buttons?.length || 0);
                  const firstButtonCount = buttonCounts[0];
                  const allSameButtonCount = buttonCounts.every(count => count === firstButtonCount);

                  if (!allSameButtonCount) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-red-800 mb-1">Button Count Mismatch</h4>
                            <p className="text-sm text-red-700">
                              All carousel cards must have the same number of buttons. Currently you have cards with {buttonCounts.join(', ')} buttons respectively.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {form.carouselCards.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center mb-3">
                      <LayoutIcon className="h-6 w-6 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium mb-1">No cards added</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Add your first carousel card to get started
                    </p>
                    <Button onClick={addCarouselCard} className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {form.carouselCards.map((card, cardIndex) => (
                      <div key={cardIndex} className="border rounded-lg p-6 relative bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                              {cardIndex + 1}
                            </div>
                            Card {cardIndex + 1}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeCarouselCard(cardIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Card Media */}
                        <div className="mb-6">
                          <Label className="text-sm font-medium mb-2 block">Card Media (Optional)</Label>
                          <p className="text-xs text-gray-500 mb-3">Add an image or video to make your card more engaging</p>

                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-auto">
                              <Input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleCarouselFileUpload(file, cardIndex);
                                }}
                                disabled={uploading}
                                className="hidden"
                                id={`card-media-${cardIndex}`}
                              />
                              <Label
                                htmlFor={`card-media-${cardIndex}`}
                                className={cn(
                                  "cursor-pointer w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                  "bg-primary text-white hover:bg-primary/90"
                                )}
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload media
                                  </>
                                )}
                              </Label>
                            </div>

                            {card.header?.mediaHandle && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <div>
                                  <span className="text-sm text-green-700">Media uploaded successfully</span>
                                  <p className="text-xs text-green-600">Ready to use in carousel</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="mb-6">
                          <Label className="text-sm font-medium mb-2 block">Card Content *</Label>
                          <Textarea
                            placeholder="Enter content for this card..."
                            rows={3}
                            value={card.body.text}
                            onChange={(e) => updateCarouselCard(cardIndex, 'body.text', e.target.value)}
                            className="resize-none"
                            maxLength={160}
                          />
                          <div className="flex justify-end text-xs text-gray-500 mt-1">
                            {card.body.text.length}/160 characters
                          </div>
                        </div>

                        {/* Card Buttons */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium">Card Buttons (Optional)</Label>
                            <Badge variant="outline" className="text-xs">Max 2 per card</Badge>
                          </div>

                          {card.buttons && card.buttons.length > 0 ? (
                            <div className="space-y-4">
                              {card.buttons.map((button, buttonIndex) => (
                                <div key={buttonIndex} className="border rounded-lg p-4 bg-white">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium">Button {buttonIndex + 1}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                                      onClick={() => removeCarouselCardButton(cardIndex, buttonIndex)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs mb-1 block">Button type</Label>
                                      <Select
                                        value={button.type}
                                        onValueChange={(value) => updateCarouselCardButton(cardIndex, buttonIndex, 'type', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="QUICK_REPLY">
                                            <div className="flex items-center">
                                              <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                                              Quick reply
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="URL">
                                            <div className="flex items-center">
                                              <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                                              Call-to-Action (URL)
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-xs mb-1 block">Button text</Label>
                                      <div className="relative">
                                        <Input
                                          value={button.text}
                                          onChange={(e) => updateCarouselCardButton(cardIndex, buttonIndex, 'text', e.target.value)}
                                          maxLength={20}
                                          placeholder={button.type === 'URL' ? 'Visit Website' : 'Reply'}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                          {button.text.length}/20
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {button.type === 'URL' && (
                                    <div className="mt-3">
                                      <Label className="text-xs mb-1 block">Website URL</Label>
                                      <Input
                                        value={button.url || ''}
                                        onChange={(e) => updateCarouselCardButton(cardIndex, buttonIndex, 'url', e.target.value)}
                                        placeholder="https://example.com"
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Enter the full URL where users will be directed when they tap this button
                                      </p>
                                    </div>
                                  )}

                                  {button.type === 'QUICK_REPLY' && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                                      <p className="text-xs text-purple-700">
                                        <Info className="inline h-3 w-3 mr-1" />
                                        Quick reply buttons send the button text back as a message when tapped
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {(!card.buttons || card.buttons.length < 2) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addButtonToCarouselCard(cardIndex)}
                              className="w-full border-dashed"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add button to card
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addCarouselCard}
                      className="w-full py-6 border-dashed"
                      disabled={form.carouselCards.length >= 10}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {form.carouselCards.length >= 10 ?
                        "Maximum cards reached (10)" :
                        `Add another card (${form.carouselCards.length}/10)`}
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">Important Carousel Requirements</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• All cards must have the same number of buttons</li>
                      <li>• Maximum 10 cards, minimum 1 card required</li>
                      <li>• Each card can have up to 2 buttons</li>
                      <li>• Only Quick Reply and Call-to-Action (URL) buttons allowed</li>
                      <li>• Carousel templates do not support footer text</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    // For limited time offer templates
    if (form.category === 'LIMITED_TIME_OFFER') {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-8">
              {renderBasicInfoStep()}
              {renderLimitedTimeOfferSettings()}
            </div>
          );

        case 2:
          return (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-full p-2">
                      <LayoutIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Header</h3>
                  </div>
                  <Badge variant="outline" className="text-gray-500">Optional</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Add a header to make your limited time offer more visually appealing. Images work great for promotional content.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['none', 'text', 'image'].map((type) => (
                    <Button
                      key={type}
                      variant={form.headerType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        headerType: type as any,
                        mediaType: type === 'image' ? 'IMAGE' : ''
                      }))}
                      className={cn(
                        "capitalize px-4 py-2",
                        form.headerType === type ? "bg-primary hover:bg-primary/90" : ""
                      )}
                    >
                      {type === 'none' && <Minus className="h-4 w-4 mr-2" />}
                      {type === 'text' && <Type className="h-4 w-4 mr-2" />}
                      {type === 'image' && <Image className="h-4 w-4 mr-2" />}
                      {type === 'none' ? 'No header' : type}
                    </Button>
                  ))}
                </div>

                {form.headerType === 'text' && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter header text... (e.g., 🔥 FLASH SALE ALERT!)"
                      value={form.headerText}
                      onChange={(e) => setForm(prev => ({ ...prev, headerText: e.target.value }))}
                      maxLength={60}
                      className="transition-all"
                    />
                    <div className="flex justify-end text-xs text-gray-500">
                      {form.headerText.length}/60 characters
                    </div>
                  </div>
                )}

                {form.headerType === 'image' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Image format: JPG, PNG (max 5 MB) - Use high-quality promotional images
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="w-full sm:w-auto">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                          disabled={uploading}
                          className="hidden"
                          id="file-upload"
                        />
                        <Label
                          htmlFor="file-upload"
                          className={cn(
                            "cursor-pointer w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                            "bg-primary text-white hover:bg-primary/90"
                          )}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload promotional image
                            </>
                          )}
                        </Label>
                      </div>
                    </div>

                    {form.mediaHandle && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-green-700">Image uploaded successfully</span>
                          <p className="text-xs text-green-600 mt-1">Your promotional image is ready to use</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Body Section for LTO */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Offer Message</h3>
                  <Badge variant="default" className="ml-auto">Required</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  Write your promotional message. Create urgency and highlight the value of your limited time offer.
                </p>

                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Hey {{1}}! 🎉 Don't miss out on our FLASH SALE! Get {{2}}% OFF on all items. Use code {{3}} before time runs out!"
                    rows={6}
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    className="resize-none font-medium"
                  />

                  <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-sm border">
                    <TooltipProvider>
                      <div className="flex">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => insertFormatting('*', '*', 'bold')}
                              className="px-2 h-8"
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bold text</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => insertFormatting('_', '_', 'italic')}
                              className="px-2 h-8"
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Italic text</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => insertFormatting('~', '~', 'strikethrough')}
                              className="px-2 h-8"
                            >
                              <Strikethrough className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Strikethrough text</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addVariable}
                    className="text-primary border-primary/30"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add variable
                  </Button>

                  <div className="flex items-center text-xs">
                    <div className={cn(
                      "text-gray-500",
                      characterCount > 1000 ? "text-red-500" : characterCount > 800 ? "text-amber-500" : ""
                    )}>
                      {characterCount}/1024 characters
                    </div>
                  </div>
                </div>

                {/* Show variables if any */}
                {form.variables.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Variables in your message:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                          {`{{${index + 1}}}`} → {variable.example || 'No example set'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Offer Countdown Preview */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Countdown Timer Preview</h4>
                    <p className="text-sm text-red-700">
                      Your offer expires on{' '}
                      <span className="font-medium">
                        {form.offerExpirationDate && form.offerExpirationTime ?
                          new Date(`${form.offerExpirationDate}T${form.offerExpirationTime}`).toLocaleString() :
                          'Not set'
                        }
                      </span>
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      WhatsApp will automatically show a countdown timer to create urgency
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 3:
          return (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <MousePointerClick className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Action buttons for your offer</h3>
                  <Badge variant="outline" className="ml-auto text-gray-500">Optional</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Add buttons to help users take action on your limited time offer. Consider adding both a website link and a copy code button.
                </p>

                {form.buttons.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center mb-3">
                      <MousePointerClick className="h-6 w-6 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-medium mb-1">No buttons added</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Add buttons to make it easy for customers to take action on your offer
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={addButton} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add button
                      </Button>
                      {form.couponCode && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            addButton();
                            // Auto-set as copy code button
                            setTimeout(() => {
                              setForm(prev => ({
                                ...prev,
                                buttons: prev.buttons.map((btn, idx) =>
                                  idx === prev.buttons.length - 1 ?
                                    { ...btn, type: 'COPY_CODE', text: 'Copy Code', copy_code: form.couponCode } :
                                    btn
                                )
                              }));
                            }, 100);
                          }}
                          className="border-primary text-primary"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Add copy code button
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {form.buttons.map((button, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-5 mb-4 relative transition-all hover:shadow-sm"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-3 right-3 h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => removeButton(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <Label className="mb-1.5 block">Button type</Label>
                            <Select
                              value={button.type}
                              onValueChange={(value) => updateButton(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="URL">
                                  <div className="flex items-center">
                                    <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                                    Visit website
                                  </div>
                                </SelectItem>
                                <SelectItem value="COPY_CODE">
                                  <div className="flex items-center">
                                    <Copy className="h-4 w-4 mr-2 text-amber-500" />
                                    Copy offer code
                                  </div>
                                </SelectItem>
                                <SelectItem value="QUICK_REPLY">
                                  <div className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                                    Quick reply
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="mb-1.5 block">Button text</Label>
                            <div className="relative">
                              <Input
                                value={button.text}
                                onChange={(e) => updateButton(index, 'text', e.target.value)}
                                maxLength={25}
                                placeholder={
                                  button.type === 'URL' ? 'Shop Now' :
                                    button.type === 'COPY_CODE' ? 'Copy Code' :
                                      'Reply'
                                }
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                {button.text.length}/25
                              </div>
                            </div>
                          </div>
                        </div>

                        {button.type === 'URL' && (
                          <div className="space-y-5 mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div>
                              <Label className="mb-1.5 block text-sm">Website URL</Label>
                              <div className="relative">
                                <Input
                                  value={button.url || ''}
                                  onChange={(e) => updateButton(index, 'url', e.target.value)}
                                  placeholder="https://yourstore.com/sale"
                                  className="pr-16"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                  {(button.url || '').length}/2000
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Direct customers to your sale page or product catalog
                              </p>
                            </div>
                          </div>
                        )}

                        {button.type === 'COPY_CODE' && (
                          <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                            <Label className="mb-1.5 block text-sm">Coupon code</Label>
                            <Input
                              value={button.copy_code || form.couponCode || ''}
                              onChange={(e) => updateButton(index, 'copy_code', e.target.value)}
                              placeholder={form.couponCode || "FLASH50"}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              This code will be copied to clipboard when user taps the button
                            </p>
                            {form.couponCode && !button.copy_code && (
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateButton(index, 'copy_code', form.couponCode)}
                                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                                >
                                  Use offer code: {form.couponCode}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {button.type === 'QUICK_REPLY' && (
                          <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                            <p className="text-xs text-purple-700">
                              <Info className="inline h-3 w-3 mr-1" />
                              Quick reply buttons send the button text back as a message when tapped
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={addButton}
                      className="w-full py-6 border-dashed"
                      disabled={form.buttons.length >= 3}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {form.buttons.length >= 3 ?
                        "Maximum buttons reached (3)" :
                        `Add another button (${form.buttons.length}/3)`}
                    </Button>
                  </div>
                )}

                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Limited Time Offer Tips</h4>
                      <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc pl-4">
                        <li>Use &quot;Copy Code&quot; buttons to make it easy for customers to use discount codes</li>
                        <li>Include a &quot;Shop Now&quot; URL button to drive traffic to your sale page</li>
                        <li>Keep button text short and action-oriented</li>
                        <li>The countdown timer will create urgency automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );

        case 4:
          return (
            <div className="space-y-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Limited Time Offer Variables</h4>
                    <p className="text-sm text-red-700">
                      Configure variables for personalization in your promotional message. Common variables include customer name,
                      discount percentage, coupon codes, and expiration dates.
                    </p>
                  </div>
                </div>
              </div>

              {form.variables.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Brackets className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Variable Configuration</h3>
                    <Badge className="ml-auto bg-amber-500">Required</Badge>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    Provide example values for each variable in your limited time offer message.
                    These examples help WhatsApp understand your content during the review process.
                  </p>

                  <div className="space-y-4">
                    {form.variables.map((variable, index) => (
                      <div key={index} className="bg-white border rounded-lg transition-all hover:shadow-sm">
                        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">Variable {index + 1}</h4>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeVariable(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="p-4">
                          <Label className="text-sm font-medium mb-2 block">Example value</Label>
                          <p className="text-xs text-gray-500 mb-3">
                            Enter a sample value for this variable in your promotional message
                          </p>
                          <div className="flex gap-3">
                            <Input
                              value={variable.example}
                              onChange={(e) => updateVariable(index, 'example', e.target.value)}
                              placeholder={`e.g., ${getPlaceholderForVariable(index)}`}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-500"
                              onClick={() => updateVariable(index, 'example', getPlaceholderForVariable(index))}
                            >
                              Use sample
                            </Button>
                          </div>

                          {!variable.example && (
                            <div className="mt-2 flex items-center text-amber-600 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              This variable requires an example value
                            </div>
                          )}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
                          <div className="flex items-center text-xs text-gray-500">
                            <Info className="h-3 w-3 mr-1 text-gray-400" />
                            Variable preview in message: <span className="font-medium ml-1 text-gray-700">{variable.example || "Not set"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentStep(2);
                        setTimeout(addVariable, 500);
                      }}
                      className="text-primary border-primary/30"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add another variable
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center mb-3">
                      <MessageSquare className="h-7 w-7 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">No variables to configure</h4>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Your limited time offer doesn&apos;t contain any variables. Variables allow you to personalize
                      messages with customer names, discount amounts, or coupon codes.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep(2);
                        setTimeout(addVariable, 500);
                      }}
                      className="bg-primary hover:bg-primary/90 text-white hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add a variable to your message
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium">Ready to Update</h3>
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  Your limited time offer template is ready for update. Changes will be applied and the template will be resubmitted for review.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Template Summary</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{form.name || "Not set"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">Limited Time Offer</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Language:</span>
                      <span className="font-medium">{getLanguageName(form.language) || "Not set"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Expires:</span>
                      <span className="font-medium">
                        {form.offerExpirationDate && form.offerExpirationTime ?
                          new Date(`${form.offerExpirationDate}T${form.offerExpirationTime}`).toLocaleDateString() :
                          'Not set'
                        }
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Variables:</span>
                      <span className="font-medium">{form.variables.length}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">Buttons:</span>
                      <span className="font-medium">{form.buttons.length}</span>
                    </li>
                    {form.couponCode && (
                      <li className="flex justify-between">
                        <span className="text-gray-500">Coupon Code:</span>
                        <span className="font-medium">{form.couponCode}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    // Standard template steps (existing implementation for other template types)
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();

      case 2:
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 rounded-full p-2">
                    <LayoutIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Header</h3>
                </div>
                <Badge variant="outline" className="text-gray-500">Optional</Badge>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Add a title for your message. Headers make your messages visually engaging.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {['none', 'text', 'image', 'video', 'document'].map((type) => (
                  <Button
                    key={type}
                    variant={form.headerType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      headerType: type as any,
                      mediaType: type === 'image' ? 'IMAGE' : type === 'video' ? 'VIDEO' : type === 'document' ? 'DOCUMENT' : ''
                    }))}
                    className={cn(
                      "capitalize px-4 py-2",
                      form.headerType === type ? "bg-primary hover:bg-primary/90" : ""
                    )}
                  >
                    {type === 'none' && <Minus className="h-4 w-4 mr-2" />}
                    {type === 'text' && <Type className="h-4 w-4 mr-2" />}
                    {type === 'image' && <Image className="h-4 w-4 mr-2" />}
                    {type === 'video' && <Video className="h-4 w-4 mr-2" />}
                    {type === 'document' && <FileText className="h-4 w-4 mr-2" />}
                    {type === 'none' ? 'No header' : type}
                  </Button>
                ))}
              </div>

              {form.headerType === 'text' && (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter header text..."
                    value={form.headerText}
                    onChange={(e) => setForm(prev => ({ ...prev, headerText: e.target.value }))}
                    maxLength={60}
                    className="transition-all"
                  />
                  <div className="flex justify-end text-xs text-gray-500">
                    {form.headerText.length}/60 characters
                  </div>
                </div>
              )}

              {['image', 'video', 'document'].includes(form.headerType) && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  {form.headerType === 'video' && (
                    <div className="text-sm flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Video format: MP4 (max 16 MB)
                    </div>
                  )}

                  {form.headerType === 'image' && (
                    <div className="text-sm flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Image format: JPG, PNG (max 5 MB)
                    </div>
                  )}

                  {form.headerType === 'document' && (
                    <div className="text-sm flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Document format: PDF, DOC, DOCX (max 100 MB)
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-auto">
                      <Input
                        type="file"
                        accept={
                          form.headerType === 'image' ? 'image/*' :
                            form.headerType === 'video' ? 'video/*' :
                              '.pdf,.doc,.docx'
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className={cn(
                          "cursor-pointer w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                          "bg-primary text-white hover:bg-primary/90"
                        )}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload {form.headerType}
                          </>
                        )}
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Separator orientation="vertical" className="hidden sm:block h-8" />
                      <span className="text-sm text-gray-500">or</span>
                      <Button variant="outline" size="sm">
                        <Link2 className="h-4 w-4 mr-2" />
                        Enter URL
                      </Button>
                    </div>
                  </div>

                  {form.mediaHandle && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-green-700">File uploaded successfully</span>
                        <p className="text-xs text-green-600 mt-1">Your file is ready to use in the template</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Body Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Message Body</h3>
                <Badge variant="default" className="ml-auto">Required</Badge>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Write your message content. You can include formatting and variables.
              </p>

              <div className="relative">
                <Textarea
                  id="content"
                  placeholder="Type your message content here... Use {{1}} for variables."
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  className="resize-none font-medium"
                />

                <div className="absolute bottom-2 right-2 bg-white rounded-md shadow-sm border">
                  <TooltipProvider>
                    <div className="flex">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('*', '*', 'bold')}
                            className="px-2 h-8"
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bold text</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('_', '_', 'italic')}
                            className="px-2 h-8"
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Italic text</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('~', '~', 'strikethrough')}
                            className="px-2 h-8"
                          >
                            <Strikethrough className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Strikethrough text</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariable}
                  className="text-primary border-primary/30"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add variable
                </Button>

                <div className="flex items-center text-xs">
                  <div className={cn(
                    "text-gray-500",
                    characterCount > 1000 ? "text-red-500" : characterCount > 800 ? "text-amber-500" : ""
                  )}>
                    {characterCount}/1024 characters
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 rounded-full p-2">
                    <AlignLeft className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Footer</h3>
                </div>
                <Badge variant="outline" className="text-gray-500">Optional</Badge>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Add footer text that will appear at the bottom of your message.
              </p>

              <div className="space-y-2">
                <Input
                  placeholder="Enter footer text (e.g., Thank you for your business)"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  maxLength={60}
                />
                <div className="flex justify-end text-xs text-gray-500">
                  {footerText.length}/60 characters
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Call to action buttons</h3>
                <Badge variant="outline" className="ml-auto text-gray-500">Optional</Badge>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Add interactive buttons to drive engagement with your messages.
                <a href="#" className="text-primary ml-1 hover:underline">Learn more about buttons</a>
              </p>

              {form.buttons.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center mb-3">
                    <MousePointerClick className="h-6 w-6 text-gray-500" />
                  </div>
                  <h4 className="text-lg font-medium mb-1">No buttons added</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Add buttons to make your message interactive
                  </p>
                  <Button onClick={addButton} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first button
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {form.buttons.map((button, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-5 mb-4 relative transition-all hover:shadow-sm"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeButton(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <Label className="mb-1.5 block">Button type</Label>
                          <Select
                            value={button.type}
                            onValueChange={(value) => updateButton(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="URL">
                                <div className="flex items-center">
                                  <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                                  Visit website
                                </div>
                              </SelectItem>
                              <SelectItem value="PHONE_NUMBER">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                                  Call phone number
                                </div>
                              </SelectItem>
                              <SelectItem value="QUICK_REPLY">
                                <div className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                                  Quick reply
                                </div>
                              </SelectItem>
                              <SelectItem value="COPY_CODE">
                                <div className="flex items-center">
                                  <Copy className="h-4 w-4 mr-2 text-amber-500" />
                                  Copy offer code
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-1.5 block">Button text</Label>
                          <div className="relative">
                            <Input
                              value={button.text}
                              onChange={(e) => updateButton(index, 'text', e.target.value)}
                              maxLength={25}
                              placeholder="e.g., Shop Now, Learn More, Get Started"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                              {button.text.length}/25
                            </div>
                          </div>
                        </div>
                      </div>

                      {button.type === 'URL' && (
                        <div className="space-y-5 mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div className="grid grid-cols-[120px,1fr] gap-4">
                            <div>
                              <Label className="mb-1.5 block text-sm">URL type</Label>
                              <Select
                                value={button.urlType || 'static'}
                                onValueChange={(value) => updateButton(index, 'urlType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="static">Static URL</SelectItem>
                                  <SelectItem value="dynamic">Dynamic URL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="mb-1.5 block text-sm">Website URL</Label>
                              <div className="relative">
                                <Input
                                  value={button.url || ''}
                                  onChange={(e) => updateButton(index, 'url', e.target.value)}
                                  placeholder={button.urlType === 'static' ? "https://example.com/product" : "https://example.com/product?id={{1}}"}
                                  className="pr-16"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                  {(button.url || '').length}/2000
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch id={`analytics-${index}`} />
                            <Label htmlFor={`analytics-${index}`} className="text-sm font-normal">
                              Enable analytics tracking
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="inline w-3.5 h-3.5 ml-1 cursor-help text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Track clicks and engagement on this link</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                          </div>

                          {button.urlType === 'dynamic' && (
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm" className="text-primary">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Add variable to URL
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {button.type === 'PHONE_NUMBER' && (
                        <div className="p-4 bg-green-50/50 rounded-lg border border-green-100">
                          <Label className="mb-1.5 block text-sm">Phone number</Label>
                          <Input
                            value={button.phone_number || ''}
                            onChange={(e) => updateButton(index, 'phone_number', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Include country code (e.g., +1 for US)
                          </p>
                        </div>
                      )}

                      {button.type === 'COPY_CODE' && (
                        <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                          <Label className="mb-1.5 block text-sm">Offer code</Label>
                          <Input
                            value={button.copy_code || ''}
                            onChange={(e) => updateButton(index, 'copy_code', e.target.value)}
                            placeholder="SUMMER20"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            This code will be copied to clipboard when user taps the button
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addButton}
                    className="w-full py-6 border-dashed"
                    disabled={form.buttons.length >= 10}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {form.buttons.length >= 10 ?
                      "Maximum buttons reached (10)" :
                      `Add another button (${form.buttons.length}/10)`}
                  </Button>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Switch id="stop-button" />
                  <Label htmlFor="stop-button" className="text-sm font-medium">
                    Add opt-out button
                  </Label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  Add a button allowing users to opt out of receiving messages
                  <a href="#" className="text-primary ml-1 hover:underline">Learn more</a>
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-2">Template Review Information</h4>
                  <p className="text-sm text-gray-700">
                    Meta will review this template and its variables to ensure compliance with WhatsApp&apos;s Business Policy.
                    Providing clear example values helps expedite the approval process.
                  </p>
                </div>
              </div>
            </div>

            {form.variables.length > 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Brackets className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Variable Configuration</h3>
                  <Badge className="ml-auto bg-amber-500">Required</Badge>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Provide example values for each variable you&apos;ve added to your template.
                  These examples should represent actual content you&apos;ll send to customers.
                </p>

                <div className="space-y-4">
                  {form.variables.map((variable, index) => (
                    <div key={index} className="bg-white border rounded-lg transition-all hover:shadow-sm">
                      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">Variable {index + 1}</h4>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                          onClick={() => removeVariable(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="p-4">
                        <Label className="text-sm font-medium mb-2 block">Example value</Label>
                        <p className="text-xs text-gray-500 mb-3">
                          Enter a sample value that represents what you&apos;ll send to this variable
                        </p>
                        <div className="flex gap-3">
                          <Input
                            value={variable.example}
                            onChange={(e) => updateVariable(index, 'example', e.target.value)}
                            placeholder={`e.g., ${getPlaceholderForVariable(index)}`}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-500"
                            onClick={() => updateVariable(index, 'example', getPlaceholderForVariable(index))}
                          >
                            Use sample
                          </Button>
                        </div>

                        {!variable.example && (
                          <div className="mt-2 flex items-center text-amber-600 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            This variable requires an example value
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
                        <div className="flex items-center text-xs text-gray-500">
                          <Info className="h-3 w-3 mr-1 text-gray-400" />
                          Variable preview in message: <span className="font-medium ml-1 text-gray-700">{variable.example || "Not set"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentStep(2);
                      setTimeout(addVariable, 500);
                    }}
                    className="text-primary border-primary/30"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add another variable
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center mb-3">
                    <MessageSquare className="h-7 w-7 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No variables to configure</h4>
                  <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                    Your message doesn&apos;t contain any variables. Variables allow you to personalize
                    messages by dynamically inserting content.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(2);
                      setTimeout(addVariable, 500);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add a variable to your message
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-medium">Ready to Update</h3>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                Your template is ready for update. Changes will be applied and the template will be resubmitted for approval.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Template Summary</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium">{form.name || "Not set"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{getCategoryName(form.category) || "Not set"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Language:</span>
                    <span className="font-medium">{getLanguageName(form.language) || "Not set"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Variables:</span>
                    <span className="font-medium">{form.variables.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">Buttons:</span>
                    <span className="font-medium">{form.buttons.length}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading template...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-gray-600">Template not found</p>
            <Button
              variant="outline"
              onClick={() => router.push('/templates')}
              className="mt-4"
            >
              Back to Templates
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold">Edit Template</h1>
                <p className="text-sm text-gray-600">
                  {template.name} • {getCategoryName(template.category)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/templates')}
                className="text-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side - Form */}
            <div className="flex-1">
              {/* Progress Steps */}
              <StepNavigation />

              {/* Step Content */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {currentStep > 1 && form.category !== 'AUTHENTICATION' && form.category !== 'CAROUSEL' && (
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className={cn(
                    "ml-auto",
                    "bg-primary hover:bg-primary/80 cursor-pointer text-white"
                  )}
                  disabled={updating || (currentStep === 1 && nameError !== null)}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    (form.category === 'AUTHENTICATION' || currentStep === 4 ||
                      ((form.category === 'CAROUSEL' || form.category === 'CAROUSEL_UTILITY') && currentStep === 2)
                    ) ? (
                      'Update Template'
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )
                  )}
                </Button>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="w-full lg:w-96">
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Message preview</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={deviceType === 'iphone' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeviceType('iphone')}
                      className="h-8 px-3"
                    >
                      <FaApple className="mr-1" /> iPhone
                    </Button>
                    <Button
                      variant={deviceType === 'android' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeviceType('android')}
                      className="h-8 px-3"
                    >
                      <FaAndroid className="mr-1" /> Android
                    </Button>
                  </div>
                </div>
                <WhatsAppPreview
                  form={form}
                  deviceType={deviceType}
                  footerText={footerText}
                  authSettings={authSettings}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
