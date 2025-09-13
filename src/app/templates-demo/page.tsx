"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaWhatsapp } from "react-icons/fa";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  Bold,
  Italic,
  Underline,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Template form interface
interface TemplateForm {
  name: string;
  category: string;
  buttonType: string;
  language: string;
  headerType: 'none' | 'text' | 'image' | 'video' | 'document';
  headerText: string;
  bodyText: string;
  footerText: string;
  buttons: {
    type: string;
    text: string;
    value: string;
  }[];
  enableButtonTracking: boolean;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("english");
  const [characterCount, setCharacterCount] = useState(0);
  const [footerCharCount, setFooterCharCount] = useState(0);
  const [showUrlInfo, setShowUrlInfo] = useState(false);

  const [form, setForm] = useState<TemplateForm>({
    name: "",
    category: "",
    buttonType: "",
    language: "english",
    headerType: 'none',
    headerText: "",
    bodyText: "",
    footerText: "",
    buttons: [],
    enableButtonTracking: false
  });

  // Update character count when body text changes
  useEffect(() => {
    setCharacterCount(form.bodyText.length);
  }, [form.bodyText]);

  // Update footer character count
  useEffect(() => {
    setFooterCharCount(form.footerText.length);
  }, [form.footerText]);

  const handleLanguageChange = (value: string) => {
    setActiveTab(value);
    setForm(prev => ({ ...prev, language: value }));
  };

  const handleBodyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, bodyText: e.target.value }));
    setCharacterCount(e.target.value.length);
  };

  const handleFooterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, footerText: e.target.value }));
    setFooterCharCount(e.target.value.length);
  };

  const addCouponCode = () => {
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'coupon', text: '', value: '' }]
    }));
  };

  const addQuickReply = () => {
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'quick_reply', text: '', value: '' }]
    }));
  };

  const addWebsiteUrl = () => {
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'url', text: '', value: '' }]
    }));
  };

  const addPhoneNumber = () => {
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'phone', text: '', value: '' }]
    }));
  };

  const removeButton = (index: number) => {
    setForm(prev => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index)
    }));
  };

  const updateButtonText = (index: number, text: string) => {
    setForm(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) =>
        i === index ? { ...button, text: text } : button
      )
    }));
  };

  const updateButtonValue = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      buttons: prev.buttons.map((button, i) =>
        i === index ? { ...button, value: value } : button
      )
    }));
  };

  const addAnotherWebsiteUrl = () => {
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'url', text: '', value: '' }]
    }));
  };

  const addAnotherQuickReply = () => {
    setForm(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'quick_reply', text: '', value: '' }]
    }));
  };

  const toggleUrlInfo = () => {
    setShowUrlInfo(!showUrlInfo);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Navigation Bar */}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Template Creation Header */}
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

            <Button className="bg-teal-500 hover:bg-teal-600 text-white border-none">
              Submit
            </Button>
          </div>
        </div>

        {/* Template Form */}
        <div className="space-y-8">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template Name */}
            <div>
              <Label htmlFor="template-name" className="text-sm font-medium block mb-1">Template Name</Label>
              <Input
                id="template-name"
                placeholder="Enter template name..."
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="border-gray-300"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium block mb-1">Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger id="category" className="border-gray-300 h-10">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Button Type */}
            <div>
              <Label htmlFor="button-type" className="text-sm font-medium block mb-1">
                Button Type<span className="text-gray-500 font-normal">(Optional)</span>
              </Label>
              <Select value={form.buttonType} onValueChange={(value) => setForm(prev => ({ ...prev, buttonType: value }))}>
                <SelectTrigger id="button-type" className="border-gray-300 h-10">
                  <SelectValue placeholder="Copy Code, URL, Quick Replies etc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="quick_replies">Quick Replies</SelectItem>
                  <SelectItem value="call_to_action">Call to Action</SelectItem>
                  <SelectItem value="copy_code">Copy Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Language Selection */}
          <div>
            <Label className="text-sm font-medium block mb-3">Template(s)</Label>
            <div className="flex flex-wrap gap-3 mb-3">
              <div className={`text-blue-600 ${activeTab === "english" ? "bg-blue-50 border-blue-200" : "bg-gray-100"} rounded-md px-3 py-1 text-sm`}>
                English
              </div>
              <Select value={form.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="border-gray-300 h-8 w-56 bg-white">
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="py-2">
              <p className="text-sm font-medium mb-3">Template for English language</p>
              <Button
                variant="outline"
                className="bg-teal-500 hover:bg-teal-600 text-white border-none text-sm h-9"
              >
                Add Sample
              </Button>
            </div>
          </div>

          {/* Header Section */}
          <div className="p-5 border border-gray-200 rounded-md">
            <h3 className="text-sm font-medium mb-2">Header (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">Add a title, or select the media type you want to get approved for this template&apos;s header</p>

            <RadioGroup
              value={form.headerType}
              onValueChange={(value: 'none' | 'text' | 'image' | 'video' | 'document') =>
                setForm(prev => ({ ...prev, headerType: value }))
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
          </div>

          {/* Body Section */}
          <div className="p-5 border border-gray-200 rounded-md">
            <h3 className="text-sm font-medium mb-2">Body</h3>
            <p className="text-sm text-gray-600 mb-4">The WhatsApp message in the language you have selected</p>

            <Textarea
              placeholder="Enter your message here..."
              rows={5}
              value={form.bodyText}
              onChange={handleBodyTextChange}
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
          </div>

          {/* Footer Section */}
          <div className="p-5 border border-gray-200 rounded-md">
            <h3 className="text-sm font-medium mb-2">Footer (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">Add a short line of text to the bottom of your message template.</p>

            <Input
              placeholder="Enter footer text..."
              value={form.footerText}
              onChange={handleFooterTextChange}
              className="border-gray-300"
              maxLength={60}
            />

            <div className="flex justify-end mt-1 text-xs text-gray-500">
              {footerCharCount}/60
            </div>
          </div>

          {/* Buttons Section */}
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
                  4/10
                </div>
              </div>
            </div>

            {/* Coupon Code Button */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input type="checkbox" id="add-coupon-code" className="mr-2" />
                  <Label htmlFor="add-coupon-code" className="text-sm font-medium">Add Coupon Code</Label>
                </div>
              </div>

              {form.buttons.filter(b => b.type === 'coupon').length > 0 && (
                <div className="pl-6 mt-2 space-y-2">
                  {form.buttons.filter(b => b.type === 'coupon').map((button, index) => (
                    <div key={`coupon-${index}`} className="flex gap-2 items-center">
                      <Input
                        placeholder="Copy Code"
                        value={button.text}
                        onChange={(e) => updateButtonText(
                          form.buttons.findIndex(b => b === button),
                          e.target.value
                        )}
                        className="border-gray-300 w-64"
                      />
                      <Input
                        placeholder="Enter text for coupon code"
                        value={button.value}
                        onChange={(e) => updateButtonValue(
                          form.buttons.findIndex(b => b === button),
                          e.target.value
                        )}
                        className="border-gray-300 flex-1"
                      />
                      <div className="text-xs text-gray-500">0/25</div>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeButton(form.buttons.findIndex(b => b === button))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Replies Buttons */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input type="checkbox" id="add-quick-reply" className="mr-2" />
                  <Label htmlFor="add-quick-reply" className="text-sm font-medium">Add Quick Replies</Label>
                </div>
              </div>

              {form.buttons.filter(b => b.type === 'quick_reply').length > 0 && (
                <div className="pl-6 mt-2 space-y-2">
                  {form.buttons.filter(b => b.type === 'quick_reply').map((button, index) => (
                    <div key={`quick-reply-${index}`} className="flex gap-2 items-center">
                      <Input
                        placeholder="erfefe"
                        value={button.text}
                        onChange={(e) => updateButtonText(
                          form.buttons.findIndex(b => b === button),
                          e.target.value
                        )}
                        className="border-gray-300 flex-1"
                      />
                      <div className="text-xs text-gray-500">0/25</div>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeButton(form.buttons.findIndex(b => b === button))}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-teal-500 border-teal-500 text-xs h-7 mt-1"
                    onClick={addAnotherQuickReply}
                  >
                    <Plus size={14} className="mr-1" /> Add Another Quick Reply
                  </Button>
                </div>
              )}
            </div>

            {/* Website URL Buttons */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input type="checkbox" id="add-website-url" className="mr-2" />
                  <Label htmlFor="add-website-url" className="text-sm font-medium">Add Website URL</Label>
                </div>
              </div>

              {form.buttons.filter(b => b.type === 'url').length > 0 && (
                <div className="pl-6 mt-2 space-y-2">
                  {form.buttons.filter(b => b.type === 'url').map((button, index) => (
                    <div key={`url-${index}`} className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <Select defaultValue="dynamic">
                          <SelectTrigger className="border-gray-300 h-9 w-28">
                            <SelectValue placeholder="Dynamic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dynamic">Dynamic</SelectItem>
                            <SelectItem value="static">Static</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Enter url example: https://example.com/test"
                          value={button.value}
                          onChange={(e) => updateButtonValue(
                            form.buttons.findIndex(b => b === button),
                            e.target.value
                          )}
                          className="border-gray-300 flex-1"
                        />
                        <div className="text-xs text-gray-500">0/2000</div>
                        <button
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeButton(form.buttons.findIndex(b => b === button))}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

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
                              <span className="font-medium">Dynamic portion of URL as a variable -</span> The provided URL should have a variable in place of the dynamic portion of the URL. If your actual URL is <span className="font-medium">https://www.example.com/order/12345</span> where 12345 is the dynamic part, you should enter the URL as <span className="font-medium">https://www.example.com/order/{"{1}"}</span>. You can map {"{1}"} to a user trait / event trait which contains the dynamic portion for each customer.
                            </li>
                            <li>
                              <span className="font-medium">Full URL as a variable -</span> Provide the dynamic URL as <span className="font-medium">https://api.interakt.ai/cta?redirect={"{1}"}</span>. You can map {"{1}"} to a user trait / event trait, which contains the full URL for each customer.
                            </li>
                          </ol>

                          <a href="#" className="text-blue-600 block mt-2">
                            read less
                          </a>
                        </div>
                      )}

                      <div>
                        <Input
                          placeholder="Enter text for the button"
                          value={button.text}
                          onChange={(e) => updateButtonText(
                            form.buttons.findIndex(b => b === button),
                            e.target.value
                          )}
                          className="border-gray-300 w-full"
                        />
                        <div className="flex justify-end mt-1">
                          <div className="text-xs text-gray-500">0/25</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-teal-500 border-teal-500 text-xs h-7 mt-1"
                    onClick={addAnotherWebsiteUrl}
                  >
                    <Plus size={14} className="mr-1" /> Add Another Website URL
                  </Button>
                </div>
              )}
            </div>

            {/* Phone Number Button */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input type="checkbox" id="add-phone-number" className="mr-2" />
                  <Label htmlFor="add-phone-number" className="text-sm font-medium">Add Phone Number</Label>
                </div>
              </div>

              {form.buttons.filter(b => b.type === 'phone').length > 0 && (
                <div className="pl-6 mt-2 space-y-2">
                  {form.buttons.filter(b => b.type === 'phone').map((button, index) => (
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
                          value={button.value}
                          onChange={(e) => updateButtonValue(
                            form.buttons.findIndex(b => b === button),
                            e.target.value
                          )}
                          className="border-gray-300 flex-1"
                        />
                        <div className="text-xs text-gray-500">0/20</div>
                        <button
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => removeButton(form.buttons.findIndex(b => b === button))}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div>
                        <Input
                          placeholder="Enter text for the button"
                          value={button.text}
                          onChange={(e) => updateButtonText(
                            form.buttons.findIndex(b => b === button),
                            e.target.value
                          )}
                          className="border-gray-300 w-full"
                        />
                        <div className="flex justify-end mt-1">
                          <div className="text-xs text-gray-500">0/25</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Button Click Tracking */}
          <div className="p-5 border border-gray-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium mb-1">Enable Button Click Tracking (Optional)</h3>
                <p className="text-sm text-gray-600">You can enable this to track clicks on CTAs or Quick Reply buttons.</p>
              </div>
              <Switch
                checked={form.enableButtonTracking}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, enableButtonTracking: checked }))}
              />
            </div>

            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 flex items-start">
              <AlertTriangle size={16} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Click tracking will work only if the template is sent via Interakt Campaigns. It won&apos;t work if sent via Interakt&apos;s APIs, or via the inbox or any other approach.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Pane - Would be added in real implementation */}
      </div>
    </div>
  );
}
