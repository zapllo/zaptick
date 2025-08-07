"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Phone, Mail, Tag } from 'lucide-react';
import CreateLeadModal from '@/components/crm-integration/CreateLeadModal';

interface ContactListProps {
  contacts: any[];
  wabaId: string;
  hasCrmIntegration: boolean;
}

export default function ContactList({ contacts, wabaId, hasCrmIntegration }: ContactListProps) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const handleCreateLead = (contact: any) => {
    setSelectedContact(contact);
    setIsLeadModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <Card key={contact._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{contact.name}</CardTitle>
              <div className="flex items-center gap-2">
                {contact.tags?.length > 0 && (
                  <div className="flex gap-1">
                    {contact.tags.slice(0, 2).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{contact.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                <Badge variant={contact.isActive ? "default" : "secondary"}>
                  {contact.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {contact.phone}
              </div>
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </div>
              )}
            </div>

            {contact.notes && (
              <p className="text-sm text-muted-foreground">{contact.notes}</p>
            )}

            {contact.lastMessageAt && (
              <p className="text-xs text-muted-foreground">
                Last message: {new Date(contact.lastMessageAt).toLocaleString()}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Chat
              </Button>
              
              {hasCrmIntegration && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleCreateLead(contact)}
                >
                  Create Lead
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Create Lead Modal */}
      <CreateLeadModal
        open={isLeadModalOpen}
        onOpenChange={setIsLeadModalOpen}
        contact={selectedContact}
        wabaId={wabaId}
      />
    </div>
  );
}